/**
 * Speech Recognition Service
 * Uses Web Speech API to auto-caption video clips
 * Works in Chrome, Edge, Safari — falls back gracefully
 */

/**
 * Check if speech recognition is supported in this browser
 */
export function isSpeechSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Get supported languages for speech recognition
 */
export const SPEECH_LANGUAGES = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
    { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
    { code: 'id-ID', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
];

/**
 * Transcribe a video/audio blob using Web Speech API
 * @param {Blob} mediaBlob - the video/audio blob
 * @param {string} language - speech recognition language code
 * @param {object} callbacks - { onProgress, onPartial, onResult, onError }
 * @returns {Promise<Array<{text: string, startTime: number, confidence: number}>>}
 */
export async function transcribeBlob(mediaBlob, language = 'en-US', callbacks = {}) {
    const { onProgress, onPartial, onResult, onError } = callbacks;

    if (!isSpeechSupported()) {
        throw new Error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    // We need to extract audio from the video blob
    // Play the video in a hidden element and capture audio via SpeechRecognition
    return new Promise((resolve, reject) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const video = document.createElement('video');
        video.muted = false;
        video.preload = 'auto';
        video.style.display = 'none';
        document.body.appendChild(video);

        const url = URL.createObjectURL(mediaBlob);
        video.src = url;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = language;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        const segments = [];
        let currentSegment = null;
        let startTime = 0;

        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const text = result[0].transcript.trim();
                const confidence = result[0].confidence;

                if (result.isFinal) {
                    // Final result — save segment
                    const now = video.currentTime;
                    segments.push({
                        text,
                        startTime: startTime,
                        endTime: now,
                        confidence: Math.round(confidence * 100),
                    });
                    startTime = now;

                    if (onResult) {
                        onResult({ text, confidence: Math.round(confidence * 100), segments: [...segments] });
                    }
                } else {
                    // Partial result — update UI
                    if (onPartial) {
                        onPartial({ text, confidence: 0 });
                    }
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('[Speech Recognition] Error:', event.error);
            if (onError) onError(event.error);

            // Don't reject on non-fatal errors
            if (event.error === 'no-speech' || event.error === 'aborted') {
                // Continue — video is still playing
                return;
            }
        };

        recognition.onend = () => {
            // Restart recognition if video is still playing
            if (!video.ended && video.paused === false) {
                try {
                    recognition.start();
                } catch (e) {
                    // Already started, ignore
                }
            }
        };

        video.onended = () => {
            // Stop recognition when video ends
            try {
                recognition.stop();
            } catch (e) {}

            // Cleanup
            URL.revokeObjectURL(url);
            document.body.removeChild(video);

            resolve(segments);
        };

        video.onplay = () => {
            if (onProgress) onProgress(0);

            try {
                recognition.start();
            } catch (e) {
                console.error('[Speech Recognition] Start error:', e);
            }
        };

        video.ontimeupdate = () => {
            if (onProgress && video.duration) {
                onProgress(Math.round((video.currentTime / video.duration) * 100));
            }
        };

        video.onerror = (e) => {
            reject(new Error('Failed to load video for speech recognition'));
            URL.revokeObjectURL(url);
            document.body.removeChild(video);
        };

        // Start playback
        video.play().catch(err => {
            reject(new Error('Could not play video for speech recognition: ' + err.message));
        });
    });
}

/**
 * Convert speech segments to SRT format
 */
export function segmentsToSRT(segments) {
    return segments.map((seg, i) => {
        const formatTime = (s) => {
            const h = Math.floor(s / 3600).toString().padStart(2, '0');
            const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
            const sec = Math.floor(s % 60).toString().padStart(2, '0');
            const ms = Math.round((s % 1) * 1000).toString().padStart(3, '0');
            return `${h}:${m}:${sec},${ms}`;
        };

        return `${i + 1}\n${formatTime(seg.startTime)} --> ${formatTime(seg.endTime)}\n${seg.text}`;
    }).join('\n\n');
}

/**
 * Merge short segments into longer ones (for better subtitle readability)
 */
export function mergeSegments(segments, options = {}) {
    const { maxWords = 10, maxDuration = 5 } = options;

    if (segments.length === 0) return [];

    const merged = [];
    let current = { ...segments[0] };

    for (let i = 1; i < segments.length; i++) {
        const next = segments[i];
        const combinedText = current.text + ' ' + next.text;
        const wordCount = combinedText.split(/\s+/).length;
        const duration = next.endTime - current.startTime;

        if (wordCount <= maxWords && duration <= maxDuration) {
            // Merge
            current.text = combinedText;
            current.endTime = next.endTime;
            current.confidence = Math.round((current.confidence + next.confidence) / 2);
        } else {
            // Save current and start new
            merged.push(current);
            current = { ...next };
        }
    }

    merged.push(current);
    return merged;
}
