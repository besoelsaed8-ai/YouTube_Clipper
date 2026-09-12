import React, { useState, useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import UrlInput from './components/UrlInput';
import Settings from './components/Settings';
import ProcessingStatus from './components/ProcessingStatus';
import ClipGrid from './components/ClipGrid';
import VideoAd from './components/VideoAd';
import LandingPage from './components/LandingPage';
import SeoHead from './components/SeoHead';
import { downloadVideoFile } from './api/api';
import { processVideoClient, downloadClip } from './api/clientProcessor';
import { processHighlights } from './api/aiHighlights';
import HighlightsResult from './components/HighlightsResult';
import { Scissors } from 'lucide-react';
import AdBanner from './components/AdBanner';
import landingPages from './data/landingPages';

// Page imports
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

// ══════════════════════════════════════════════
// 📌 CONFIGURATION — Change these to your ad URLs
// ══════════════════════════════════════════════
const ADS = {
    preProcess: {
        videoUrl: '',
        duration: 5,
    },
    postProcess: {
        videoUrl: '',
        duration: 5,
    },
};
// ══════════════════════════════════════════════

function App() {
  return (
    <Routes>
      {/* ── Tool Page (Home) ── */}
      <Route path="/" element={<ToolPage />} />

      {/* ── SEO Landing Pages ── */}
      {Object.entries(landingPages).map(([path, data]) => (
        <Route key={path} path={path} element={<LandingPage data={data} />} />
      ))}

      {/* ── Blog ── */}
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />

      {/* ── Brand Pages ── */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

/**
 * The main tool page — all existing functionality preserved exactly as-is.
 */
function ToolPage() {
  const [step, setStep] = useState('input');
  const [videoInfo, setVideoInfo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [jobStatus, setJobStatus] = useState({ status: 'pending', progress: 0 });
  const [clips, setClips] = useState([]);
  const [aiClips, setAiClips] = useState(null);
  const [pendingSettings, setPendingSettings] = useState(null);
  const abortRef = useRef(false);

  const handleVideoFound = (url, info) => {
    setVideoUrl(url);
    setVideoInfo(info);
    setStep('settings');
  };

  const handleFileUpload = (file, shortsOnly) => {
    const localUrl = URL.createObjectURL(file);
    setVideoUrl(localUrl);
    setVideoInfo({
      title: file.name.replace(/\.[^/.]+$/, ''),
      thumbnail: null,
      duration: 0,
      id: 'local-' + Date.now(),
      isLocalFile: true,
      file: file,
      shortsOnly
    });
    setStep('settings');
  };

  const handleStartProcessing = (duration, crop, outputDir, shortsOnly, quality, aiMode = false, faceTrack = false, effects = {}) => {
    setPendingSettings({ duration, crop, outputDir, shortsOnly, quality, aiMode, faceTrack, effects });
    setStep('ad-pre');
  };

  const handleAdPreComplete = async () => {
    if (!pendingSettings) return;
    const { duration, crop, outputDir, shortsOnly, quality, aiMode, faceTrack, effects } = pendingSettings;

    setStep('processing');
    abortRef.current = false;

    try {
      let videoBlob;

      if (videoInfo?.isLocalFile && videoInfo?.file) {
        setJobStatus({ status: 'processing', progress: 10, error: null });
        videoBlob = videoInfo.file;
      } else {
        setJobStatus({ status: 'downloading', progress: 0, error: null });
        videoBlob = await downloadVideoFile(videoUrl, quality || 'best', (percent) => {
          setJobStatus(prev => ({ ...prev, progress: Math.floor(percent * 0.4) }));
        }, videoInfo?.cookies || null);
      }

      if (abortRef.current) return;

      setJobStatus({ status: 'processing', progress: 40, error: null });

      if (aiMode) {
        // AI Highlights mode
        const result = await processHighlights(videoBlob, {
          clipDuration: duration,
          crop: shortsOnly ? true : crop,
          maxClips: 10,
        }, (percent) => {
          setJobStatus(prev => ({ ...prev, progress: Math.floor(40 + percent * 0.6) }));
        }, (msg) => console.log('[AI]', msg));

        if (abortRef.current) return;

        setAiClips(result);
        setJobStatus({ status: 'completed', progress: 100, error: null });
        setStep('ad-post');
      } else {
        // Standard mode
        const processedClips = await processVideoClient(videoBlob, {
          duration,
          crop: shortsOnly ? true : crop,
          faceTrack: faceTrack && crop,
          effects,
          onProgress: (percent) => {
            setJobStatus(prev => ({ ...prev, progress: Math.floor(40 + percent * 0.6) }));
          },
          onLog: (msg) => console.log('[Client]', msg),
        });

        if (abortRef.current) return;

        setClips(processedClips);
        setJobStatus({ status: 'completed', progress: 100, error: null });
        setStep('ad-post');
      }

    } catch (error) {
      console.error('Processing error:', error);
      setJobStatus({ status: 'failed', progress: 0, error: error.message });
    }
  };

  const handleAdPostComplete = () => {
    setStep('results');
  };

  const handleDownloadClip = (clip) => {
    downloadClip(clip.data, clip.name);
  };

  const handleReset = () => {
    abortRef.current = true;
    setStep('input');
    setVideoInfo(null);
    setVideoUrl('');
    setClips([]);
    setAiClips(null);
    setPendingSettings(null);
    setJobStatus({ status: 'pending', progress: 0 });
  };

  const steps = [
    { key: 'input', label: 'URL' },
    { key: 'settings', label: 'Settings' },
    { key: 'processing', label: 'Processing' },
    { key: 'results', label: 'Results' },
  ];

  const stepOrder = ['input', 'settings', 'processing', 'results'];
  const currentIdx = stepOrder.indexOf(step);

  return (
    <>
      <SeoHead
        title="Free YouTube Clipper & Shorts Maker"
        description="Download YouTube videos and automatically split them into vertical shorts (9:16). Free, open-source, no signup required. Crop for TikTok, Reels & YouTube Shorts."
        canonicalPath="/"
        keywords="youtube clipper, youtube shorts maker, free video clipper, online video cutter, youtube to shorts, video splitter, tiktok video maker"
      />

      <div className="min-h-screen bg-animated relative">
        {/* Animated glow orbs */}
        <div className="glow-orb w-96 h-96 bg-indigo-600 top-[-10%] left-[-5%]" style={{ animationDelay: '0s' }} />
        <div className="glow-orb w-80 h-80 bg-purple-600 bottom-[-10%] right-[-5%]" style={{ animationDelay: '-7s' }} />
        <div className="glow-orb w-64 h-64 bg-blue-600 top-[40%] right-[10%]" style={{ animationDelay: '-14s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e15_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">
          {/* Top Ad Banner */}
          <AdBanner size="banner" className="mb-4" />

          {/* Header */}
          <header className="flex items-center justify-center gap-3 py-4 mb-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/20">
                <Scissors className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-lg font-bold text-slate-200 tracking-tight">YouTube Clipper</span>
            </Link>
          </header>

          {/* Step indicator */}
          {step !== 'input' && !step.startsWith('ad-') && (
            <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
              {steps.map((s, i) => (
                <React.Fragment key={s.key}>
                  <div className="flex items-center gap-2">
                    <div className={`step-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'inactive'}`} />
                    <span className={`text-xs font-medium ${i <= currentIdx ? 'text-slate-300' : 'text-slate-600'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 h-px ${i < currentIdx ? 'bg-emerald-500/50' : 'bg-slate-700/50'} transition-colors duration-500`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 flex flex-col items-center justify-center">
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {step === 'input' && (
                <UrlInput onVideoFound={handleVideoFound} onFileUpload={handleFileUpload} />
              )}

              {step === 'settings' && videoInfo && (
                <Settings
                  videoInfo={videoInfo}
                  onStartProcessing={handleStartProcessing}
                  onBack={() => setStep('input')}
                />
              )}

              {step === 'ad-pre' && (
                <VideoAd
                  videoUrl={ADS.preProcess.videoUrl}
                  duration={ADS.preProcess.duration}
                  onComplete={handleAdPreComplete}
                  adLabel="Sponsored"
                />
              )}

              {step === 'processing' && (
                <ProcessingStatus
                  status={jobStatus.status}
                  progress={jobStatus.progress}
                  error={jobStatus.error}
                />
              )}

              {step === 'ad-post' && (
                <VideoAd
                  videoUrl={ADS.postProcess.videoUrl}
                  duration={ADS.postProcess.duration}
                  onComplete={handleAdPostComplete}
                  adLabel="Sponsored"
                />
              )}

              {step === 'results' && aiClips && (
                <HighlightsResult
                  clips={aiClips.clips}
                  totalDuration={aiClips.totalDuration}
                  onReset={handleReset}
                />
              )}

              {step === 'results' && !aiClips && clips.length > 0 && (
                <ClipGrid clips={clips} onDownloadClip={handleDownloadClip} onReset={handleReset} />
              )}
            </div>
          </main>

          {/* Bottom Ad Banner */}
          <AdBanner size="banner" className="mt-auto pt-4" />

          {/* Footer with internal links */}
          <footer className="text-center py-4">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 mb-2">
              <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
              <span>·</span>
              <Link to="/youtube-clipper" className="hover:text-indigo-400 transition-colors">YouTube Clipper</Link>
              <span>·</span>
              <Link to="/youtube-shorts-maker" className="hover:text-indigo-400 transition-colors">Shorts Maker</Link>
              <span>·</span>
              <Link to="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link>
              <span>·</span>
              <Link to="/about" className="hover:text-indigo-400 transition-colors">About</Link>
            </div>
            <p className="text-slate-600 text-xs">
              Free &amp; open source · Powered by FFmpeg WASM
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

export default App;
