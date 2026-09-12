/**
 * Face Crop Filter Generator
 * Generates FFmpeg filters for face-tracked 9:16 vertical cropping
 */

/**
 * Generate a simple smooth crop filter using keyframe-based interpolation
 * Simplified to avoid FFmpeg expression parsing issues
 */
export function generateSmoothFaceCropFilter(positions, inputWidth, inputHeight) {
    // x264 requires even dimensions
    const cropHeight = inputHeight % 2 === 0 ? inputHeight : inputHeight - 1;
    const cropWidth = Math.round((cropHeight * 9) / 16 / 2) * 2;

    if (!positions || positions.length === 0) {
        const x = Math.max(0, Math.round((inputWidth - cropWidth) / 2));
        return `crop=${cropWidth}:${cropHeight}:${x}:0`;
    }

    // If only one position, use simple crop
    if (positions.length === 1) {
        let x = Math.round(positions[0].x - cropWidth / 2);
        x = Math.max(0, Math.min(x, inputWidth - cropWidth));
        return `crop=${cropWidth}:${cropHeight}:${x}:0`;
    }

    // Downsample to max 10 keyframes to keep expression simple
    const maxKeyframes = 10;
    const step = Math.max(1, Math.floor(positions.length / maxKeyframes));
    const keyframes = [];
    for (let i = 0; i < positions.length; i += step) {
        keyframes.push(positions[i]);
    }
    // Always include last
    if (keyframes[keyframes.length - 1] !== positions[positions.length - 1]) {
        keyframes.push(positions[positions.length - 1]);
    }

    // Calculate crop X for each keyframe
    const xValues = keyframes.map(p => {
        let x = Math.round(p.x - cropWidth / 2);
        x = Math.max(0, Math.min(x, inputWidth - cropWidth));
        return x;
    });

    const centerX = Math.round((inputWidth - cropWidth) / 2);

    // Build simple nested if-else expression
    let expr = `${xValues[xValues.length - 1]}`;
    for (let i = xValues.length - 2; i >= 0; i--) {
        const t = keyframes[i + 1].time.toFixed(2);
        expr = `if(lt(t\\,${t})\\,${xValues[i]}\\,${expr})`;
    }

    // Quote the expression for FFmpeg filter parser
    return `crop=${cropWidth}:${cropHeight}:'${expr}':0`;
}
