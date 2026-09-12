/**
 * Face Tracker — Free client-side face tracking for 9:16 vertical crop
 * Uses browser APIs: FaceDetection (Chrome), Canvas, and motion tracking
 */

/**
 * Extract a frame from video at a given time and draw to canvas
 * Uses addEventListener (registered BEFORE seeking) so the event can never be missed
 */
function extractFrame(video, time, canvas, ctx) {
    return new Promise((resolve) => {
        let settled = false;
        const done = () => {
            if (settled) return;
            settled = true;
            video.removeEventListener('seeked', onSeeked);
            resolve();
        };
        const onSeeked = () => {
            try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            } catch (e) { /* frame not ready — skip */ }
            done();
        };
        video.addEventListener('seeked', onSeeked);
        // Safety timeout — never hang the whole pipeline on one frame
        setTimeout(done, 2000);

        const target = Math.min(time, Math.max(0, (video.duration || 0) - 0.05));
        video.currentTime = Math.max(0, target);
    });
}

/**
 * Check if FaceDetection API is available
 */
function isFaceDetectionSupported() {
    return typeof FaceDetection !== 'undefined';
}

/**
 * Detect face using Chrome's FaceDetection API
 */
async function detectFaceWithAPI(imageData) {
    try {
        const detector = new FaceDetection({ fastMode: true, maxDetectedFaces: 3 });
        const faces = await detector.detect(imageData);
        if (faces.length === 0) return null;

        let largest = faces[0];
        for (const face of faces) {
            const area = face.boundingBox.width * face.boundingBox.height;
            const largestArea = largest.boundingBox.width * largest.boundingBox.height;
            if (area > largestArea) largest = face;
        }

        const box = largest.boundingBox;
        return {
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
            width: box.width,
            height: box.height,
            confidence: 0.9,
        };
    } catch (e) {
        return null;
    }
}

/**
 * Detect face using skin-tone heuristics
 */
function detectFaceWithSkinTone(imageData, width, height) {
    const data = imageData.data;
    const regions = [];
    const step = 6; // Sample every 6th pixel for speed

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (isSkinTone(r, g, b)) {
                regions.push({ x, y });
            }
        }
    }

    if (regions.length < 10) return null;

    const centerX = regions.reduce((sum, p) => sum + p.x, 0) / regions.length;
    const centerY = regions.reduce((sum, p) => sum + p.y, 0) / regions.length;

    const spreadX = Math.sqrt(regions.reduce((sum, p) => sum + (p.x - centerX) ** 2, 0) / regions.length);
    const spreadY = Math.sqrt(regions.reduce((sum, p) => sum + (p.y - centerY) ** 2, 0) / regions.length);

    if (spreadX < 10 || spreadY < 10 || spreadX > width * 0.4 || centerY > height * 0.7) return null;

    return { x: centerX, y: centerY, width: spreadX * 2, height: spreadY * 2, confidence: 0.5 };
}

function isSkinTone(r, g, b) {
    const rules = [
        { rMin: 180, rMax: 255, gMin: 120, gMax: 230, bMin: 80, bMax: 200 },
        { rMin: 140, rMax: 220, gMin: 90, gMax: 180, bMin: 50, bMax: 150 },
        { rMin: 80, rMax: 180, gMin: 50, gMax: 140, bMin: 30, bMax: 120 },
    ];
    for (const rule of rules) {
        if (r >= rule.rMin && r <= rule.rMax && g >= rule.gMin && g <= rule.gMax && b >= rule.bMin && b <= rule.bMax && r > g && r > b) {
            return true;
        }
    }
    return false;
}

/**
 * Motion-based tracking
 */
function detectMotion(currentData, prevData, width, height) {
    if (!prevData) return null;

    const curr = currentData.data;
    const prev = prevData.data;
    let maxMotionX = 0;
    let maxMotionY = 0;
    let maxMotion = 0;
    const gridSize = 8;
    const cellW = width / gridSize;
    const cellH = height / gridSize;

    for (let gy = 0; gy < gridSize; gy++) {
        for (let gx = 0; gx < gridSize; gx++) {
            let motion = 0;
            const startX = Math.floor(gx * cellW);
            const startY = Math.floor(gy * cellH);
            const endX = Math.floor((gx + 1) * cellW);
            const endY = Math.floor((gy + 1) * cellH);

            for (let y = startY; y < endY; y += 4) {
                for (let x = startX; x < endX; x += 4) {
                    const i = (y * width + x) * 4;
                    const diff = Math.abs(curr[i] - prev[i]) + Math.abs(curr[i + 1] - prev[i + 1]) + Math.abs(curr[i + 2] - prev[i + 2]);
                    if (diff > 60) motion++;
                }
            }

            if (motion > maxMotion) {
                maxMotion = motion;
                maxMotionX = (gx + 0.5) * cellW;
                maxMotionY = (gy + 0.5) * cellH;
            }
        }
    }

    if (maxMotion < 5) return null;
    return { x: maxMotionX, y: maxMotionY, confidence: 0.4 };
}

/**
 * Track faces/motion across video frames
 * Returns an array of crop positions for each frame
 */
export async function trackVideo(videoFile, options = {}) {
    const {
        sampleRate = 2, // Sample every 2 seconds
        maxSamples = 60, // Max 60 samples
        onProgress,
        onLog,
    } = options;

    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.muted = true;
        video.preload = 'auto';
        video.crossOrigin = 'anonymous';

        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const url = URL.createObjectURL(videoFile);
        video.src = url;

        // Global timeout — never hang the pipeline for more than 60 seconds
        const globalTimeout = setTimeout(() => {
            URL.revokeObjectURL(url);
            if (onLog) onLog('Face tracking timed out after 60s, using center crop');
            resolve([]);
        }, 60000);

        video.onloadedmetadata = async () => {
            const duration = video.duration;
            let numSamples = Math.ceil(duration / sampleRate);
            if (numSamples > maxSamples) numSamples = maxSamples;

            const positions = [];
            if (onLog) onLog(`Analyzing ${numSamples} frames across ${Math.round(duration)}s video...`);

            let prevImageData = null;

            for (let i = 0; i < numSamples; i++) {
                const time = (i / numSamples) * duration;

                await extractFrame(video, time, canvas, ctx);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                let position = null;

                if (isFaceDetectionSupported()) {
                    position = await detectFaceWithAPI(imageData);
                }

                if (!position) {
                    position = detectFaceWithSkinTone(imageData, canvas.width, canvas.height);
                }

                if (!position) {
                    position = detectMotion(imageData, prevImageData, canvas.width, canvas.height);
                }

                if (!position) {
                    position = { x: canvas.width / 2, y: canvas.height / 2, confidence: 0.1 };
                }

                positions.push({
                    time,
                    x: position.x * (video.videoWidth / canvas.width),
                    y: position.y * (video.videoHeight / canvas.height),
                    confidence: position.confidence,
                });

                prevImageData = imageData;

                if (onProgress) {
                    onProgress(Math.round(((i + 1) / numSamples) * 100));
                }
            }

            clearTimeout(globalTimeout);
            URL.revokeObjectURL(url);

            const smoothed = smoothPositions(positions, 3);
            if (onLog) onLog(`Tracked ${smoothed.length} frames`);
            resolve(smoothed);
        };

        video.onerror = () => {
            clearTimeout(globalTimeout);
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load video for face tracking'));
        };

        video.load();
    });
}

/**
 * Smooth positions using moving average
 */
function smoothPositions(positions, windowSize) {
    if (positions.length <= 1) return positions;

    const smoothed = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < positions.length; i++) {
        const start = Math.max(0, i - halfWindow);
        const end = Math.min(positions.length - 1, i + halfWindow);
        const window = positions.slice(start, end + 1);

        const avgX = window.reduce((sum, p) => sum + p.x, 0) / window.length;
        const avgY = window.reduce((sum, p) => sum + p.y, 0) / window.length;

        smoothed.push({ ...positions[i], x: Math.round(avgX), y: Math.round(avgY) });
    }

    return smoothed;
}

/**
 * Interpolate position for a specific time between tracked frames
 */
export function interpolatePosition(positions, time) {
    if (positions.length === 0) return { x: 0, y: 0 };
    if (positions.length === 1) return positions[0];

    let before = positions[0];
    let after = positions[positions.length - 1];

    for (let i = 0; i < positions.length - 1; i++) {
        if (positions[i].time <= time && positions[i + 1].time >= time) {
            before = positions[i];
            after = positions[i + 1];
            break;
        }
    }

    const t = after.time - before.time;
    if (t === 0) return before;

    const ratio = (time - before.time) / t;
    return {
        x: Math.round(before.x + (after.x - before.x) * ratio),
        y: Math.round(before.y + (after.y - before.y) * ratio),
    };
}
