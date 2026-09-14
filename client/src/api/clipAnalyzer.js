/**
 * Clip Analyzer — AI-powered title generation + viral scoring
 * Analyzes transcript content to create meaningful Arabic titles
 * and calculates real viral/shareability scores
 */

// ═══════════════════════════════════════════════════════════════
// Arabic Title Patterns — context-aware title generation
// ═══════════════════════════════════════════════════════════════

const EMOTION_KEYWORDS = {
    joy: ['فرح', 'سعادة', 'ضحك', 'ابتسامة', 'happy', 'laugh', 'smile', 'funny', 'حبيت', 'أحلى', 'جميل'],
    anger: ['غضب', 'زعل', 'عصبية', 'angry', 'mad', 'hate', 'كره', 'مشاعر', 'سخط'],
    sadness: ['حزن', 'دموع', 'ندم', 'sad', 'cry', 'tears', 'خسارة', 'مأساة'],
    excitement: ['حماس', 'تحمس', 'excited', 'amazing', 'awesome', 'wow'],
    love: ['حب', 'عشق', 'غرام', 'love', 'heart', 'romance', 'حبيبي', 'يا قلبي'],
    fear: ['خوف', 'رعب', 'فزع', 'fear', 'scary', 'horror', 'terrifying'],
    surprise: ['مفاجأة', 'صدمة', 'shocking', 'unexpected', 'ما توقعت'],
    wisdom: ['حكمة', 'نصيحة', 'intelligence', 'wise', ' learns', 'تعلم', 'خبرة'],
    motivation: ['تحفيز', 'دعم', 'motivation', 'inspire', 'goal', 'هدف', 'طموح', 'نجاح'],
};

const CONTENT_CATEGORIES = {
    gaming: ['لعبة', 'gamer', 'play', 'score', 'win', 'lose', 'game', 'died', 'killed', 'fortnite', 'minecraft', 'فيفا', 'ببجي'],
    music: ['أغنية', 'غنا', 'music', 'song', 'singer', 'sing', 'melody', 'beat'],
    education: ['شرح', 'تعلم', 'tutorial', 'learn', 'study', 'class', 'math', 'science', 'physics', 'فيزياء', 'رياضيات', 'تاريخ'],
    cooking: ['طبخ', 'أكل', 'وصفة', 'recipe', 'cook', 'food', 'delicious', 'طبخة', 'أكلة', 'مطعم'],
    sports: ['كرة', 'sport', 'football', 'soccer', 'match', 'goal', 'team', 'لاعب', 'فريق', 'مباراة'],
    tech: ['تقنية', 'technology', 'phone', 'laptop', 'software', 'app', 'فيسبوك', 'جوجل', 'آيفون', 'اندرويد'],
    news: ['أخبار', 'خبر', 'news', 'report', 'breaking', 'urgent', 'عاجل'],
    comedy: ['ضحك', 'comedy', 'funny', 'humor', 'joke', 'laugh'],
};

const TITLE_TEMPLATES = {
    joy: [
        'لحظة سعادة لا تُنسى',
        'أحلى لحظة في الفيديو',
        'اللحظة التي خلّت الكل يبتسم',
        'الابتسامة اللي حركت القلوب',
    ],
    anger: [
        'لحظة غضب صادمة',
        'اللحظة اللي خلّت الكل يزعل',
        'رد فعل غير متوقع',
        'اللحظة الحارّة',
    ],
    sadness: [
        'لحظة حزينة ممزّقة للقلب',
        'اللحظة اللي بكت الكل',
        'مشهد مؤثّر',
        'لحظة صعبة',
    ],
    excitement: [
        'لحظة حماس خيالية',
        'أقوى لحظة في الفيديو',
        'اللحظة اللي وقّفت القلب',
        'موقف مثير',
    ],
    love: [
        'أحلى لحظة حب',
        'لحظة رومانسية جميلة',
        'اللحظة اللي حرّكت المشاعر',
        'حب في ثانية',
    ],
    fear: [
        'لحظة خوف مرعبة',
        'المشهد المرعب',
        'اللحظة اللي خلّت الكل يخاف',
        'موقف مرعب',
    ],
    surprise: [
        'مفاجأة صادمة',
        'اللحظة التي غيّرت كل شيء',
        'ما توقّعت هذا',
        'الصدمة الكبرى',
    ],
    wisdom: [
        'حكمة من القلب',
        'نصيحة ذهبية',
        'كلمة في الصميم',
        'الحكمة اللي لازم تسمعها',
    ],
    motivation: [
        'تحفيز للهمم',
        'الكلمة اللي هتفرجك',
        'رسالة قوية',
        'ال motorsports اللي تحرّك',
    ],
    default: [
        'أقوى لحظة',
        'المشهد المميّز',
        'لحظة لا تُنسى',
        'اللحظة اللي ما تنْسَى',
    ],
};

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a smart Arabic title for a clip based on its transcript
 */
export function generateClipTitle(clip, index) {
    const transcript = clip.transcript || [];
    const fullText = transcript.map(t => t.text).join(' ').toLowerCase();

    const emotion = detectEmotion(fullText);
    const category = detectCategory(fullText);

    const templates = TITLE_TEMPLATES[emotion] || TITLE_TEMPLATES.default;
    const baseTitle = templates[index % templates.length];

    if (transcript.length > 0) {
        const keyPhrase = extractKeyPhrase(fullText);
        if (keyPhrase) {
            return keyPhrase;
        }
    }

    return baseTitle;
}

/**
 * Calculate viral/shareability score for a clip
 */
export function calculateViralScore(clip, videoDuration) {
    let score = 50;
    const factors = {};

    const energyScore = Math.min(20, (clip.energy || 50) * 0.4);
    factors.energy = Math.round(energyScore);
    score += energyScore;

    const transcript = clip.transcript || [];
    const fullText = transcript.map(t => t.text).join(' ').toLowerCase();
    const engagementScore = calculateTextEngagement(fullText);
    factors.engagement = Math.round(engagementScore * 25);
    score += factors.engagement;

    const duration = (clip.endTime || 30) - (clip.startTime || 0);
    const durationScore = getDurationScore(duration);
    factors.duration = Math.round(durationScore * 15);
    score += factors.duration;

    const positionScore = getPositionScore(clip.startTime, videoDuration);
    factors.position = Math.round(positionScore * 10);
    score += factors.position;

    const dynamicityScore = Math.min(15, (clip.dynamicity || 50) * 0.3);
    factors.dynamicity = Math.round(dynamicityScore);
    score += dynamicityScore;

    const emotion = detectEmotion(fullText);
    const emotionScore = getEmotionScore(emotion);
    factors.emotion = Math.round(emotionScore * 15);
    score += factors.emotion;

    score = Math.min(100, Math.max(10, Math.round(score)));

    return { score, factors, emotion, category: detectCategory(fullText) };
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════

function detectEmotion(text) {
    let bestEmotion = 'default';
    let bestScore = 0;

    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                score++;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestEmotion = emotion;
        }
    }

    return bestEmotion;
}

function detectCategory(text) {
    let bestCategory = 'general';
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(CONTENT_CATEGORIES)) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                score++;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
        }
    }

    return bestCategory;
}

function extractKeyPhrase(text) {
    const sentences = text.split(/[.!؟،,]+/).filter(s => s.trim().length > 10);

    if (sentences.length > 0) {
        const scored = sentences.map(s => ({
            text: s.trim(),
            score: calculatePhraseInterest(s.trim()),
        }));

        scored.sort((a, b) => b.score - a.score);

        if (scored[0].score > 3) {
            let title = scored[0].text;
            if (title.length > 50) {
                title = title.substring(0, 47) + '...';
            }
            return title.charAt(0).toUpperCase() + title.slice(1);
        }
    }

    return null;
}

function calculatePhraseInterest(phrase) {
    let score = 0;

    const words = phrase.split(/\s+/).length;
    if (words >= 3 && words <= 15) score += 2;

    if (/[!?؟]/.test(phrase)) score += 1;
    if (/\d/.test(phrase)) score += 1;

    for (const keywords of Object.values(EMOTION_KEYWORDS)) {
        for (const kw of keywords) {
            if (phrase.includes(kw.toLowerCase())) {
                score += 2;
                break;
            }
        }
    }

    return score;
}

function calculateTextEngagement(text) {
    let score = 0;

    if (text.length > 20) score += 0.3;
    if (text.length > 50) score += 0.2;

    let emotionCount = 0;
    for (const keywords of Object.values(EMOTION_KEYWORDS)) {
        for (const kw of keywords) {
            if (text.includes(kw.toLowerCase())) emotionCount++;
        }
    }
    score += Math.min(0.5, emotionCount * 0.1);

    return Math.min(1, score);
}

function getDurationScore(duration) {
    if (duration >= 15 && duration <= 30) return 1.0;
    if (duration >= 30 && duration <= 45) return 0.8;
    if (duration >= 45 && duration <= 60) return 0.6;
    if (duration >= 10 && duration <= 15) return 0.7;
    return 0.4;
}

function getPositionScore(startTime, totalDuration) {
    if (!totalDuration || totalDuration === 0) return 0.5;

    const position = startTime / totalDuration;

    if (position < 0.2) return 0.9;
    if (position > 0.4 && position < 0.6) return 1.0;
    if (position > 0.8) return 0.6;
    return 0.7;
}

function getEmotionScore(emotion) {
    const scores = {
        excitement: 1.0,
        surprise: 0.95,
        joy: 0.85,
        anger: 0.8,
        fear: 0.75,
        love: 0.7,
        sadness: 0.6,
        wisdom: 0.5,
        motivation: 0.55,
        default: 0.4,
    };
    return scores[emotion] || 0.4;
}
