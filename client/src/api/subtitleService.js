/**
 * Subtitle Service
 * Handles subtitle creation, parsing, translation preview, and FFmpeg burn-in
 */

/**
 * Available languages for subtitles
 */
export const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
    { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩', native: 'Bahasa Indonesia' },
    { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
];

/**
 * Subtitle entry: { start: seconds, end: seconds, text: string }
 */

/**
 * Parse SRT format to array of subtitle entries
 */
export function parseSRT(srtText) {
    const entries = [];
    const blocks = srtText.trim().split(/\n\s*\n/);

    for (const block of blocks) {
        const lines = block.trim().split('\n');
        if (lines.length < 3) continue;

        // Parse timestamp line: 00:00:01,000 --> 00:00:04,000
        const timeMatch = lines[1].match(
            /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
        );
        if (!timeMatch) continue;

        const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
        const end = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
        const text = lines.slice(2).join('\n');

        entries.push({ start, end, text });
    }

    return entries;
}

/**
 * Convert subtitle entries to SRT format
 */
export function toSRT(entries) {
    return entries.map((entry, i) => {
        const formatTime = (s) => {
            const h = Math.floor(s / 3600).toString().padStart(2, '0');
            const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
            const sec = Math.floor(s % 60).toString().padStart(2, '0');
            const ms = Math.round((s % 1) * 1000).toString().padStart(3, '0');
            return `${h}:${m}:${sec},${ms}`;
        };

        return `${i + 1}\n${formatTime(entry.start)} --> ${formatTime(entry.end)}\n${entry.text}`;
    }).join('\n\n');
}

/**
 * Convert caption text to subtitle entries with auto-timing
 * Splits text into lines and distributes them evenly across clip duration
 */
export function textToSubtitles(text, clipDuration, options = {}) {
    const { maxCharsPerLine = 40, maxLines = 2, pauseBetween = 0.5 } = options;

    if (!text || !text.trim()) return [];

    // Split text into words
    const words = text.trim().split(/\s+/);
    const lines = [];
    let currentLine = '';

    // Group words into lines
    for (const word of words) {
        if ((currentLine + ' ' + word).trim().length > maxCharsPerLine && currentLine) {
            lines.push(currentLine.trim());
            currentLine = word;
        } else {
            currentLine = currentLine ? currentLine + ' ' + word : word;
        }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    // Group into maxLines chunks
    const chunks = [];
    for (let i = 0; i < lines.length; i += maxLines) {
        chunks.push(lines.slice(i, i + maxLines).join('\n'));
    }

    // Distribute evenly across clip duration
    const chunkDuration = clipDuration / chunks.length;

    return chunks.map((text, i) => ({
        start: i * chunkDuration + 0.3,
        end: Math.min((i + 1) * chunkDuration - 0.1, clipDuration),
        text,
    }));
}

/**
 * Simple word-by-word translation (offline dictionary for common words)
 * For production, replace with API call
 */
const COMMON_TRANSLATIONS = {
    ar: {
        'hello': 'مرحبا', 'welcome': 'أهلا وسهلا', 'thank you': 'شكرا',
        'yes': 'نعم', 'no': 'لا', 'good': 'جيد', 'great': 'رائع',
        'amazing': 'مذهل', 'love': 'حب', 'like': 'إعجاب',
        'subscribe': 'اشترك', 'comment': 'تعليق', 'share': 'مشاركة',
        'watch': 'شاهد', 'video': 'فيديو', 'new': 'جديد',
        'best': 'أفضل', 'top': 'أعلى', 'must': 'يجب',
        'wow': 'واو', 'unbelievable': 'لا يصدق', 'incredible': 'غيرcredible',
        'tip': 'نصيحة', 'trick': 'خدعة', 'hack': '窍门',
    },
    es: {
        'hello': 'hola', 'welcome': 'bienvenido', 'thank you': 'gracias',
        'yes': 'sí', 'no': 'no', 'good': 'bueno', 'great': 'genial',
        'amazing': 'increíble', 'love': 'amor', 'like': 'gustar',
        'subscribe': 'suscribir', 'comment': 'comentario', 'share': 'compartir',
    },
    fr: {
        'hello': 'bonjour', 'welcome': 'bienvenue', 'thank you': 'merci',
        'yes': 'oui', 'no': 'non', 'good': 'bon', 'great': 'génial',
        'amazing': 'incroyable', 'love': 'amour', 'like': 'aimer',
        'subscribe': "s'abonner", 'comment': 'commentaire', 'share': 'partager',
    },
    de: {
        'hello': 'hallo', 'welcome': 'willkommen', 'thank you': 'danke',
        'yes': 'ja', 'no': 'nein', 'good': 'gut', 'great': 'großartig',
        'amazing': 'erstaunlich', 'love': 'Liebe', 'like': 'mögen',
    },
    ja: {
        'hello': 'こんにちは', 'welcome': 'ようこそ', 'thank you': 'ありがとう',
        'yes': 'はい', 'no': 'いいえ', 'good': '良い', 'great': '素晴らしい',
        'amazing': '信じられない', 'love': '愛', 'like': '好き',
    },
    ko: {
        'hello': '안녕하세요', 'welcome': '환영합니다', 'thank you': '감사합니다',
        'yes': '네', 'no': '아니요', 'good': '좋은', 'great': '훌륭한',
    },
    tr: {
        'hello': 'merhaba', 'welcome': 'hoş geldiniz', 'thank you': 'teşekkürler',
        'yes': 'evet', 'no': 'hayır', 'good': 'iyi', 'great': 'harika',
    },
    hi: {
        'hello': 'नमस्ते', 'welcome': 'स्वागत है', 'thank you': 'धन्यवाद',
        'yes': 'हाँ', 'no': 'नहीं', 'good': 'अच्छा', 'great': 'महान',
    },
};

/**
 * Translate text using offline dictionary (simple word replacement)
 * For production, use a real translation API
 */
export function translateText(text, targetLang) {
    if (!text || targetLang === 'en') return text;

    const dict = COMMON_TRANSLATIONS[targetLang];
    if (!dict) return text;

    let result = text.toLowerCase();

    // Sort by length (longest first) to replace phrases before words
    const entries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);

    for (const [en, translated] of entries) {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        result = result.replace(regex, translated);
    }

    return result;
}

/**
 * Generate FFmpeg subtitle filter string from entries
 * Used to burn subtitles into video
 */
export function generateSubtitleFilter(entries, options = {}) {
    const {
        fontSize = 20,
        fontColor = 'white',
        outlineColor = 'black',
        outlineWidth = 2,
        position = 'bottom', // 'top', 'center', 'bottom'
    } = options;

    const yPositions = { top: 30, center: '(h-text_h)/2', bottom: 'h-th-30' };
    const y = yPositions[position] || yPositions.bottom;

    // Escape special characters for FFmpeg
    const escapeFFmpeg = (text) => {
        return text
            .replace(/'/g, "\\'")
            .replace(/:/g, '\\:')
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n');
    };

    if (entries.length === 0) return '';

    // Build drawtext filter chain
    const filters = entries.map(entry => {
        const escaped = escapeFFmpeg(entry.text);
        return `drawtext=text='${escaped}':fontsize=${fontSize}:fontcolor=${fontColor}:borderw=${outlineWidth}:bordercolor=${outlineColor}:x=(w-text_w)/2:y=${y}:enable='between(t,${entry.start.toFixed(2)},${entry.end.toFixed(2)})'`;
    });

    return filters.join(',');
}

/**
 * Generate SRT content for download
 */
export function generateSRT(entries) {
    return toSRT(entries);
}

/**
 * Create subtitles from user caption with auto-translation
 */
export function createTranslatedSubtitles(caption, clipDuration, targetLang) {
    if (!caption) return [];

    const translated = translateText(caption, targetLang);
    return textToSubtitles(translated, clipDuration, {
        maxCharsPerLine: targetLang === 'ar' ? 35 : 40,
        maxLines: 2,
    });
}
