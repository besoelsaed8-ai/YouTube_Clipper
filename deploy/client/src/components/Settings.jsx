import React, { useState } from 'react';
import { Clock, Crop, ArrowRight, Play, FolderOpen, ArrowLeft, Check, Video, Gem, Sparkles, Zap, ScanFace } from 'lucide-react';
import EffectsEditor from './EffectsEditor';

export default function Settings({ videoInfo, onStartProcessing, onBack }) {
    const [duration, setDuration] = useState(30);
    const [crop, setCrop] = useState(videoInfo.shortsOnly || true);
    const [outputDir, setOutputDir] = useState('');
    const [quality, setQuality] = useState('best');
    const [aiMode, setAiMode] = useState(false);
    const [faceTrack, setFaceTrack] = useState(true);
    const [effects, setEffects] = useState({ color: 'none', zoom: 'none', speed: 'none' });

    const qualities = [
        { value: 'best', label: 'Best', desc: 'Highest available' },
        { value: '2160', label: '4K', desc: '2160p' },
        { value: '1080', label: '1080p', desc: 'Full HD' },
        { value: '720', label: '720p', desc: 'HD' },
        { value: '480', label: '480p', desc: 'SD' },
    ];

    const formatDuration = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back
            </button>

            <div className="card space-y-8 animate-slide-up">
                {/* Video preview */}
                <div className="flex gap-5 items-start">
                    <div className="relative group flex-shrink-0">
                        <img
                            src={videoInfo.thumbnail}
                            alt={videoInfo.title}
                            className="w-44 h-28 object-cover rounded-2xl shadow-xl ring-1 ring-white/10 group-hover:ring-indigo-500/40 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl" />
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white/90">
                            <Clock className="w-3 h-3" />
                            {formatDuration(videoInfo.duration)}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                        <h3 className="text-lg font-semibold text-slate-100 leading-snug line-clamp-2" title={videoInfo.title}>
                            {videoInfo.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                {videoInfo.duration}s total
                            </span>
                            <span className="text-xs text-slate-500">
                                → ~{Math.floor(videoInfo.duration / duration)} clips
                            </span>
                        </div>
                    </div>
                </div>

                {/* Settings */}
                <div className="space-y-6">
                    {/* Output dir */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" /> Save To (Server Path)
                        </label>
                        <input
                            type="text"
                            value={outputDir}
                            onChange={(e) => setOutputDir(e.target.value)}
                            placeholder="Default: server output folder"
                            className="input-field w-full rounded-xl"
                        />
                        <p className="text-[11px] text-slate-600 mt-2 px-1">
                            Leave empty for default location
                        </p>
                    </div>

                    {/* Clip duration */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Clip Duration
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[30, 45, 60].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 border text-center ${
                                        duration === d
                                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                                            : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-300'
                                    }`}
                                >
                                    <div className="text-lg">{d}s</div>
                                    <div className="text-[10px] opacity-60 mt-0.5">~{Math.floor(videoInfo.duration / d)} clips</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI Mode Toggle */}
                    <div>
                        <button
                            onClick={() => setAiMode(!aiMode)}
                            className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                                aiMode
                                    ? 'border-purple-500/40 bg-gradient-to-r from-purple-500/10 to-pink-500/10'
                                    : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                    aiMode ? 'bg-purple-500/20 shadow-inner' : 'bg-slate-800'
                                }`}>
                                    <Sparkles className={`w-6 h-6 ${aiMode ? 'text-purple-400' : 'text-slate-500'}`} />
                                </div>
                                <div className="text-left">
                                    <div className={`font-semibold text-base ${aiMode ? 'text-purple-300' : 'text-slate-300'} transition-colors`}>
                                        AI Smart Highlights
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {aiMode ? 'Analyzing scenes, audio & energy' : 'Auto-detect best moments with scene analysis'}
                                    </div>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                aiMode ? 'border-purple-500 bg-purple-500 shadow-lg shadow-purple-500/30' : 'border-slate-600'
                            }`}>
                                {aiMode && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                        </button>
                    </div>

                    {/* AI Mode info */}
                    {aiMode && (
                        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 space-y-2 animate-slide-up">
                            <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
                                <Zap className="w-4 h-4" />
                                AI Mode Active
                            </div>
                            <ul className="text-xs text-slate-400 space-y-1.5 ml-6">
                                <li>• Scene detection finds natural cuts and transitions</li>
                                <li>• Audio energy analysis highlights exciting moments</li>
                                <li>• Top {Math.min(10, Math.floor(videoInfo.duration / duration))} clips ranked by engagement score</li>
                                <li>• Add captions to each clip for social media</li>
                            </ul>
                        </div>
                    )}

                    {/* Face Tracking Toggle (only when crop is enabled) */}
                    {crop && (
                        <div>
                            <button
                                onClick={() => setFaceTrack(!faceTrack)}
                                className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                                    faceTrack
                                        ? 'border-green-500/40 bg-gradient-to-r from-green-500/10 to-emerald-500/10'
                                        : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                        faceTrack ? 'bg-green-500/20 shadow-inner' : 'bg-slate-800'
                                    }`}>
                                        <ScanFace className={`w-6 h-6 ${faceTrack ? 'text-green-400' : 'text-slate-500'}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-semibold text-base ${faceTrack ? 'text-green-300' : 'text-slate-300'} transition-colors`}>
                                            Face Tracking
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {faceTrack ? 'Following faces — crop moves with people' : 'Smart crop follows faces instead of center'}
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                    faceTrack ? 'border-green-500 bg-green-500 shadow-lg shadow-green-500/30' : 'border-slate-600'
                                }`}>
                                    {faceTrack && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                            </button>

                            {faceTrack && (
                                <div className="mt-2 bg-green-500/5 border border-green-500/15 rounded-xl p-3 text-xs text-green-300/70">
                                    <span className="font-medium">How it works:</span> The app analyzes your video and detects faces. The 9:16 crop automatically follows the person instead of staying in the center. Free — runs in your browser!
                                </div>
                            )}
                        </div>
                    )}

                    {/* Crop format (disabled in AI mode) */}
                    <div className={aiMode ? 'opacity-50 pointer-events-none' : ''}>
                        <label className="block text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                            <Crop className="w-4 h-4" /> Output Format
                        </label>

                        <button
                            onClick={() => setCrop(!crop)}
                            disabled={videoInfo.shortsOnly}
                            className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                                crop
                                    ? 'border-indigo-500/40 bg-gradient-to-r from-indigo-500/10 to-purple-500/10'
                                    : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
                            } ${videoInfo.shortsOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-[60px] rounded-xl border-2 transition-all duration-300 flex items-center justify-center ${
                                    crop ? 'border-indigo-400 bg-indigo-500/10 shadow-inner' : 'border-slate-600 bg-slate-800'
                                }`}>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${crop ? 'bg-indigo-400' : 'bg-slate-500'}`} />
                                        <div className={`w-4 h-1 rounded-full ${crop ? 'bg-indigo-400/50' : 'bg-slate-500/50'}`} />
                                        <div className={`w-4 h-1 rounded-full ${crop ? 'bg-indigo-400/50' : 'bg-slate-500/50'}`} />
                                        <div className={`w-3 h-1 rounded-full ${crop ? 'bg-indigo-400/50' : 'bg-slate-500/50'}`} />
                                    </div>
                                </div>
                                <div className="text-left">
                                    <div className={`font-semibold text-base ${crop ? 'text-indigo-300' : 'text-slate-300'} transition-colors`}>
                                        YouTube Shorts (9:16)
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {videoInfo.shortsOnly ? 'Auto-enabled for Shorts' : 'Optimized for TikTok, Reels & Shorts'}
                                    </div>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                crop ? 'border-indigo-500 bg-indigo-500 shadow-lg shadow-indigo-500/30' : 'border-slate-600'
                            }`}>
                                {crop && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Quality selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                            <Gem className="w-4 h-4" /> Video Quality
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {qualities.map((q) => (
                                <button
                                    key={q.value}
                                    onClick={() => setQuality(q.value)}
                                    className={`py-3 px-2 rounded-xl font-semibold transition-all duration-300 border text-center ${
                                        quality === q.value
                                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                                            : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-300'
                                    }`}
                                >
                                    <div className="text-sm font-bold">{q.label}</div>
                                    <div className="text-[10px] opacity-60 mt-0.5">{q.desc}</div>
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-2 px-1">
                            {quality === 'best' ? 'Downloads the highest quality available from YouTube' : `Caps download at ${qualities.find(q => q.value === quality)?.label || quality} resolution`}
                        </p>
                    </div>

                {/* Effects Editor */}
                <EffectsEditor effects={effects} onChange={setEffects} />

                {/* Start button */}
                <button
                    onClick={() => onStartProcessing(duration, crop, outputDir, videoInfo.shortsOnly, quality, aiMode, faceTrack && crop, effects)}
                    className={`w-full flex items-center justify-center gap-3 py-4 text-base rounded-2xl transition-all duration-300 ${
                        aiMode
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25'
                            : 'btn-primary'
                    }`}
                >
                    {aiMode ? <Sparkles className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{aiMode ? 'Analyze with AI' : 'Start Processing'}</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
