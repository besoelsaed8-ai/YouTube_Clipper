import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Zap, ArrowRight, Film, Scissors, Sparkles, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { getVideoInfo } from '../api/api';
import SeoContent from './SeoContent';

export default function UrlInput({ onVideoFound, onFileUpload }) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [forceShorts, setForceShorts] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [youtubeStatus, setYoutubeStatus] = useState(''); // 'trying', 'success', 'failed'
    const fileInputRef = useRef(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setYoutubeStatus('');

        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!regex.test(url)) {
            setError('Please enter a valid YouTube URL');
            return;
        }

        setLoading(true);
        setYoutubeStatus('trying');

        try {
            const info = await getVideoInfo(url);
            setYoutubeStatus('success');
            onVideoFound(url, { ...info, shortsOnly: forceShorts });
        } catch (err) {
            setYoutubeStatus('failed');
            const errMsg = err.response?.data?.error || err.message || 'Failed to fetch video info';
            setError(errMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (file) => {
        if (file && file.type.startsWith('video/')) {
            setError('');
            setYoutubeStatus('');
            onFileUpload(file, forceShorts);
        } else {
            setError('Please upload a video file (MP4, MOV, AVI, MKV)');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 py-8">
            {/* Header */}
            <div className={`text-center space-y-5 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Free &amp; Open Source
                </div>
                <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">YouTube</span>
                    <br />
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Clipper</span>
                </h1>
                <p className="text-slate-400 text-lg font-light max-w-md mx-auto leading-relaxed">
                    Paste a video link or upload a file to get vertical short clips
                </p>
            </div>

            {/* Feature badges */}
            <div className={`flex flex-wrap items-center justify-center gap-3 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                {[{ icon: Film, text: 'Download' }, { icon: Scissors, text: 'Split' }, { icon: Zap, text: 'Crop 9:16' }].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-sm text-slate-400">
                        <Icon className="w-4 h-4 text-indigo-400" />
                        {text}
                    </div>
                ))}
            </div>

            {/* Main card */}
            <div className={`card pulse-glow transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                {/* Upload section — more prominent */}
                <div className="space-y-5">
                    {/* Upload area — shown first and bigger */}
                    <div
                        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            const file = e.dataTransfer.files[0];
                            handleFileSelect(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                            dragActive
                                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
                                : 'border-slate-600 hover:border-indigo-500/50 bg-gradient-to-br from-slate-800/50 to-slate-800/30 hover:from-indigo-500/5 hover:to-purple-500/5'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleFileSelect(file);
                                e.target.value = '';
                            }}
                        />
                        <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <Upload className="w-7 h-7 text-indigo-400" />
                        </div>
                        <p className="text-slate-200 text-base font-semibold mb-1">
                            <span className="text-indigo-400">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-slate-500 text-sm">
                            MP4, MOV, AVI, MKV — works offline, no watermarks
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-700/50" />
                        <span className="text-slate-500 text-sm font-medium">OR paste YouTube link</span>
                        <div className="flex-1 h-px bg-slate-700/50" />
                    </div>

                    {/* YouTube URL input */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => { setUrl(e.target.value); setError(''); setYoutubeStatus(''); }}
                                placeholder="https://youtube.com/watch?v=..."
                                className="input-field pl-14 text-base py-4 rounded-2xl"
                                disabled={loading}
                            />
                            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                            {url && !loading && (
                                <button type="button" onClick={() => { setUrl(''); setError(''); setYoutubeStatus(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Shorts mode toggle */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl text-indigo-400">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-slate-200">Vertical Shorts Mode</div>
                                    <div className="text-xs text-slate-500">Auto-crop to 9:16 aspect ratio</div>
                                </div>
                            </div>
                            <button type="button" onClick={() => setForceShorts(!forceShorts)} className={`w-12 h-6 rounded-full transition-all duration-300 relative ${forceShorts ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30' : 'bg-slate-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${forceShorts ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* YouTube status indicator */}
                        {youtubeStatus === 'trying' && (
                            <div className="text-indigo-400 text-sm bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                                <span>Trying multiple download services...</span>
                            </div>
                        )}

                        {youtubeStatus === 'success' && (
                            <div className="text-emerald-400 text-sm bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                <span>Video found! Loading settings...</span>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-slide-up">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 font-medium">{error}</p>
                                        {youtubeStatus === 'failed' && (
                                            <p className="text-slate-400 text-xs mt-2">
                                                💡 Tip: Try uploading the video file directly — it always works!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !url}
                            className="btn-primary w-full flex items-center justify-center gap-3 text-base py-4 rounded-2xl"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Analyzing Video...</span>
                                </>
                            ) : (
                                <>
                                    <span>Analyze YouTube Video</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* SEO Content */}
            <div className="max-w-5xl mx-auto"><SeoContent /></div>
        </div>
    );
}
