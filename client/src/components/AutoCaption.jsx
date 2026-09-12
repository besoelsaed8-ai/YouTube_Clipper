import React, { useState } from 'react';
import { Mic, MicOff, Loader2, Check, AlertCircle, Volume2 } from 'lucide-react';
import { transcribeBlob, mergeSegments, isSpeechSupported, SPEECH_LANGUAGES } from '../api/speechRecognition';

/**
 * AutoCaption — button and UI for auto-captioning a video clip
 */
export default function AutoCaption({ clipBlob, onCaptionsReady, clipDuration }) {
    const [recognizing, setRecognizing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [partialText, setPartialText] = useState('');
    const [language, setLanguage] = useState('en-US');
    const [segments, setSegments] = useState([]);
    const [error, setError] = useState('');
    const [showLangPicker, setShowLangPicker] = useState(false);
    const [done, setDone] = useState(false);

    const supported = isSpeechSupported();
    const selectedLang = SPEECH_LANGUAGES.find(l => l.code === language) || SPEECH_LANGUAGES[0];

    const handleStart = async () => {
        if (!clipBlob) {
            setError('No video blob available');
            return;
        }

        setRecognizing(true);
        setProgress(0);
        setPartialText('');
        setSegments([]);
        setError('');
        setDone(false);

        try {
            const result = await transcribeBlob(clipBlob, language, {
                onProgress: (p) => setProgress(p),
                onPartial: ({ text }) => setPartialText(text),
                onResult: ({ text, segments: segs }) => {
                    setSegments(segs);
                    setPartialText('');
                },
                onError: (err) => {
                    if (err === 'no-speech') {
                        // Silently continue
                    } else {
                        setError(`Recognition error: ${err}`);
                    }
                },
            });

            // Merge short segments
            const merged = mergeSegments(result, { maxWords: 10, maxDuration: 5 });
            setSegments(merged);
            setDone(true);

            // Send to parent
            if (onCaptionsReady && merged.length > 0) {
                // Convert segments to text
                const fullText = merged.map(s => s.text).join(' ');
                onCaptionsReady(fullText, merged);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setRecognizing(false);
            setProgress(0);
        }
    };

    if (!supported) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-slate-500">Auto-captions need Chrome, Edge, or Safari</span>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Language picker + Start button */}
            <div className="flex items-center gap-2">
                {/* Language selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowLangPicker(!showLangPicker)}
                        disabled={recognizing}
                        className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-800/50 hover:bg-slate-800/80 rounded-lg text-xs text-slate-400 border border-slate-700/30 transition-all disabled:opacity-50"
                    >
                        <span>{selectedLang.flag}</span>
                        <span className="hidden sm:inline">{selectedLang.code.split('-')[0]}</span>
                    </button>

                    {showLangPicker && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowLangPicker(false)} />
                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                                <div className="p-1.5 max-h-48 overflow-y-auto">
                                    {SPEECH_LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLanguage(lang.code);
                                                setShowLangPicker(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                                                language === lang.code
                                                    ? 'bg-indigo-500/10 text-indigo-300'
                                                    : 'text-slate-400 hover:bg-slate-800/60'
                                            }`}
                                        >
                                            <span>{lang.flag}</span>
                                            <span>{lang.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Auto-caption button */}
                <button
                    onClick={handleStart}
                    disabled={recognizing || !clipBlob}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        done
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : recognizing
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20'
                    }`}
                >
                    {recognizing ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Listening... {progress}%</span>
                        </>
                    ) : done ? (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Done</span>
                        </>
                    ) : (
                        <>
                            <Mic className="w-3.5 h-3.5" />
                            <span>Auto Caption</span>
                        </>
                    )}
                </button>
            </div>

            {/* Progress bar */}
            {recognizing && (
                <div className="space-y-1.5">
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {partialText && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/5 rounded-lg">
                            <Volume2 className="w-3 h-3 text-purple-400 animate-pulse" />
                            <span className="text-[11px] text-purple-300 italic">"{partialText}"</span>
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 px-2 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <span className="text-[11px] text-red-400">{error}</span>
                </div>
            )}

            {/* Results preview */}
            {done && segments.length > 0 && (
                <div className="px-2 py-1.5 bg-green-500/5 rounded-lg border border-green-500/10">
                    <p className="text-[10px] text-green-400 font-medium mb-1">Auto-generated captions:</p>
                    <p className="text-[11px] text-slate-300 line-clamp-3">
                        {segments.map(s => s.text).join(' ')}
                    </p>
                </div>
            )}
        </div>
    );
}
