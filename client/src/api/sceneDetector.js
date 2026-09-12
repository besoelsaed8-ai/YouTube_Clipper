/**
 * Scene Detector — uses FFmpeg to detect scene changes and audio energy
 */

/**
 * Execute FFmpeg with timeout
 */
function execWithTimeout(ff, args, timeoutMs = 60000) {
    return new Promise((resolve) => {
        const timer = setTimeout(() => resolve(), timeoutMs);
        ff.exec(args).catch(() => {}).finally(() => {
            clearTimeout(timer);
            resolve();
        });
    });
}

/**
 * Detect scene changes using FFmpeg's scene filter
 */
export async function detectScenes(ff, inputName, onProgress, onLog) {
    if (onLog) onLog('Detecting scene changes...');

    const sceneLog = [];
    const handler = ({ message }) => {
        const match = message.match(/pts_time:\s*([\d.]+)/);
        if (match) {
            sceneLog.push(parseFloat(match[1]));
        }
    };

    ff.on('log', handler);

    await execWithTimeout(ff, [
        '-i', inputName,
        '-vf', 'select=gt(scene\\,0.4),showinfo',
        '-an',
        '-f', 'null', '-'
    ], 60000);

    ff.off('log', handler);

    // Hard cap
    if (sceneLog.length > 200) {
        sceneLog.length = 200;
        if (onLog) onLog('Scene events capped at 200');
    }

    if (onLog) onLog(`Found ${sceneLog.length} scene changes`);

    const scenes = [0, ...sceneLog.filter(t => t > 0)].sort((a, b) => a - b);
    return scenes;
}

/**
 * Analyze audio energy in segments
 */
export async function analyzeAudioEnergy(ff, inputName, segmentDuration, totalDuration, onLog) {
    if (onLog) onLog('Analyzing audio energy...');

    const segments = [];
    const numSegments = Math.min(Math.ceil(totalDuration / segmentDuration), 50); // Cap at 50 segments

    for (let i = 0; i < numSegments; i++) {
        const startTime = i * segmentDuration;
        const dur = Math.min(segmentDuration, totalDuration - startTime);

        let maxVolume = 0;
        let avgVolume = -30;

        const handler = ({ message }) => {
            const meanMatch = message.match(/mean_volume:\s*([-\d.]+)\s*dB/);
            const maxMatch = message.match(/max_volume:\s*([-\d.]+)\s*dB/);
            if (meanMatch) avgVolume = parseFloat(meanMatch[1]);
            if (maxMatch) maxVolume = parseFloat(maxMatch[1]);
        };

        ff.on('log', handler);

        await execWithTimeout(ff, [
            '-ss', String(startTime),
            '-i', inputName,
            '-t', String(dur),
            '-af', 'volumedetect',
            '-f', 'null', '-'
        ], 30000);

        ff.off('log', handler);

        const effectiveAvg = isFinite(avgVolume) ? avgVolume : -30;
        const energy = Math.max(0, Math.min(100, (effectiveAvg + 60) * (100 / 60)));

        segments.push({
            index: i,
            startTime,
            endTime: Math.min(startTime + segmentDuration, totalDuration),
            duration: dur,
            maxVolume,
            avgVolume,
            energy: Math.round(energy),
        });
    }

    if (onLog) onLog(`Analyzed ${segments.length} audio segments`);
    return segments;
}

/**
 * Combine scene detection + audio energy to find best clip moments
 */
export async function findBestMoments(ff, inputName, totalDuration, options, onProgress, onLog) {
    const { clipDuration = 30, maxClips = 10 } = options;

    if (onProgress) onProgress(10);
    const scenes = await detectScenes(ff, inputName, onProgress, onLog);

    if (onProgress) onProgress(30);
    const segmentDuration = Math.max(5, Math.floor(clipDuration / 3));
    const audioSegments = await analyzeAudioEnergy(ff, inputName, segmentDuration, totalDuration, onLog);

    if (onProgress) onProgress(50);
    const candidates = [];

    for (const sceneTime of scenes) {
        if (sceneTime + clipDuration > totalDuration) continue;

        const clipEnd = sceneTime + clipDuration;
        const relevantSegments = audioSegments.filter(
            s => s.startTime < clipEnd && s.endTime > sceneTime
        );
        const avgEnergy = relevantSegments.length > 0
            ? relevantSegments.reduce((sum, s) => sum + s.energy, 0) / relevantSegments.length
            : 50;

        const scenesInClip = scenes.filter(t => t > sceneTime && t < clipEnd).length;

        const energyScore = avgEnergy * 0.4;
        const dynamicScore = Math.min(40, scenesInClip * 8) * 0.3;
        const positionRatio = sceneTime / totalDuration;
        const positionScore = (1 - Math.abs(positionRatio - 0.5) * 2) * 20;

        const totalScore = energyScore + dynamicScore + positionScore;

        candidates.push({
            startTime: sceneTime,
            endTime: clipEnd,
            score: Math.round(Math.min(100, totalScore)),
            energy: Math.round(avgEnergy),
            dynamicity: scenesInClip,
            audioSegments: relevantSegments,
        });
    }

    if (onProgress) onProgress(70);
    const filtered = removeOverlappingClips(candidates, clipDuration);

    const best = filtered
        .sort((a, b) => b.score - a.score)
        .slice(0, maxClips)
        .map((clip, i) => ({
            ...clip,
            rank: i + 1,
            label: generateClipLabel(clip.score),
        }));

    if (onProgress) onProgress(90);
    if (onLog) onLog(`Found ${best.length} best moments`);

    return best;
}

/**
 * Remove overlapping clips — keep highest scoring
 */
function removeOverlappingClips(candidates, clipDuration) {
    const sorted = [...candidates].sort((a, b) => b.score - a.score);
    const kept = [];

    for (const candidate of sorted) {
        const overlaps = kept.some(
            k => Math.abs(k.startTime - candidate.startTime) < clipDuration * 0.5
        );
        if (!overlaps) {
            kept.push(candidate);
        }
    }

    return kept;
}

/**
 * Generate a human-readable label based on score
 */
function generateClipLabel(score) {
    if (score >= 80) return '🔥 Viral';
    if (score >= 65) return '⭐ Great';
    if (score >= 50) return '👍 Good';
    return '📌 Notable';
}
