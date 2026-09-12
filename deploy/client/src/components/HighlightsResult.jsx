import React, { useState, useMemo, useCallback } from 'react';
import { Download, RefreshCw, Play, Sparkles, Check, Square, CheckSquare, DownloadCloud, Zap, Clock, TrendingUp, MessageSquare, Edit3 } from 'lucide-react';
import AdBanner from './AdBanner';
import CaptionEditor from './CaptionEditor';
import { formatTimestamp, getScoreColor } from '../api/aiHighlights';
import { downloadClip } from '../api/clientProcessor';

export default function HighlightsResult({ clips, totalDuration, onReset }) {
    const [selected, setSelected] = useState(new Set(clips.map((_, i) => i)));
    const [captions, setCaptions] = useState(
        clips.reduce((acc, clip, i) => {
            acc[i] = { text: clip.caption || '', lang: clip.subtitleLang || null };
            return acc;
        }, {})
    );

    // Calculate clip duration from first clip
    const clipDuration = clips.length > 0 ? (clips[0].endTime - clips[0].startTime) : 30;

    // Create object URLs and blobs for clips
    const clipUrls = useMemo(() => {
        return clips.map((clip) => {
            if (clip.data instanceof Uint8Array) {
                const blob = new Blob([clip.data], { type: 'video/mp4' });
                return URL.createObjectURL(blob);
            }
            return '';
        });
    }, [clips]);

    // Create blobs for auto-caption (kept in memory for speech recognition)
    const clipBlobs = useMemo(() => {
        return clips.map((clip) => {
            if (clip.data instanceof Uint8Array) {
                return new Blob([clip.data], { type: 'video/mp4' });
            }
            return null;
        });
    }, [clips]);

    React.useEffect(() => {
        return () => {
            clipUrls.forEach((url) => {
                if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
            });
        };
    }, [clipUrls]);

    const toggleSelect = useCallback((index) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    }, []);

    const handleCaptionSave = useCallback((index, text, lang = null) => {
        setCaptions(prev => ({ ...prev, [index]: { text, lang } }));
    }, []);

    const downloadSelected = useCallback(() => {
        selected.forEach((index) => {
            const clip = clips[index];
            const cap = captions[index];
            const name = cap?.text
                ? `clip_${clip.rank}_${cap.text.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`
                : `highlight_${clip.rank}_score${clip.score}.mp4`;
            downloadClip(clip.data, name);
        });
    }, [selected, clips, captions]);

    const allSelected = selected.size === clips.length;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 animate-slide-up">
            {/* Header with stats */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/20">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100">AI Highlights</h2>
                                <p className="text-slate-500 text-sm">
                                    {clips.length} best moments found
                                    {selected.size > 0 && (
                                        <span className="text-purple-400 ml-2">· {selected.size} selected</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (selected.size === clips.length) setSelected(new Set());
                                else setSelected(new Set(clips.map((_, i) => i)));
                            }}
                            className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium border border-slate-700/50 hover:border-slate-600 text-sm"
                        >
                            {allSelected ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4" />}
                            <span>{allSelected ? 'Deselect' : 'Select All'}</span>
                        </button>

                        {selected.size > 0 && (
                            <button
                                onClick={downloadSelected}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm shadow-lg shadow-purple-500/25 active:scale-95"
                            >
                                <DownloadCloud className="w-4 h-4" />
                                <span>Download ({selected.size})</span>
                            </button>
                        )}

                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium border border-slate-700/50 hover:border-slate-600 group"
                        >
                            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            <span className="hidden sm:inline">New Video</span>
                        </button>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/30 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-400">Source:</span>
                        <span className="text-slate-200 font-medium">{formatTimestamp(totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/30 text-xs">
                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-slate-400">Clips:</span>
                        <span className="text-slate-200 font-medium">{clips.length}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/30 text-xs">
                        <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-slate-400">Best score:</span>
                        <span className="text-slate-200 font-medium">{clips[0]?.score || 0}/100</span>
                    </div>
                </div>
            </div>

            {/* Content: Clips + Sidebar Ad */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Clips grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {clips.map((clip, index) => {
                        const clipUrl = clipUrls[index];
                        const isSelected = selected.has(index);

                        return (
                            <div
                                key={index}
                                onClick={() => toggleSelect(index)}
                                className={`group relative bg-slate-900/60 rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer hover:-translate-y-1 ${
                                    isSelected
                                        ? 'border-purple-500/60 shadow-lg shadow-purple-500/15 ring-1 ring-purple-500/30'
                                        : 'border-slate-800/50 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10'
                                }`}
                            >
                                {/* Rank badge */}
                                <div className="absolute top-3 left-3 z-20">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg ${
                                        clip.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                                        clip.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' :
                                        clip.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                                        'bg-slate-800/90 text-slate-300 border border-slate-700/50'
                                    }`}>
                                        #{clip.rank}
                                    </div>
                                </div>

                                {/* Score badge */}
                                <div className="absolute top-3 right-3 z-20">
                                    <div className={`px-2 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm ${getScoreColor(clip.score)}`}>
                                        {clip.score}
                                    </div>
                                </div>

                                {/* Video preview */}
                                <div className="aspect-[9/16] bg-slate-950 relative overflow-hidden">
                                    <video
                                        src={clipUrl}
                                        className="w-full h-full object-cover"
                                        preload="metadata"
                                        onMouseEnter={(e) => e.target.play()}
                                        onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                                    {/* Bottom info overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
                                        {/* Label */}
                                        <div className="text-xs font-medium">{clip.label}</div>

                                        {/* Timestamp */}
                                        <div className="flex items-center gap-1 text-[11px] text-white/70">
                                            <Clock className="w-3 h-3" />
                                            {formatTimestamp(clip.startTime)} — {formatTimestamp(clip.endTime)}
                                        </div>

                                        {/* Caption preview */}
                                        {captions[index]?.text && (
                                            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs text-white/90 border border-white/10" dir={captions[index]?.lang === 'ar' ? 'rtl' : 'ltr'}>
                                                "{captions[index].text}"
                                                {captions[index]?.lang && (
                                                    <span className="ml-1.5 px-1 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[9px] font-medium">
                                                        {captions[index].lang.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selection checkbox */}
                                    <div className={`absolute top-14 left-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 z-20 ${
                                        isSelected
                                            ? 'bg-purple-500 shadow-lg shadow-purple-500/40'
                                            : 'bg-black/50 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100'
                                    }`}>
                                        {isSelected ? (
                                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                        ) : (
                                            <Square className="w-3.5 h-3.5 text-white/70" />
                                        )}
                                    </div>

                                    {/* Play indicator */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                            <Play className="w-5 h-5 text-white ml-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer with caption editor */}
                                <div className="p-3.5 bg-slate-900/80 border-t border-slate-800/50 space-y-2">
                                    {/* Caption editor */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <CaptionEditor
                                            clip={{ ...clip, caption: captions[index]?.text || clip.caption, blob: clipBlobs[index] }}
                                            index={index}
                                            onSave={handleCaptionSave}
                                            clipDuration={clipDuration}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                            <span>⚡ {clip.energy}% energy</span>
                                            <span>•</span>
                                            <span>🎭 {clip.dynamicity} cuts</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const cap = captions[index];
                                                const name = cap?.text
                                                    ? `clip_${clip.rank}_${cap.text.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`
                                                    : `highlight_${clip.rank}_score${clip.score}.mp4`;
                                                downloadClip(clip.data, name);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-purple-500/20 active:scale-95"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Save</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sidebar Ad */}
                <div className="hidden lg:flex flex-col items-center gap-4 sticky top-8 self-start w-[300px] flex-shrink-0">
                    <AdBanner size="sidebar" />
                    <AdBanner size="inline" />
                </div>
            </div>

            {/* Tips section */}
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Tips for Best Results
                </h3>
                <ul className="space-y-2 text-xs text-slate-500">
                    <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>Use Auto Caption to transcribe audio automatically — or type manually</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>Add translation in any language — subtitles are burned into the video</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>Higher scores mean more dynamic content — perfect for Shorts & TikTok</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
