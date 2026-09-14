/**
 * Video Processing Queue System
 * Uses BullMQ with Redis for reliable job processing
 * Handles: download, transcribe, process, cleanup
 */

const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');

// Redis connection (use environment variable or default)
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

// ═══════════════════════════════════════════════════════════════
// QUEUES
// ═══════════════════════════════════════════════════════════════

/**
 * Video processing queue
 */
const videoQueue = new Queue('video-processing', {
    connection,
    defaultJobOptions: {
        removeOnComplete: 100,    // Keep last 100 completed jobs
        removeOnFail: 50,         // Keep last 50 failed jobs
        attempts: 3,              // Retry up to 3 times
        backoff: {
            type: 'exponential',
            delay: 5000,          // 5s, 10s, 20s
        },
    },
});

/**
 * Cleanup queue (for deleting old files)
 */
const cleanupQueue = new Queue('cleanup', {
    connection,
    defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 20,
    },
});

// ═══════════════════════════════════════════════════════════════
// JOB TYPES
// ═══════════════════════════════════════════════════════════════

const JOB_TYPES = {
    DOWNLOAD: 'download',          // Download video from YouTube
    TRANSCRIBE: 'transcribe',      // Transcribe audio (Whisper)
    PROCESS: 'process',            // Split/crop video
    UPLOAD_CLOUD: 'upload-cloud',  // Upload to S3/R2
    CLEANUP: 'cleanup',            // Delete old files
};

// ═══════════════════════════════════════════════════════════════
// ADD JOBS
// ═══════════════════════════════════════════════════════════════

/**
 * Add a video processing job
 * @param {Object} data - { url, quality, language, options }
 * @returns {Object} job
 */
async function addVideoJob(data) {
    const job = await videoQueue.add(JOB_TYPES.PROCESS, {
        url: data.url,
        quality: data.quality || 'best',
        language: data.language || 'ar',
        options: data.options || {},
        userId: data.userId || 'anonymous',
        createdAt: Date.now(),
    });

    console.log(`[Queue] Job added: ${job.id} for ${data.url}`);
    return job;
}

/**
 * Add a transcription job
 */
async function addTranscribeJob(data) {
    const job = await videoQueue.add(JOB_TYPES.TRANSCRIBE, {
        inputPath: data.inputPath,
        language: data.language || 'ar',
        model: data.model || 'base',
        userId: data.userId || 'anonymous',
    });

    console.log(`[Queue] Transcribe job added: ${job.id}`);
    return job;
}

/**
 * Add a cleanup job
 */
async function addCleanupJob(data) {
    await cleanupQueue.add(JOB_TYPES.CLEANUP, {
        path: data.path,
        olderThan: data.olderThan || 24 * 60 * 60 * 1000, // 24 hours
    });
}

// ═══════════════════════════════════════════════════════════════
// WORKERS
// ═══════════════════════════════════════════════════════════════

/**
 * Video processing worker
 */
const videoWorker = new Worker('video-processing', async (job) => {
    const { url, quality, language, options } = job.data;

    console.log(`[Worker] Processing job ${job.id}: ${url}`);

    try {
        // Step 1: Update progress
        await job.updateProgress({ stage: 'downloading', percent: 0 });

        // Step 2: Download video (if URL provided)
        let inputPath;
        if (url) {
            const { downloadVideo } = require('./downloader');
            inputPath = await downloadVideo(url, (percent) => {
                job.updateProgress({ stage: 'downloading', percent });
            }, quality);
        } else {
            throw new Error('No URL provided');
        }

        // Step 3: Transcribe (if language specified)
        let transcript = null;
        if (language && inputPath) {
            await job.updateProgress({ stage: 'transcribing', percent: 50 });
            const { runWhisper } = require('./transcribe');
            transcript = await runWhisper(inputPath, language);
        }

        // Step 4: Process video (split, crop)
        await job.updateProgress({ stage: 'processing', percent: 70 });
        const { processVideo } = require('./processor');
        const clips = await processVideo(inputPath, options);

        // Step 5: Upload to cloud (if configured)
        let clipUrls = [];
        if (process.env.CLOUD_STORAGE_ENABLED === 'true') {
            await job.updateProgress({ stage: 'uploading', percent: 90 });
            const { uploadToCloud } = require('./cloudStorage');
            clipUrls = await Promise.all(clips.map(clip => uploadToCloud(clip.path)));
        }

        // Step 6: Cleanup local files
        const fs = require('fs-extra');
        await fs.remove(inputPath).catch(() => {});
        clips.forEach(clip => {
            fs.remove(clip.path).catch(() => {});
        });

        // Return result
        return {
            success: true,
            clips: clips.length,
            clipUrls,
            transcript,
            duration: job.data.duration,
        };

    } catch (error) {
        console.error(`[Worker] Job ${job.id} failed:`, error.message);
        throw error;
    }
}, {
    connection,
    concurrency: 3,  // Process 3 jobs at a time
});

/**
 * Cleanup worker
 */
const cleanupWorker = new Worker('cleanup', async (job) => {
    const { path, olderThan } = job.data;
    const fs = require('fs-extra');
    const pathModule = require('path');

    const tempDir = pathModule.join(__dirname, '../../temp');
    const outputDir = pathModule.join(__dirname, '../../output');

    const cleanDir = async (dir) => {
        if (!await fs.exists(dir)) return;

        const files = await fs.readdir(dir);
        const now = Date.now();

        for (const file of files) {
            const filePath = pathModule.join(dir, file);
            const stat = await fs.stat(filePath);

            if (now - stat.mtimeMs > olderThan) {
                await fs.remove(filePath);
                console.log(`[Cleanup] Removed: ${file}`);
            }
        }
    };

    await cleanDir(tempDir);
    await cleanDir(outputDir);

    return { success: true };
}, {
    connection,
    concurrency: 1,
});

// ═══════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════

videoWorker.on('completed', (job, result) => {
    console.log(`[Worker] Job ${job.id} completed: ${result.clips} clips`);
});

videoWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} failed: ${err.message}`);
});

videoWorker.on('progress', (job, progress) => {
    console.log(`[Worker] Job ${job.id} progress: ${progress.stage} ${progress.percent}%`);
});

// ═══════════════════════════════════════════════════════════════
// SCHEDULED CLEANUP (every hour)
// ═══════════════════════════════════════════════════════════════

const cron = require('node-cron');

// Run cleanup every hour
cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running hourly cleanup...');
    await addCleanupJob({ olderThan: 24 * 60 * 60 * 1000 }); // 24 hours
});

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
    videoQueue,
    cleanupQueue,
    addVideoJob,
    addTranscribeJob,
    addCleanupJob,
    JOB_TYPES,
    connection,
};
