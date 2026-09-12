/**
 * Client-side video processor using ffmpeg.wasm
 * All processing happens in the browser — no server load!
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg = null;
let ffmpegLoadPromise = null;

/**
 * Initialize FFmpeg WASM (loads once, safe against concurrent callers)
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
 * Execute FFmpeg command with timeout — prevents infinite hangs
 */
function execWithTimeout(ff, args, timeoutMs = 120000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`FFmpeg command timed out after ${Math.round(timeoutMs / 1000)}s. The video may be too complex or too long.`));
        }, timeoutMs);

        ff.exec(args)
            .then((result) => {
                clearTimeout(timer);
                resolve(result);
            })
            .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
    });
}

/**
 * Get video duration — parses the Duration header from FFmpeg probe logs
 */
function getVideoDuration(ff, inputName, onLog) {
    return new Promise((resolve) => {
        let duration = 0;

        const handler = ({ message }) => {
            const match = message.match(/Duration:\s*(\d+):(\d{2}):(\d{2})\.(\d+)/);
            if (match && duration === 0) {
                const h = parseInt(match[1]);
                const m = parseInt(match[2]);
                const s = parseInt(match[3]);
                const frac = parseFloat('0.' + match[4]);
                duration = h * 3600 + m * 60 + s + frac;
                ff.off('log', handler);
                if (onLog) onLog(`Video duration: ${Math.round(duration)}s`);
                resolve(duration);
            }
        };

        ff.on('log', handler);

        ff.exec(['-i', inputName, '-f', 'null', '-']).catch(() => {});

        setTimeout(() => {
            ff.off('log', handler);
            resolve(duration);
        }, 15000);
    });
}

/**
 * Get video dimensions from FFmpeg log output
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
        const timer = setTimeout(() => {
            ff.off('log', handler);
            resolve({ width, height });
        }, timeoutMs);
        ff.exec(['-i', inputName, '-frames:v', '1', '-f', 'null', '-'])
            .catch(() => {})
            .finally(() => {
                clearTimeout(timer);
                ff.off('log', handler);
                resolve({ width, height });
            });
    });
}

/**
 * Start a fake-progress timer that smoothly advances the progress bar
 * while FFmpeg is actually encoding. Returns a stop function.
 */
function startProgressTimer(onProgress, fromPercent, toPercent, durationMs) {
    const startTime = Date.now();
    const range = toPercent - fromPercent;
    const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(1, elapsed / durationMs);
        // Ease-out curve: fast start, slow end
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
 * Process video: split into clips and optionally crop to 9:16
 */
export async function processVideoClient(videoFile, options) {
    const { duration, crop, faceTrack, effects = {}, onProgress, onLog } = options;

    // Guard: ffmpeg.wasm memory limit (~2GB). Anything over ~400MB can OOM.
    const fileSize = videoFile?.size || videoFile?.byteLength || videoFile?.length || 0;
    if (fileSize > 400 * 1024 * 1024) {
        throw new Error('Video file is too large for browser processing (max ~400MB). Please trim it first or use a lower quality.');
    }

    // Step 1: Initialize FFmpeg
    let ff;
    try {
        ff = await initFFmpeg(onLog);
    } catch (e) {
        throw new Error(`Failed to load FFmpeg engine. Please refresh the page and try again. (${e.message})`);
    }

    // Step 2: Write input file
    if (onLog) onLog('Loading video into FFmpeg...');
    const inputName = 'input.mp4';
    try {
        const fileData = await fetchFile(videoFile);
        await ff.writeFile(inputName, fileData);
    } catch (e) {
        throw new Error(`Failed to load video file into FFmpeg. The file may be corrupted. (${e.message})`);
    }

    // Step 3: Get duration (instant — reads from probe header)
    if (onProgress) onProgress(5);
    const videoDuration = await getVideoDuration(ff, inputName, onLog);

    if (videoDuration === 0) {
        await ff.deleteFile(inputName).catch(() => {});
        throw new Error('Could not determine video duration. The file may be corrupted or unsupported.');
    }

    // Step 4: Calculate clips
    const clipDuration = parseInt(duration);
    const numClips = Math.floor(videoDuration / clipDuration);

    if (numClips === 0) {
        await ff.deleteFile(inputName).catch(() => {});
        throw new Error(`Video (${Math.round(videoDuration)}s) is shorter than clip duration (${clipDuration}s)`);
    }

    if (onLog) onLog(`Creating ${numClips} clips of ${clipDuration}s each`);

    // Step 5: Face tracking (if enabled)
    let facePositions = null;
    let dimensions = { width: 1920, height: 1080 };

    if (crop && faceTrack) {
        if (onLog) onLog('Analyzing video for face tracking...');
        try {
            // Dynamic import to avoid loading faceTracker if not needed
            const { trackVideo } = await import('./faceTracker');
            facePositions = await trackVideo(videoFile, {
                sampleRate: 2, // Sample every 2 seconds (faster)
                maxSamples: 60, // Max 60 samples (2 minutes of analysis)
                onProgress: (p) => {
                    if (onProgress) onProgress(Math.round(5 + p * 0.15));
                },
                onLog,
            });
            if (onLog) onLog(`Face tracking: found ${facePositions.length} tracked frames`);
        } catch (e) {
            if (onLog) onLog(`Face tracking failed, using center crop: ${e.message}`);
            facePositions = null;
        }
    }

    // Read actual input dimensions once
    if (facePositions && facePositions.length > 0) {
        if (onLog) onLog('Reading video dimensions...');
        dimensions = await readVideoDimensions(ff, inputName);
        if (!dimensions.width || !dimensions.height) {
            dimensions = { width: 1920, height: 1080 };
            if (onLog) onLog('Could not read dimensions, assuming 1920x1080');
        }
    }

    // Step 6: Generate clips
    const clips = [];
    const baseProgress = facePositions ? 20 : 5;
    const progressPerClip = (95 - baseProgress) / numClips;

    for (let i = 0; i < numClips; i++) {
        const startTime = i * clipDuration;
        const outputName = `clip_${i + 1}.mp4`;
        const clipStartProgress = baseProgress + i * progressPerClip;
        const clipEndProgress = baseProgress + (i + 1) * progressPerClip;

        if (onLog) onLog(`Processing clip ${i + 1}/${numClips}...`);

        // Start timer-based progress for this clip
        const stopTimer = startProgressTimer(onProgress, clipStartProgress, clipEndProgress, clipDuration * 2000);

        const args = [
            '-ss', String(startTime),
            '-i', inputName,
            '-t', String(clipDuration),
        ];

        // Build video filters — keep it simple to avoid FFmpeg hangs
        const videoFilters = [];

        if (crop) {
            if (facePositions && facePositions.length > 0) {
                const clipPositions = facePositions.filter(
                    p => p.time >= startTime && p.time < startTime + clipDuration
                ).map(p => ({
                    ...p,
                    time: p.time - startTime,
                }));

                if (clipPositions.length > 0) {
                    try {
                        // Dynamic import
                        const { generateSmoothFaceCropFilter } = await import('./faceCropFilter');
                        videoFilters.push(generateSmoothFaceCropFilter(clipPositions, dimensions.width, dimensions.height));
                        if (onLog) onLog(`Using face-tracked crop for clip ${i + 1}`);
                    } catch (e) {
                        if (onLog) onLog(`Face crop filter failed, using center crop: ${e.message}`);
                        videoFilters.push('crop=ih*9/16:ih:(iw-ih*9/16)/2:0');
                    }
                } else {
                    videoFilters.push('crop=ih*9/16:ih:(iw-ih*9/16)/2:0');
                }
            } else {
                videoFilters.push('crop=ih*9/16:ih:(iw-ih*9/16)/2:0');
            }
        }

        // Apply color effects only (skip zoom — zoompan is too heavy for WASM)
        if (effects.color && effects.color !== 'none') {
            try {
                const { buildEffectsFilter } = await import('./effectsLibrary');
                const { videoFilter } = buildEffectsFilter({
                    color: effects.color,
                    zoom: 'none', // Skip zoom in WASM — too slow
                    speed: effects.speed || 'none',
                    duration: clipDuration,
                });
                if (videoFilter) videoFilters.push(videoFilter);
            } catch (e) {
                if (onLog) onLog(`Effects filter failed: ${e.message}`);
            }
        } else if (effects.speed && effects.speed !== 'none') {
            try {
                const { buildEffectsFilter } = await import('./effectsLibrary');
                const { videoFilter, audioFilter } = buildEffectsFilter({
                    color: 'none',
                    zoom: 'none',
                    speed: effects.speed,
                    duration: clipDuration,
                });
                if (videoFilter) videoFilters.push(videoFilter);
                if (audioFilter) args.push('-af', audioFilter);
            } catch (e) {
                if (onLog) onLog(`Speed filter failed: ${e.message}`);
            }
        }

        // Apply video filters
        if (videoFilters.length > 0) {
            args.push('-vf', videoFilters.join(','));
        }

        args.push(
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-crf', '28',
            '-c:a', 'aac',
            '-b:a', '96k',
            '-ar', '44100',
            '-movflags', '+faststart',
            outputName
        );

        try {
            await execWithTimeout(ff, args, clipDuration * 3000 + 30000); // 3x clip duration + 30s buffer
        } catch (execErr) {
            stopTimer();
            if (onLog) onLog(`FFmpeg failed on clip ${i + 1}: ${execErr.message}`);
            // Don't throw — skip this clip and continue with others
            if (onLog) onLog(`Skipping clip ${i + 1} and continuing...`);
            continue;
        }

        stopTimer();

        let data;
        try {
            data = await ff.readFile(outputName);
        } catch (readErr) {
            if (onLog) onLog(`Could not read clip ${i + 1}, skipping...`);
            continue;
        }

        clips.push({ name: outputName, data });
        await ff.deleteFile(outputName).catch(() => {});

        if (onProgress) {
            onProgress(Math.round(clipEndProgress));
        }
    }

    // Cleanup
    await ff.deleteFile(inputName).catch(() => {});

    if (clips.length === 0) {
        throw new Error('Failed to create any clips. The video format may not be supported.');
    }

    if (onLog) onLog(`Done! Created ${clips.length} clips`);
    return clips;
}

/**
 * Download a clip from Uint8Array
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
