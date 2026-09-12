import React, { useState, useMemo } from 'react';
import { MessageSquare, Edit3, Check, X, Globe, AlignLeft, Type, Wand2 } from 'lucide-react';
import TranslationPicker from './TranslationPicker';
import AutoCaption from './AutoCaption';
import { translateText, textToSubtitles } from '../api/subtitleService';

/**
 * CaptionEditor — advanced editor with auto-captions, multi-line subtitles, and translation
 */
export default function CaptionEditor({ clip, index, onSave, clipDuration = 30 }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(clip.caption || '');
    const [targetLang, setTargetLang] = useState('ar');
    const [showTranslation, setShowTranslation] = useState(false);

    // Auto-generate subtitle preview
    const subtitlePreview = useMemo(() => {
        if (!text.trim()) return [];
        const translated = showTranslation ? translateText(text, targetLang) : text;
        return textToSubtitles(translated, clipDuration, {
            maxCharsPerLine: showTranslation && targetLang === 'ar' ? 30 : 40,
            maxLines: 2,
        });
    }, [text, clipDuration, showTranslation, targetLang]);

    const handleSave = () => {
        onSave(index, text.trim(), showTranslation ? targetLang : null);
        setEditing(false);
    };

    const handleCancel = () => {
        setText(clip.caption || '');
        setEditing(false);
        setShowTranslation(false);
    };

    const handleAutoCaption = (captionText) => {
        setText(captionText);
    };

    if (editing) {
        return (
            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-medium text-indigo-400">Subtitles</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={handleSave} className="p-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors" title="Save">
                            <Check className="w-3 h-3 text-white" />
                        </button>
                        <button onClick={handleCancel} className="p-1 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors" title="Cancel">
                            <X className="w-3 h-3 text-slate-300" />
                        </button>
                    </div>
                </div>

                {/* Auto-caption section */}
                {clip.blob && (
                    <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-[11px] font-medium text-purple-400">Auto Caption from Audio</span>
                        </div>
                        <AutoCaption
                            clipBlob={clip.blob}
                            clipDuration={clipDuration}
                            onCaptionsReady={handleAutoCaption}
                        />
                    </div>
                )}

                {/* Manual text input */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Or type manually:</span>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter subtitle text..."
                        maxLength={200}
                        rows={2}
                        className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none"
                    />
                    <p className="text-[10px] text-slate-600">{text.length}/200 characters</p>
                </div>

                {/* Translation toggle */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowTranslation(!showTranslation)}
                        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all ${
                            showTranslation
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:bg-slate-800'
                        }`}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        {showTranslation ? 'Translate' : 'Add Translation'}
                    </button>

                    {showTranslation && (
                        <TranslationPicker value={targetLang} onChange={setTargetLang} />
                    )}
                </div>

                {/* Translation preview */}
                {showTranslation && text.trim() && (
                    <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 space-y-1.5">
                        <p className="text-[10px] text-green-400 font-medium uppercase tracking-wider">Translation Preview</p>
                        <p className="text-sm text-slate-300" dir={targetLang === 'ar' ? 'rtl' : 'ltr'}>
                            {translateText(text, targetLang)}
                        </p>
                    </div>
                )}

                {/* Subtitle preview */}
                {text.trim() && (
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Subtitle Preview</p>
                        <div className="space-y-1.5">
                            {subtitlePreview.map((sub, i) => (
                                <div key={i} className="flex items-center gap-2 text-[11px]">
                                    <span className="text-slate-600 font-mono">{Math.floor(sub.start)}s</span>
                                    <span className="text-slate-400">→</span>
                                    <span className="text-slate-300" dir={showTranslation && targetLang === 'ar' ? 'rtl' : 'ltr'}>
                                        {sub.text.replace(/\n/g, ' / ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Non-editing view
    return (
        <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors group"
        >
            <MessageSquare className="w-3 h-3" />
            {clip.caption ? (
                <div className="flex items-center gap-1.5">
                    <span className="truncate max-w-[100px]">"{clip.caption}"</span>
                    {clip.subtitleLang && (
                        <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[9px] font-medium">
                            {clip.subtitleLang.toUpperCase()}
                        </span>
                    )}
                </div>
            ) : (
                <span>Add subtitles...</span>
            )}
            <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}
