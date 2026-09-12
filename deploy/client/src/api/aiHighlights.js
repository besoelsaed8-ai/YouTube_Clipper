/**
 * AI Highlights Processor
 * Uses scene detection to find best moments and create clips
 */
import { initFFmpeg } from './clientProcessor';
import { findBestMoments } from './sceneDetector';
import { fetchFile } from '@ffmpeg/util';

/**
 * Execute FFmpeg command with timeout
 */
function execWithTimeout(ff, args, timeoutMs = 120000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`FFmpeg command timed out after ${Math.round(timeoutMs / 1000)}s`));
        }, timeoutMs);

        ff.exec(args)
            .then((result) => { clearTimeout(timer); resolve(result); })
            .catch((err) => { clearTimeout(timer); reject(err); });
    });
}

/**
 * Start a fake-progress timer
 */
function startProgressTimer(onProgress, fromPercent, toPercent, durationMs) {
    const startTime = Date.now();
    const range = toPercent - fromPercent;
    const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(1, elapsed / durationMs);
        const eased = 1 - Math.pow(1 - ratio, 3);
        const current = Math.round(fromPercent + range * eased);
        if (onProgress) onProgress(Math.min(toPercent, current));
    }, 300);

    return () => {
        clearInterval(timer);
        if (onProgress) onProgress(toPercent);
    };
}

/**
 * Get video duration instantly
 */
function getVideoDurationInstant(ff, inputName, onLog) {
    return new Promise((resolve) => {
        let duration = 0;
        const handler = ({ message }) => {
            const match = message.match(/Duration:\s*(\d+):(\d{2}):(\d{2})\.(\d+)/);
            if (match && duration === 0) {
                duration = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseFloat('0.' + match[4]);
                ff.off('log', handler);
                if (onLog) onLog(`Video duration: ${Math.round(duration)}s`);
                resolve(duration);
            }
        };
        ff.on('log', handler);
        ff.exec(['-i', inputName, '-f', 'null', '-']).catch(() => {});
        setTimeout(() => { ff.off('log', handler); resolve(duration); }, 15000);
    });
}

/**
 * Process video in AI mode
 */
export async function processHighlights(videoFile, options, onProgress, onLog) {
    const { clipDuration = 30, crop = true, maxClips = 10, captions = {}, subtitleLang = null } = options;

    // Guard: file size
    const fileSize = videoFile?.size || videoFile?.byteLength || videoFile?.length || 0;
    if (fileSize > 400 * 1024 * 1024) {
        throw new Error('Video file is too large for browser processing (max ~400MB).');
    }

    // Step 1: Init FFmpeg
    let ff;
    try {
        if (onLog) onLog('Initializing FFmpeg...');
        ff = await initFFmpeg(onLog);
    } catch (e) {
        throw new Error(`Failed to load FFmpeg. Please refresh and try again. (${e.message})`);
    }

    // Step 2: Write input
    if (onLog) onLog('Loading video...');
    const inputName = 'input.mp4';
    try {
        const fileData = await fetchFile(videoFile);
        await ff.writeFile(inputName, fileData);
    } catch (e) {
        throw new Error(`Failed to load video file. (${e.message})`);
    }

    // Step 3: Get duration
    if (onProgress) onProgress(5);
    const totalDuration = await getVideoDurationInstant(ff, inputName, onLog);

    if (totalDuration === 0) {
        await ff.deleteFile(inputName).catch(() => {});
        throw new Error('Could not determine video duration');
    }

    if (totalDuration < clipDuration) {
        await ff.deleteFile(inputName).catch(() => {});
        throw new Error(`Video is too short for ${clipDuration}s clips`);
    }

    // Step 4: Find best moments
    if (onProgress) onProgress(10);
    const bestMoments = await findBestMoments(
        ff, inputName, totalDuration,
        { clipDuration, maxClips },
        (p) => onProgress(Math.round(10 + p * 0.4)),
        onLog
    );

    if (bestMoments.length === 0) {
        await ff.deleteFile(inputName).catch(() => {});
        throw new Error('Could not find any highlight moments in this video');
    }

    if (onLog) onLog(`Creating ${bestMoments.length} highlight clips...`);

    // Step 5: Generate clips
    const clips = [];
    const progressPerClip = 50 / bestMoments.length;

    for (let i = 0; i < bestMoments.length; i++) {
        const moment = bestMoments[i];
        const outputName = `highlight_${i + 1}.mp4`;

        if (onLog) onLog(`Creating clip ${i + 1}/${bestMoments.length} (score: ${moment.score})...`);

        const args = [
            '-ss', String(moment.startTime),
            '-i', inputName,
            '-t', String(clipDuration),
        ];

        // Build video filters — keep simple
        const filters = [];

        if (crop) {
            filters.push('crop=ih*9/16:ih:(iw-ih*9/16)/2:0');
        }

        // Add subtitle overlay if caption exists
        const caption = captions[i] || '';
        if (caption) {
            try {
                const { generateSubtitleFilter, translateText, textToSubtitles } = await import('./subtitleService');
                const effectiveLang = subtitleLang || null;
                const displayText = effectiveLang ? translateText(caption, effectiveLang) : caption;
                const subtitles = textToSubtitles(displayText, clipDuration, {
                    maxCharsPerLine: effectiveLang === 'ar' ? 30 : 40,
                    maxLines: 2,
                });

                if (subtitles.length > 0) {
                    const subtitleFilter = generateSubtitleFilter(subtitles, {
                        fontSize: 18,
                        fontColor: 'white',
                        outlineColor: 'black',
                        outlineWidth: 2,
                        position: 'bottom',
                    });
                    if (subtitleFilter) filters.push(subtitleFilter);
                }
            } catch (e) {
                if (onLog) onLog(`Subtitle filter failed: ${e.message}`);
            }
        }

        if (filters.length > 0) {
            args.push('-vf', filters.join(','));
        }

        args.push(
            '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28',
            '-c:a', 'aac', '-b:a', '96k', '-ar', '44100',
            '-movflags', '+faststart', outputName
        );

        // Timer-based progress
        const clipStartProgress = 50 + i * progressPerClip;
        const clipEndProgress = 50 + (i + 1) * progressPerClip;
        const stopTimer = startProgressTimer(onProgress, clipStartProgress, clipEndProgress, clipDuration * 2000);

        try {
            await execWithTimeout(ff, args, clipDuration * 3000 + 30000);
        } catch (e) {
            stopTimer();
            if (onLog) onLog(`FFmpeg failed on clip ${i + 1}: ${e.message}`);
            continue;
        }

        stopTimer();

        let data;
        try {
            data = await ff.readFile(outputName);
        } catch (e) {
            if (onLog) onLog(`Could not read clip ${i + 1}, skipping...`);
            continue;
        }

        clips.push({
            name: outputName,
            data,
            startTime: moment.startTime,
            endTime: moment.endTime,
            score: moment.score,
            energy: moment.energy,
            dynamicity: moment.dynamicity,
            rank: moment.rank,
            label: moment.label,
            caption: caption,
            subtitleLang: subtitleLang,
        });

        await ff.deleteFile(outputName).catch(() => {});
        if (onProgress) onProgress(Math.round(clipEndProgress));
    }

    await ff.deleteFile(inputName).catch(() => {});

    if (clips.length === 0) {
        throw new Error('Failed to create any clips. The video format may not be supported.');
    }

    if (onLog) onLog(`Done! Created ${clips.length} highlight clips`);

    return { clips, totalDuration, analyzedScenes: bestMoments.length };
}

/**
 * Format time as MM:SS
 */
export function formatTimestamp(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Get score color class
 */
export function getScoreColor(score) {
    if (score >= 80) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (score >= 65) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
}
