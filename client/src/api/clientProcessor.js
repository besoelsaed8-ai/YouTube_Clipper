/**
 * Client-side video processor using ffmpeg.wasm
 * All processing happens in the browser — no server load!
 * Now supports server-side Whisper transcription for subtitles!
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import api from './api';

let ffmpeg = null;
let ffmpegLoadPromise = null;

/**
 * Initialize FFmpeg WASM
 */
export async function initFFmpeg(onLog) {
    if (ffmpeg && ffmpeg.loaded) return ffmpeg;

    if (!ffmpegLoadPromise) {
        ffmpegLoadPromise = (async () => {
            const ff = new FFmpeg();
            if (onLog) onLog('Loading FFmpeg engine...');

            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

            await ff.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            ffmpeg = ff;
            console.log('[FFmpeg WASM] Loaded successfully');
            return ff;
        })().catch((e) => {
            ffmpegLoadPromise = null;
            throw e;
        });
    }

    return ffmpegLoadPromise;
}

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
 * Get video duration from FFmpeg logs
 */
function getVideoDuration(ff, inputName, onLog) {
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
 * Get video dimensions
 */
export function readVideoDimensions(ff, inputName, timeoutMs = 15000) {
    return new Promise((resolve) => {
        let width = 0;
        let height = 0;
        const handler = ({ message }) => {
            const m = message.match(/, (\d{2,5})x(\d{2,5})[ ,]/);
            if (m && !width) {
                width = parseInt(m[1]);
                height = parseInt(m[2]);
            }
        };
        ff.on('log', handler);
        const timer = setTimeout(() => { ff.off('log', handler); resolve({ width, height }); }, timeoutMs);
        ff.exec(['-i', inputName, '-frames:v', '1', '-f', 'null', '-']).catch(() => {}).finally(() => {
            clearTimeout(timer); ff.off('log', handler); resolve({ width, height });
        });
    });
}

/**
 * Progress timer
 */
function startProgressTimer(onProgress, fromPercent, toPercent, durationMs) {
    const startTime = Date.now();
    const range = toPercent - fromPercent;
    const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(1, elapsed / durationMs);
        const eased = 1 - Math.pow(1 - ratio, 3);
        if (onProgress) onProgress(Math.min(toPercent, Math.round(fromPercent + range * eased)));
    }, 300);
    return () => { clearInterval(timer); if (onProgress) onProgress(toPercent); };
}

/**
 * Server-side transcription using Whisper
 * Uploads video to server, returns timestamped segments
 */
async function serverTranscribe(videoBlob, language = 'ar', onLog) {
    try {
        if (onLog) onLog('Uploading video for transcription...');

        const formData = new FormData();
        formData.append('video', videoBlob, 'video.mp4');
        if (language) formData.append('language', language);

        const response = await api.post('/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 300000, // 5 minutes
        });

        if (response.data?.error) {
            if (onLog) onLog(`Transcription error: ${response.data.error}`);
            return null;
        }

        const segments = response.data?.segments || [];
        if (segments.length > 0) {
            if (onLog) onLog(`Transcription complete: ${segments.length} segments`);
            return segments;
        }

        if (onLog) onLog('No speech detected in video');
        return null;

    } catch (e) {
        if (onLog) onLog(`Transcription failed: ${e.message}`);
        return null;
    }
}

/**
 * Generate subtitle filter string from segments
 */
function generateSubtitleFilter(segments, clipStartTime, clipDuration) {
    if (!segments || segments.length === 0) return '';

    const escapeFFmpeg = (text) => {
        return text.replace(/'/g, "\\'").replace(/:/g, '\\:').replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
    };

    const clipSegments = segments.filter(seg => {
        return seg.start < clipStartTime + clipDuration && seg.end > clipStartTime;
    });

    if (clipSegments.length === 0) return '';

    const filters = clipSegments.map(seg => {
        const relStart = Math.max(0, seg.start - clipStartTime);
        const relEnd = Math.min(clipDuration, seg.end - clipStartTime);
        const escaped = escapeFFmpeg(seg.text);
        return `drawtext=text='${escaped}':fontsize=20:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h-th-30:enable='between(t,${relStart.toFixed(2)},${relEnd.toFixed(2)})'`;
    });

    return filters.join(',');
}

/**
 * Process video: split into clips with optional subtitles
 */
export async function processVideoClient(videoFile, options) {
    const { duration, crop, faceTrack, effects = {}, subtitles = false, subtitleLang = 'ar', onProgress, onLog } = options;

    const fileSize = videoFile?.size || videoFile?.byteLength || videoFile?.length || 0;
    if (fileSize > 400 * 1024 * 1024) {
        throw new Error('Video file is too large for browser processing (max ~400MB)');
    }

    // Step 1: Init FFmpeg
    let ff;
    try {
        ff = await initFFmpeg(onLog);
    } catch (e) {
        throw new Error(`Failed to load FFmpeg: ${e.message}`);
    }

    // Step 2: Write input
    if (onLog) onLog('Loading video...');
    const inputName = 'input.mp4';
    try {
        await ff.writeFile(inputName, await fetchFile(videoFile));
    } catch (e) {
        throw new Error(`Failed to load video: ${e.message}`);
    }

    // Step 3: Server-side transcription
    let speechSegments = null;
    if (subtitles) {
        if (onLog) onLog('Starting server-side transcription (Whisper)...');
        if (onProgress) onProgress(8);
        speechSegments = await serverTranscribe(videoFile, subtitleLang?.split('-')[0], onLog);
    }

    // Step 4: Get duration
    if (onProgress) onProgress(10);
    const videoDuration = await getVideoDuration(ff, inputName, onLog);

    if (videoDuration === 0) {
        await ff.deleteFile(inputName).catch(() => {});
        throw new Error('Could not determine video duration');
    }

    // Step 5: Calculate clips
    const clipDuration = parseInt(duration);
    const numClips = Math.floor(videoDuration / clipDuration);

    if (numClips === 0) {
        await ff.deleteFile(inputName).catch(() => {});
        throw new Error(`Video (${Math.round(videoDuration)}s) is shorter than clip duration (${clipDuration}s)`);
    }

    if (onLog) onLog(`Creating ${numClips} clips`);

    // Step 6: Face tracking
    let facePositions = null;
    let dimensions = { width: 1920, height: 1080 };

    if (crop && faceTrack) {
        if (onLog) onLog('Analyzing for face tracking...');
        try {
            const { trackVideo } = await import('./faceTracker');
            facePositions = await trackVideo(videoFile, {
                sampleRate: 2, maxSamples: 60,
                onProgress: (p) => { if (onProgress) onProgress(Math.round(10 + p * 0.15)); },
                onLog,
            });
        } catch (e) {
            if (onLog) onLog(`Face tracking failed: ${e.message}`);
        }
    }

    if (facePositions && facePositions.length > 0) {
        dimensions = await readVideoDimensions(ff, inputName);
    }

    // Step 7: Generate clips
    const clips = [];
    const baseProgress = speechSegments ? 20 : (facePositions ? 20 : 10);
    const progressPerClip = (95 - baseProgress) / numClips;

    for (let i = 0; i < numClips; i++) {
        const startTime = i * clipDuration;
        const outputName = `clip_${i + 1}.mp4`;

        if (onLog) onLog(`Processing clip ${i + 1}/${numClips}...`);

        const stopTimer = startProgressTimer(onProgress, baseProgress + i * progressPerClip, baseProgress + (i + 1) * progressPerClip, clipDuration * 2000);

        const args = ['-ss', String(startTime), '-i', inputName, '-t', String(clipDuration)];
        const videoFilters = [];

        // Crop
        if (crop) {
            if (facePositions && facePositions.length > 0) {
                const clipPositions = facePositions.filter(p => p.time >= startTime && p.time < startTime + clipDuration).map(p => ({ ...p, time: p.time - startTime }));
                if (clipPositions.length > 0) {
                    try {
                        const { generateSmoothFaceCropFilter } = await import('./faceCropFilter');
                        videoFilters.push(generateSmoothFaceCropFilter(clipPositions, dimensions.width, dimensions.height));
                    } catch (e) {
                        videoFilters.push('crop=ih*9/16:ih:(iw-ih*9/16)/2:0');
                    }
                } else {
                    videoFilters.push('crop=ih*9/16:ih:(iw-ih*9/16)/2:0');
                }
            } else {
                videoFilters.push('crop=ih*9/16:ih:(iw-ih*9/16)/2:0');
            }
        }

        // Color effects
        if (effects.color && effects.color !== 'none') {
            try {
                const { buildEffectsFilter } = await import('./effectsLibrary');
                const { videoFilter } = buildEffectsFilter({ color: effects.color, zoom: 'none', speed: effects.speed || 'none', duration: clipDuration });
                if (videoFilter) videoFilters.push(videoFilter);
            } catch (e) {}
        } else if (effects.speed && effects.speed !== 'none') {
            try {
                const { buildEffectsFilter } = await import('./effectsLibrary');
                const { videoFilter, audioFilter } = buildEffectsFilter({ color: 'none', zoom: 'none', speed: effects.speed, duration: clipDuration });
                if (videoFilter) videoFilters.push(videoFilter);
                if (audioFilter) args.push('-af', audioFilter);
            } catch (e) {}
        }

        // Subtitles
        if (speechSegments && speechSegments.length > 0) {
            const subtitleFilter = generateSubtitleFilter(speechSegments, startTime, clipDuration);
            if (subtitleFilter) {
                videoFilters.push(subtitleFilter);
                if (onLog) onLog(`Adding subtitles to clip ${i + 1}`);
            }
        }

        if (videoFilters.length > 0) {
            args.push('-vf', videoFilters.join(','));
        }

        args.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'aac', '-b:a', '96k', '-ar', '44100', '-movflags', '+faststart', outputName);

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
            continue;
        }

        clips.push({
            name: outputName,
            data,
            startTime,
            endTime: startTime + clipDuration,
            transcript: speechSegments ? speechSegments.filter(seg => seg.start < startTime + clipDuration && seg.end > startTime) : null,
        });
        await ff.deleteFile(outputName).catch(() => {});
    }

    await ff.deleteFile(inputName).catch(() => {});

    if (clips.length === 0) {
        throw new Error('Failed to create any clips');
    }

    if (onLog) onLog(`Done! Created ${clips.length} clips`);
    return clips;
}

/**
 * Download a clip
 */
export function downloadClip(clipData, filename) {
    const blob = new Blob([clipData], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
