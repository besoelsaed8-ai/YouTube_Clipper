/**
 * AI Highlight Detection Service
 * Analyzes Whisper transcript to find the most engaging moments
 * Uses keyword analysis, energy detection, and timing analysis
 */

const { runWhisper } = require('./transcribe');

// ═══════════════════════════════════════════════════════════════
// ENGAGEMENT KEYWORDS (Arabic + English)
// ═══════════════════════════════════════════════════════════════

const ENGAGEMENT_KEYWORDS = {
    high: {
        arabic: [
            'يا halide', 'يا العرب', 'هذه', 'أول مرة', 'مذهل', 'مش معتقد',
            'يا إلهي', 'عجبني', 'مفاجأة', 'يا Toba', 'أخيراً', 'تجربة',
            'نقولك', 'صدقوني', 'مجهود', 'أساس', 'فخور', 'المهم',
            'هادة', 'يا غالي', 'يا عيني', 'يارب', 'آمنة', 'تبارك',
            'رائع', 'ممتاز', 'مبهر', 'ج씨티', 'قوي', 'ل Saints',
            'عاش', 'الله يوفق', 'عبقرية', 'عبقر', 'التقط', 'مستحيل',
            'لا يصدق', 'حصان', 'لا يصدق', 'رائع', 'مذهل', 'مبهرج'
        ],
        english: [
            'omg', 'wow', 'amazing', 'incredible', 'unbelievable',
            'shocking', 'insane', 'epic', 'lit', 'fire', 'viral',
            'best', 'worst', 'crazy', 'wild', 'hilarious', 'funny',
            'laugh', 'cry', 'love', 'hate', 'perfect', 'terrible',
            'great', 'awesome', 'brilliant', 'genius', 'failed',
            'success', 'win', 'lost', 'destroyed', 'crushed',
            'never seen', 'first time', 'secret', 'hidden', 'exposed'
        ]
    },
    emotional: {
        arabic: ['حب', 'بكاء', 'دموع', 'حزن', 'فرح', 'غضب', 'خوف', 'مخافة', 'أمل', 'ألم'],
        english: ['love', 'cry', 'sad', 'happy', 'angry', 'fear', 'hope', 'pain', 'heart', 'emotional']
    },
    questions: {
        arabic: ['مالذي', 'ليش', 'هل', 'مين', 'يعني', 'اتعرف', 'المعيار', 'الفرق'],
        english: ['what', 'why', 'how', 'who', 'when', 'where', 'did you', 'do you', 'can you']
    }
};

// ═══════════════════════════════════════════════════════════════
// CALCULATE CLIP SCORES
// ═══════════════════════════════════════════════════════════════

/**
 * Score each transcript segment for engagement potential
 * Returns array of { start, end, score, reasons }
 */
function scoreSegments(segments, language = 'ar') {
    const langKeywords = language.startsWith('ar') ? ENGAGEMENT_KEYWORDS.arabic : ENGAGEMENT_KEYWORDS.english;
    const emotionalKeywords = language.startsWith('ar') ? ENGAGEMENT_KEYWORDS.emotional.arabic : ENGAGEMENT_KEYWORDS.emotional.english;
    const questionKeywords = language.startsWith('ar') ? ENGAGEMENT_KEYWORDS.questions.arabic : ENGAGEMENT_KEYWORDS.questions.english;

    return segments.map((seg) => {
        let score = 50; // Base score
        const reasons = [];

        const text = seg.text.toLowerCase();

        // High engagement keywords
        const highKeywordMatches = ENGAGEMENT_KEYWORDS.high.arabic.filter(kw => text.includes(kw)).length +
            ENGAGEMENT_KEYWORDS.high.english.filter(kw => text.includes(kw)).length;
        if (highKeywordMatches > 0) {
            score += Math.min(highKeywordMatches * 8, 25);
            reasons.push(`${highKeywordMatches} engagement keyword${highKeywordMatches > 1 ? 's' : ''}`);
        }

        // Emotional content
        const emotionalMatches = emotionalKeywords.filter(kw => text.includes(kw)).length;
        if (emotionalMatches > 0) {
            score += Math.min(emotionalMatches * 6, 15);
            reasons.push(`emotional trigger${emotionalMatches > 1 ? 's' : ''}`);
        }

        // Questions (engagement)
        const questionMatches = questionKeywords.filter(kw => text.includes(kw)).length;
        if (questionMatches > 0) {
            score += Math.min(questionMatches * 10, 20);
            reasons.push('hook question');
        }

        // Length bonus — shorter = snappier
        if (seg.text.length < 50 && seg.text.length > 5) {
            score += 5;
            reasons.push('concise & punchy');
        }

        // Duration bonus — too long loses engagement
        const duration = seg.end - seg.start;
        if (duration > 15) score -= 5;
        if (duration > 30) score -= 10;

        // Energy scoring: multiple exclamation marks, caps
        const exclaimCount = (seg.text.match(/!/g) || []).length;
        const capsCount = (seg.text.match(/[A-Z]/g) || []).length;
        if (exclaimCount > 0) score += Math.min(exclaimCount * 4, 12);
        if (capsCount > 3 && text.length < 100) score += 5;

        return {
            start: seg.start,
            end: seg.end,
            score: Math.round(Math.min(100, Math.max(0, score))),
            text: seg.text.trim(),
            reasons,
            duration: duration,
        };
    });
}

/**
 * Find the best clips from scored segments
 * Groups nearby high-score moments into clips
 */
function findHighlights(scoredSegments, {
    minScore = 60,
    maxClips = 10,
    minClipDuration = 15,
    maxClipDuration = 90,
} = {}) {
    // Sort by score descending
    const sorted = [...scoredSegments].sort((a, b) => b.score - a.score);

    // Pick top segments above threshold
    const topSegments = sorted.filter(s => s.score >= minScore);

    if (topSegments.length === 0) {
        // Fallback: use evenly spaced segments
        const fallback = [];
        const totalDuration = scoredSegments[scoredSegments.length - 1]?.end || 60;
        const clipCount = Math.min(maxClips, Math.floor(totalDuration / 30));
        for (let i = 0; i < clipCount; i++) {
            fallback.push({
                start: i * 30,
                end: Math.min((i + 1) * 30, totalDuration),
                score: 50,
                text: '',
                reasons: ['even distribution'],
                duration: 30,
            });
        }
        return fallback;
    }

    // Merge nearby segments (within 5 seconds)
    const merged = [];
    const used = new Set();

    for (const seg of topSegments) {
        if (used.has(seg)) continue;

        let group = { ...seg, start: seg.start, end: seg.end, texts: [seg.text] };
        used.add(seg);

        // Merge neighbors within 5s gap
        for (const other of topSegments) {
            if (used.has(other)) continue;
            if (Math.abs(other.start - group.end) <= 5 || Math.abs(other.end - group.start) <= 5) {
                used.add(other);
                group.start = Math.min(group.start, other.start);
                group.end = Math.max(group.end, other.end);
                group.texts.push(other.text);
            }
        }

        // Skip if too short (unless it's under 15s)
        if (group.end - group.start >= minClipDuration) {
            merged.push({
                start: group.start,
                end: group.end,
                score: Math.round(group.score * (1 + (group.texts.length * 0.05))),
                text: group.texts.slice(0, 3).join(' ... '),
                reasons: group.reasons.slice(0, 3).join(', '),
                duration: group.end - group.start,
            });
        }
    }

    // Sort by score and limit
    merged.sort((a, b) => b.score - a.score);
    return merged.slice(0, maxClips);
}

/**
 * Generate AI-powered highlight clips
 * 1. Run Whisper transcription
 * 2. Score segments
 * 3. Find best moments
 * 4. Return clips with timestamps
 */
async function generateHighLights(videoPath, options = {}) {
    const {
        language = 'ar',
        maxClips = 10,
        minScore = 60,
        clipDuration = 30,
    } = options;

    console.log('[AI Highlights] Starting transcript analysis...');

    // Step 1: Run Whisper
    const transcript = await runWhisper(videoPath, language);
    if (!transcript || transcript.length === 0) {
        console.warn('[AI Highlights] No transcript available');
        return { clips: [], transcript: [], error: 'No speech detected' };
    }

    console.log(`[AI Highlights] Transcript: ${transcript.length} segments`);

    // Step 2: Score segments
    const scored = scoreSegments(transcript, language);
    const avgScore = scored.reduce((s, seg) => s + seg.score, 0) / scored.length;
    console.log(`[AI Highlights] Average engagement score: ${Math.round(avgScore)}/100`);

    // Step 3: Find highlights
    const highlights = findHighlights(scored, { minScore, maxClips, clipDuration });

    console.log(`[AI Highlights] Found ${highlights.length} best moments`);

    return {
        clips: highlights.map((h, i) => ({
            id: `hl_${i}`,
            name: `Highlight ${i + 1}.mp4`,
            startTime: h.start,
            endTime: h.end,
            duration: h.duration,
            score: h.score,
            reasons: h.reasons,
            transcript: h.text,
            suggestedTitle: generateTitle(h, language),
        })),
        transcript: transcript,
        analysis: {
            totalDuration: videoPath,
            avgScore: Math.round(avgScore),
            highlightCount: highlights.length,
            language,
        }
    };
}

/**
 * Generate a catchy title for a highlight clip
 */
function generateTitle(highlight, language = 'ar') {
    const snippets = highlight.text.split(' ').slice(0, 8).join(' ');

    if (language.startsWith('ar')) {
        const starters = ['🔥', '⚡', '💯', '😱', '🤯', '🎯', '✨'];
        const starter = starters[Math.floor(Math.random() * starters.length)];
        if (snippets.length > 20) return `${starter} ${snippets.substring(0, 25)}...`;
        return `${starter} ${snippets}`;
    } else {
        const phrases = ['🔥', '⚡', '💯', '😱', '🎯'];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        if (snippets.length > 40) return `${phrase} ${snippets.substring(0, 50)}...`;
        return `${phrase} ${snippets}`;
    }
}

module.exports = {
    generateHighLights,
    scoreSegments,
    findHighLights,
    generateTitle,
};
