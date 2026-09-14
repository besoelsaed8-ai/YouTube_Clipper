/**
 * Dynamic Captions Service
 * Burns animated, colorful subtitles into video using FFmpeg
 * Features: word-by-word timing, color gradients, karaoke-style animation
 */

// ═══════════════════════════════════════════════════════════════
// COLOR PALETTES (for different content types)
// ═══════════════════════════════════════════════════════════════

const PALETTES = {
    bold: { primary: '#ffffff', secondary: '#ff6b6b', accent: '#ffd93d', bg: '#00000088' },
    neon: { primary: '#ffffff', secondary: '#00ff88', accent: '#00d4ff', bg: '#000000aa' },
    warm: { primary: '#ffffff', secondary: '#ff9500', accent: '#ffcc00', bg: '#00000088' },
    cool: { primary: '#ffffff', secondary: '#00b4d8', accent: '#90e0ef', bg: '#000000aa' },
    gradient: { primary: '#ffffff', secondary: '#ff0080', accent: '#7928ca', bg: '#00000088' },
};

// ═══════════════════════════════════════════════════════════════
// SUPPORTED FONTS
// ═══════════════════════════════════════════════════════════════

const FONTS = {
    arabic: '/usr/share/fonts/msttcorefonts/ARIBLK.TTF', // Arabic Black
    english: '/usr/share/fonts/msttcorefonts/arialbd.ttf',
    bold: '/usr/share/fonts/msttcorefonts/impact.ttf',
};

// ═══════════════════════════════════════════════════════════════
// GENERATE FFmpeg DRAWTEXT FILTERS
// ═══════════════════════════════════════════════════════════════

/**
 * Generate FFmpeg drawtext filter for a single subtitle line
 * with background, color, and position
 */
function createSubtitleFilter(segment, options = {}) {
    const {
        palette = 'bold',
        font = 'english',
        position = 'bottom', // bottom, middle, top
        fontSize = 24,
        textColor = null,
        strokeColor = 'black',
        strokeWidth = 2,
        bgOpacity = 0.7,
        padding = 10,
    } = options;

    const colors = PALETTES[palette] || PALETTES.bold;
    const fontPath = FONTS[font] || FONTS.english;
    const color = textColor || colors.primary;

    const { start, end, text } = segment;
    const duration = end - start;

    // Position
    let yPos = 'h-th-30';
    if (position === 'middle') yPos = '(h-text_h)/2';
    if (position === 'top') yPos = '30';

    // Escape special chars for FFmpeg
    const escaped = text
        .replace(/\\/g, '\\\\')
        .replace(/:/g, '\\:')
        .replace(/'/g, "\\\\'")
        .replace(/\n/g, ' ');

    // Background box
    const boxFilter = `drawbox=x=(w-text_w)/2:y=${yPos - padding - 2}:w=text_w:h=text_h+${padding * 2}:color=${colors.secondary}@${bgOpacity}:t=fill:enable='between(t,${start.toFixed(2)},${end.toFixed(2)})'`;

    // Text
    const textFilter = `drawtext=text='${escaped}':fontfile=${fontPath}:fontsize=${fontSize}:fontcolor=${color}:stroke=${strokeColor}:strokewidth=${strokeWidth}:x=(w-text_w)/2:y=${yPos}:enable='between(t,${start.toFixed(2)},${end.toFixed(2)})'`;

    return [boxFilter, textFilter].join(',');
}

/**
 * Generate FFmpeg filters for multiple subtitle segments
 */
function generateSubtitleFilters(segments, options = {}) {
    if (!segments || segments.length === 0) return null;

    return segments
        .map(seg => createSubtitleFilter(seg, options))
        .filter(f => f)
        .join(',');
}

/**
 * Generate karaoke-style animated captions (word-by-word reveal)
 * Uses fade in/out for each word
 */
function generateKaraokeFilters(segments, options = {}) {
    if (!segments || segments.length === 0) return null;

    const {
        palette = 'neon',
        fontSize = 28,
        wordDuration = 0.3,
    } = options;

    const colors = PALETTES[palette] || PALETTES.neon;
    const fontPath = FONTS.english;

    let filters = [];

    for (const seg of segments) {
        const words = seg.text.split(' ');
        let wordStart = seg.start;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const wordEnd = wordStart + wordDuration;
            const prevWords = words.slice(0, i).join(' ');

            // Previous words (faded out)
            if (i > 0) {
                const prevEnd = wordStart - 0.1;
                const escapedPrev = prevWords
                    .replace(/\\/g, '\\\\')
                    .replace(/:/g, '\\:')
                    .replace(/'/g, "\\\\'");

                filters.push(
                    `drawtext=text='${escapedPrev}':fontfile=${fontPath}:fontsize=${fontSize}:fontcolor=white@0.3:enable='between(t,${seg.start.toFixed(2)},${prevEnd.toFixed(2)})':x=(w-text_w)/2:y=h-th-30`
                );
            }

            // Current word (full color)
            const escapedWord = word
                .replace(/\\/g, '\\\\')
                .replace(/:/g, '\\:')
                .replace(/'/g, "\\\\'");

            filters.push(
                `drawtext=text='${escapedWord}':fontfile=${fontPath}:fontsize=${fontSize}:fontcolor=${colors.primary}:stroke=black:strokewidth=2:enable='between(t,${wordStart.toFixed(2)},${wordEnd.toFixed(2)})':x=(w-text_w)/2:y=h-th-30`
            );

            wordStart = wordEnd;
        }

        // Final fade
        if (wordStart < seg.end) {
            filters.push(
                `drawtext=text='${words.join(' ')}':fontfile=${fontPath}:fontsize=${fontSize}:fontcolor=${colors.primary}@0.5:enable='between(t,${wordStart.toFixed(2)},${seg.end.toFixed(2)})':x=(w-text_w)/2:y=h-th-30`
            );
        }
    }

    return filters.join(',');
}

// ═══════════════════════════════════════════════════════════════
// BUILD FFmpeg COMMAND FOR CAPTION BURNING
// ═══════════════════════════════════════════════════════════════

/**
 * Build FFmpeg arguments to burn subtitles into video
 */
function buildCaptionCommand(inputPath, outputPath, segments, options = {}) {
    const {
        palette = 'bold',
        position = 'bottom',
        fontSize = 24,
        style = 'normal', // normal, karaoke, typewriter
    } = options;

    const args = ['-i', inputPath];

    let filter;

    if (style === 'karaoke') {
        filter = generateKaraokeFilters(segments, { palette, fontSize });
    } else {
        filter = generateSubtitleFilters(segments, { palette, position, fontSize });
    }

    if (filter) {
        args.push('-vf', filter);
    }

    args.push(
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        outputPath
    );

    return args;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
    createSubtitleFilter,
    generateSubtitleFilters,
    generateKaraokeFilters,
    buildCaptionCommand,
    PALETTES,
    FONTS,
};
