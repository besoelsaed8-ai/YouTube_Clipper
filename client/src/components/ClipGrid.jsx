import React, { useState, useCallback, useMemo } from 'react';
import { Download, RefreshCw, Play, Sparkles, Check, Square, CheckSquare, DownloadCloud, Share2, Scissors, Maximize2, TrendingUp, Heart, Flame, ExternalLink } from 'lucide-react';
import AdBanner from './AdBanner';
import EngagementScore from './EngagementScore';
import ClipListSidebar from './ClipListSidebar';
import TranscriptView from './TranscriptView';
import { generateClipTitle, calculateViralScore } from '../api/clipAnalyzer';

const SOCIAL_PLATFORMS = [
    { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/upload', color: 'bg-black hover:bg-gray-800', icon: '🎵' },
    { id: 'youtube', name: 'YouTube Shorts', url: 'https://studio.youtube.com/channel/UC/videos/upload?flow=shorts', color: 'bg-red-600 hover:bg-red-500', icon: '📺' },
    { id: 'instagram', name: 'Instagram Reels', url: 'https://www.instagram.com/reels/', color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400', icon: '📸' },
    { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/reels/', color: 'bg-blue-600 hover:bg-blue-500', icon: '👤' },
];

export default function ClipGrid({ clips, onDownloadClip, onReset, totalDuration = 300 }) {
    const [selected, setSelected] = useState(new Set());
    const [selectedClipIndex, setSelectedClipIndex] = useState(0);
    const [showShareMenu, setShowShareMenu] = useState(false);

    // Create object URLs for client-side clips (Uint8Array)
    const clipUrls = useMemo(() => {
        return clips.map((clip) => {
            if (clip.url) return clip.url;
            if (clip.data instanceof Uint8Array) {
                const blob = new Blob([clip.data], { type: 'video/mp4' });
                return URL.createObjectURL(blob);
            }
            return '';
        });
    }, [clips]);

    // Cleanup object URLs on unmount
    React.useEffect(() => {
        return () => {
            clipUrls.forEach((url) => {
                if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
            });
        };
    }, [clipUrls]);

    // Generate AI titles and viral scores for each clip
    const clipAnalysis = useMemo(() => {
        return clips.map((clip, index) => {
            const title = generateClipTitle(clip, index);
            const { score, factors, emotion, category } = calculateViralScore(clip, totalDuration);
            return { title, score, factors, emotion, category };
        });
    }, [clips, totalDuration]);

    const toggleSelect = useCallback((index) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    const toggleAll = useCallback(() => {
        if (selected.size === clips.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(clips.map((_, i) => i)));
        }
    }, [clips, selected.size]);

    const downloadSelected = useCallback(() => {
        selected.forEach((index) => {
            if (onDownloadClip) {
                onDownloadClip(clips[index]);
            }
        });
    }, [selected, clips, onDownloadClip]);

    const handleShare = useCallback(async (platform) => {
        const clip = clips[selectedClipIndex];
        if (!clip) return;

        // Download the clip first
        const blob = new Blob([clip.data], { type: 'video/mp4' });
        const file = new File([blob], `${clipAnalysis[selectedClipIndex]?.title || 'clip'}.mp4`, { type: 'video/mp4' });

        // Try Web Share API first
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: clipAnalysis[selectedClipIndex]?.title || 'My Clip',
                });
                setShowShareMenu(false);
                return;
            } catch (e) {
                // User cancelled or error
            }
        }

        // Fallback: download and open platform
        onDownloadClip(clip);
        window.open(platform.url, '_blank');
        setShowShareMenu(false);
    }, [clips, selectedClipIndex, clipAnalysis, onDownloadClip]);

    const allSelected = selected.size === clips.length;
    const currentClip = clips[selectedClipIndex];
    const currentAnalysis = clipAnalysis[selectedClipIndex];

    const getEmotionIcon = (emotion) => {
        const icons = {
            joy: '😊',
            anger: '😡',
            sadness: '😢',
            excitement: '🔥',
            love: '❤️',
            fear: '😨',
            surprise: '😲',
            wisdom: '💡',
            motivation: '💪',
            default: '⭐',
        };
        return icons[emotion] || icons.default;
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-slide-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/20">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-100">مقاطعك جاهزة</h2>
                            <p className="text-slate-500 text-sm">
                                {clips.length} مقاطع جاهزة — تم تحليلها بالذكاء الاصطناعي
                                {selected.size > 0 && (
                                    <span className="text-indigo-400 ml-2">
                                        · {selected.size} محدد
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleAll}
                        className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium border border-slate-700/50 hover:border-slate-600 text-sm"
                    >
                        {allSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                            <Square className="w-4 h-4" />
                        )}
                        <span>{allSelected ? 'إلغاء التحديد' : 'تحديد الكل'}</span>
                    </button>

                    {selected.size > 0 && (
                        <button
                            onClick={downloadSelected}
                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm shadow-lg shadow-indigo-500/25 active:scale-95"
                        >
                            <DownloadCloud className="w-4 h-4" />
                            <span>تحميل ({selected.size})</span>
                        </button>
                    )}

                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium border border-slate-700/50 hover:border-slate-600 group"
                    >
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="hidden sm:inline">فيديو جديد</span>
                    </button>
                </div>
            </div>

            {/* Main layout: Sidebar + Clip Preview + Details */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar — Clip List with AI Titles */}
                <div className="lg:w-80 flex-shrink-0">
                    <ClipListSidebar
                        clips={clips}
                        clipAnalysis={clipAnalysis}
                        selectedIndex={selectedClipIndex}
                        onSelectClip={setSelectedClipIndex}
                    />
                </div>

                {/* Center — Clip Preview */}
                <div className="flex-1 min-w-0">
                    <div className="bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-800/50">
                        {/* Clip number + AI title */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={selected.has(selectedClipIndex)}
                                    onChange={() => toggleSelect(selectedClipIndex)}
                                    className="w-4 h-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500/20"
                                />
                                <span className="text-sm font-medium text-slate-300">
                                    {selectedClipIndex + 1}. {currentAnalysis?.title || `مقطع ${selectedClipIndex + 1}`}
                                </span>
                                <span className="text-lg">{getEmotionIcon(currentAnalysis?.emotion)}</span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 relative">
                                {/* Share button with dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowShareMenu(!showShareMenu)}
                                        className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                                        title="مشاركة"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>

                                    {/* Share dropdown */}
                                    {showShareMenu && (
                                        <div className="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-up">
                                            <div className="p-2 border-b border-slate-700">
                                                <p className="text-xs text-slate-400 px-2">شارك على</p>
                                            </div>
                                            {SOCIAL_PLATFORMS.map((platform) => (
                                                <button
                                                    key={platform.id}
                                                    onClick={() => handleShare(platform)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-right"
                                                >
                                                    <span className="text-lg">{platform.icon}</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-slate-200">{platform.name}</p>
                                                        <p className="text-[10px] text-slate-500">حمّل وارفع</p>
                                                    </div>
                                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => currentClip && onDownloadClip(currentClip)}
                                    className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                                    title="تحميل"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors" title="قص">
                                    <Scissors className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors" title="ملء الشاشة">
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Video player */}
                        <div className="aspect-[9/16] max-h-[500px] mx-auto bg-black relative">
                            {clipUrls[selectedClipIndex] && (
                                <video
                                    key={selectedClipIndex}
                                    src={clipUrls[selectedClipIndex]}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar — Score + Transcript + Viral Factors */}
                <div className="lg:w-80 flex-shrink-0 space-y-4">
                    {/* Engagement Score */}
                    <EngagementScore score={currentAnalysis?.score || 75} />

                    {/* Viral Factors */}
                    {currentAnalysis?.factors && (
                        <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm font-medium text-slate-300">عوامل الانتشار</span>
                            </div>
                            <div className="space-y-2">
                                <FactorBar label="الطاقة" value={currentAnalysis.factors.energy} max={20} color="bg-red-400" />
                                <FactorBar label="التفاعل" value={currentAnalysis.factors.engagement} max={25} color="bg-blue-400" />
                                <FactorBar label="المدة" value={currentAnalysis.factors.duration} max={15} color="bg-green-400" />
                                <FactorBar label="الموقع" value={currentAnalysis.factors.position} max={10} color="bg-yellow-400" />
                                <FactorBar label="الحركة" value={currentAnalysis.factors.dynamicity} max={15} color="bg-purple-400" />
                                <FactorBar label="المشاعر" value={currentAnalysis.factors.emotion} max={15} color="bg-pink-400" />
                            </div>
                        </div>
                    )}

                    {/* Social Share Quick Buttons */}
                    <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-pink-400" />
                            <span className="text-sm font-medium text-slate-300">نشر سريع</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {SOCIAL_PLATFORMS.map((platform) => (
                                <button
                                    key={platform.id}
                                    onClick={() => handleShare(platform)}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-medium transition-all ${platform.color}`}
                                >
                                    <span>{platform.icon}</span>
                                    <span>{platform.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Transcript */}
                    <TranscriptView clip={currentClip} clipIndex={selectedClipIndex} />

                    {/* Download button */}
                    <button
                        onClick={() => currentClip && onDownloadClip(currentClip)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-indigo-500/25 active:scale-95"
                    >
                        <Download className="w-5 h-5" />
                        <span>تحميل هذا المقطع</span>
                    </button>
                </div>
            </div>

            {/* Ad Banner */}
            <div className="flex justify-center">
                <AdBanner size="banner" />
            </div>
        </div>
    );
}

/**
 * FactorBar — visual bar showing a scoring factor
 */
function FactorBar({ label, value, max, color }) {
    const percentage = Math.min(100, (value / max) * 100);
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-12 text-right">{label}</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-[10px] text-slate-600 w-6">{value}</span>
        </div>
    );
}
