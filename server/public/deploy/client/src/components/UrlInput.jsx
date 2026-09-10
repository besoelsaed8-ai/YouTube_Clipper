import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Zap, ArrowRight, Film, Scissors, Sparkles, Upload, Cookie, ExternalLink } from 'lucide-react';
import { getVideoInfo } from '../api/api';
import SeoContent from './SeoContent';

export default function UrlInput({ onVideoFound, onFileUpload }) {
    const [url, setUrl] = useState('');
    const [cookies, setCookies] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [forceShorts, setForceShorts] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [showCookies, setShowCookies] = useState(false);
    const [cookiesSaved, setCookiesSaved] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        // Load saved cookies from localStorage
        const savedCookies = localStorage.getItem('youtube_cookies');
        if (savedCookies) {
            setCookies(savedCookies);
            setCookiesSaved(true);
        }
    }, []);

    const handleSaveCookies = () => {
        if (cookies.trim()) {
            localStorage.setItem('youtube_cookies', cookies);
            setCookiesSaved(true);
            setShowCookies(false);
        }
    };

    const handleClearCookies = () => {
        localStorage.removeItem('youtube_cookies');
        setCookies('');
        setCookiesSaved(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!regex.test(url)) {
            setError('Please enter a valid YouTube URL');
            return;
        }

        setLoading(true);
        try {
            const cookiesToSend = cookiesSaved ? cookies : null;
            const info = await getVideoInfo(url, cookiesToSend);
            onVideoFound(url, { ...info, shortsOnly: forceShorts, cookies: cookiesToSend });
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to fetch video info';
            if (errorMsg.includes('bot') || errorMsg.includes('Sign in') || errorMsg.includes('cookies')) {
                setError('YouTube requires authentication. Please add your cookies below.');
                setShowCookies(true);
            } else {
                setError(errorMsg);
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-10 py-8">
            {/* Hero title */}
            <div className={`text-center space-y-5 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Free &amp; Open Source
                </div>
                <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                        YouTube
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Clipper
                    </span>
                </h1>
                <p className="text-slate-400 text-lg font-light max-w-md mx-auto leading-relaxed">
                    Paste a video link → get vertical short clips in seconds
                </p>
            </div>

            {/* Feature pills */}
            <div className={`flex flex-wrap items-center justify-center gap-3 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                {[
                    { icon: Film, text: 'Download' },
                    { icon: Scissors, text: 'Split' },
                    { icon: Zap, text: 'Crop 9:16' },
                ].map(({ icon: Icon, text }, i) => (
                    <div key={text} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-sm text-slate-400">
                        <Icon className="w-4 h-4 text-indigo-400" />
                        {text}
                    </div>
                ))}
            </div>

            {/* Main card */}
            <div className={`card pulse-glow transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* URL input */}
                    <div className="relative group">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste YouTube link here..."
                            className="input-field pl-14 text-base py-4 rounded-2xl"
                            disabled={loading}
                        />
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                        {url && !loading && (
                            <button
                                type="button"
                                onClick={() => { setUrl(''); setError(''); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Cookies section */}
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4">
                        <button
                            type="button"
                            onClick={() => setShowCookies(!showCookies)}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors w-full"
                        >
                            <Cookie className="w-4 h-4 text-amber-400" />
                            <span className="font-medium">YouTube Authentication</span>
                            {cookiesSaved && (
                                <span className="ml-auto text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">✓ Saved</span>
                            )}
                        </button>
                        
                        {!showCookies && !cookiesSaved && (
                            <p className="text-xs text-slate-600 mt-2">
                                Required for YouTube downloads • <button type="button" onClick={() => setShowCookies(true)} className="text-indigo-400 hover:underline">Setup now</button>
                            </p>
                        )}

                        {showCookies && (
                            <div className="mt-4 space-y-3">
                                <div className="bg-slate-900/50 rounded-xl p-4 text-xs text-slate-400 space-y-2">
                                    <p className="font-medium text-slate-300">📋 How to get YouTube cookies:</p>
                                    <ol className="list-decimal list-inside space-y-1.5">
                                        <li>
                                            Install <a href="https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1">
                                                Get cookies.txt <ExternalLink className="w-3 h-3" />
                                            </a> extension
                                        </li>
                                        <li>Open <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">YouTube.com</a> and <strong className="text-slate-300">log in</strong></li>
                                        <li>Click the extension icon → <strong className="text-slate-300">Export</strong></li>
                                        <li>Paste the cookies below</li>
                                    </ol>
                                </div>
                                
                                <textarea
                                    value={cookies}
                                    onChange={(e) => setCookies(e.target.value)}
                                    placeholder="# Netscape HTTP Cookie File&#10;.youtube.com	TRUE	/	FALSE	0	CONSENT	YES+..."
                                    className="input-field text-xs h-28 resize-none font-mono bg-slate-900/50"
                                    disabled={loading}
                                />
                                
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSaveCookies}
                                        disabled={!cookies.trim()}
                                        className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-xl font-medium transition-colors"
                                    >
                                        Save Cookies
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCookies(false)}
                                        className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {cookiesSaved && !showCookies && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-green-400">✓ Cookies saved in browser</span>
                                <button
                                    type="button"
                                    onClick={handleClearCookies}
                                    className="text-xs text-red-400 hover:text-red-300"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-700/50" />
                        <span className="text-slate-500 text-sm">or</span>
                        <div className="flex-1 h-px bg-slate-700/50" />
                    </div>

                    {/* File upload */}
                    <div
                        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith('video/')) {
                                onFileUpload(file, forceShorts);
                            } else {
                                setError('Please upload a video file');
                            }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
                            dragActive 
                                ? 'border-indigo-500 bg-indigo-500/10' 
                                : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) onFileUpload(file, forceShorts);
                            }}
                        />
                        <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                        <p className="text-slate-400 text-sm">
                            <span className="text-indigo-400 font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-slate-600 text-xs mt-1">MP4, MOV, AVI, MKV</p>
                    </div>

                    {/* Shorts toggle */}
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
                        <button
                            type="button"
                            onClick={() => setForceShorts(!forceShorts)}
                            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${forceShorts ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${forceShorts ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 p-4 rounded-2xl border border-red-500/20 animate-slide-up">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Submit button */}
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
                                <span>Analyze Video</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* SEO Content Sections */}
            <div className="max-w-5xl mx-auto">
                <SeoContent />
            </div>
        </div>
    );
}
