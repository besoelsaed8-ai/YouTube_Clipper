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
                                            Install <a href="https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc" target="_blank" rel="noreferrer" className="text-ind
