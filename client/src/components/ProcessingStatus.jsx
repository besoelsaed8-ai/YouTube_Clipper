import React from 'react';
import { Loader2, CheckCircle, AlertCircle, Download, Scissors, RotateCcw, Upload, Sparkles, Film, Wand2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ProcessingStatus — professional step-by-step UI
 * Shows each processing phase with icon + label + status
 */

const PROCESSING_STEPS = [
    { key: 'downloading', label: 'جاري التحميل من يوتيوب', labelEn: 'Downloading from YouTube', icon: Download, progressRange: [0, 20] },
    { key: 'analyzing', label: 'تحليل المشاهد', labelEn: 'Analyzing scenes', icon: Film, progressRange: [20, 40] },
    { key: 'creating', label: 'إنشاء المقاطع', labelEn: 'Creating clips', icon: Scissors, progressRange: [40, 70] },
    { key: 'effects', label: 'تطبيق التأثيرات', labelEn: 'Applying effects', icon: Wand2, progressRange: [70, 90] },
    { key: 'finalizing', label: 'التجهيز النهائي', labelEn: 'Finalizing', icon: Sparkles, progressRange: [90, 100] },
];

function getStepStatus(step, currentProgress, overallStatus) {
    if (overallStatus === 'failed') return 'failed';
    if (overallStatus === 'completed') return 'done';
    
    const [min, max] = step.progressRange;
    if (currentProgress >= max) return 'done';
    if (currentProgress >= min && currentProgress < max) return 'active';
    return 'pending';
}

export default function ProcessingStatus({ status, progress, error, onRetry, onUploadFallback }) {
    // ── FAILED STATE ──
    if (status === 'failed') {
        const isYouTubeError = error?.toLowerCase().includes('youtube') || error?.toLowerCase().includes('download');
        return (
            <div className="w-full max-w-lg mx-auto space-y-6 text-center py-10 card animate-slide-up">
                <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                        <AlertCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">فشلت المعالجة</h2>
                        <p className="text-slate-400 mt-2 text-sm max-w-sm mx-auto leading-relaxed">
                            {isYouTubeError
                                ? 'تعذر تحميل الفيديو من يوتيوب. أحيانًا بعض الفيديوهات لها قيود.'
                                : error}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onUploadFallback}
                        className="btn-primary w-full flex items-center justify-center gap-3 text-base py-4 rounded-2xl"
                    >
                        <Upload className="w-5 h-5" />
                        ارفع الفيديو من جهازك
                    </button>

                    <button
                        onClick={onRetry}
                        className="w-full flex items-center justify-center gap-3 text-base py-4 rounded-2xl border border-slate-600 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all"
                    >
                        <RotateCcw className="w-5 h-5" />
                        حاول مرة أخرى
                    </button>

                    <button
                        onClick={onRetry}
                        className="w-full text-slate-500 hover:text-slate-300 text-sm py-2 transition-colors"
                    >
                        ← العودة للبداية
                    </button>
                </div>

                {isYouTubeError && (
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 text-left">
                        <p className="text-slate-400 text-xs leading-relaxed">
                            <span className="text-indigo-400 font-medium">💡 نصيحة:</span> بعض فيديوهات يوتيوب لها قيود تمنع التحميل. الأفضل تحمّل الفيديو من جهازك وترفعه هنا — دايمًا بيشتغل وأسرع.
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // ── COMPLETED STATE ──
    if (status === 'completed') {
        return (
            <div className="w-full max-w-lg mx-auto space-y-8 text-center py-12 card animate-slide-up">
                <div className="text-emerald-400 space-y-5">
                    <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">تم بنجاح!</h2>
                        <p className="text-slate-400 mt-1 text-sm">مقاطعك جاهزة للتحميل</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── IN PROGRESS STATE — Step by step ──
    return (
        <div className="w-full max-w-lg mx-auto space-y-8 py-8 card animate-slide-up">
            {/* Main spinner + percentage */}
            <div className="text-center space-y-4">
                <div className="relative">
                    <div className="w-24 h-24 mx-auto relative">
                        <div className="absolute inset-0 rounded-2xl border-[3px] border-indigo-500/10" />
                        <div className="absolute inset-0 rounded-2xl border-[3px] border-transparent border-t-indigo-500 animate-spin" />
                        <div className="absolute inset-3 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-pulse" />
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">جاري المعالجة</h2>
                    <p className="text-slate-400 text-lg font-medium mt-1">{Math.round(progress)}%</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs mx-auto bg-slate-800/80 h-2.5 rounded-full overflow-hidden border border-slate-700/50">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>

            {/* Step-by-step list */}
            <div className="space-y-1 px-4">
                {PROCESSING_STEPS.map((step, i) => {
                    const stepStatus = getStepStatus(step, progress, status);
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.key}
                            className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-300 ${
                                stepStatus === 'active'
                                    ? 'bg-indigo-500/5'
                                    : stepStatus === 'done'
                                    ? 'bg-emerald-500/5'
                                    : ''
                            }`}
                        >
                            {/* Icon */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                stepStatus === 'done'
                                    ? 'bg-emerald-500 text-white'
                                    : stepStatus === 'active'
                                    ? 'bg-indigo-500/20 text-indigo-400'
                                    : 'bg-slate-800 text-slate-600'
                            }`}>
                                {stepStatus === 'done' ? (
                                    <Check className="w-4 h-4" />
                                ) : stepStatus === 'active' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Icon className="w-4 h-4" />
                                )}
                            </div>

                            {/* Label */}
                            <div className="flex-1">
                                <span className={`text-sm font-medium ${
                                    stepStatus === 'done'
                                        ? 'text-emerald-400'
                                        : stepStatus === 'active'
                                        ? 'text-slate-200'
                                        : 'text-slate-600'
                                }`}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Status indicator */}
                            {stepStatus === 'done' && (
                                <span className="text-[10px] text-emerald-400 font-medium">✓</span>
                            )}
                            {stepStatus === 'active' && (
                                <span className="text-[10px] text-indigo-400 font-medium animate-pulse">●</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Helpful tip */}
            <div className="text-center">
                <p className="text-slate-600 text-xs">
                    قد يستغرق هذا بعض الوقت للفيديوهات الطويلة
                </p>
            </div>
        </div>
    );
}
