import React from 'react';
import { Star, TrendingUp, Flame, Zap, Heart } from 'lucide-react';

/**
 * EngagementScore — AI-powered engagement rating for video clips
 * Shows a numeric score (0-100) + star rating + quality label
 */

const QUALITY_LEVELS = [
    { min: 90, label: 'ممتاز جدًا', labelEn: 'Exceptional', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', stars: 5, icon: Flame },
    { min: 75, label: 'ممتاز', labelEn: 'Excellent', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30', stars: 4, icon: TrendingUp },
    { min: 60, label: 'جيد جدًا', labelEn: 'Very Good', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', stars: 4, icon: Zap },
    { min: 45, label: 'جيد', labelEn: 'Good', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', stars: 3, icon: Heart },
    { min: 30, label: 'مقبول', labelEn: 'Fair', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', stars: 2, icon: null },
    { min: 0, label: 'ضعيف', labelEn: 'Weak', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', stars: 1, icon: null },
];

function getQualityLevel(score) {
    return QUALITY_LEVELS.find(level => score >= level.min) || QUALITY_LEVELS[QUALITY_LEVELS.length - 1];
}

function StarRating({ rating, maxStars = 5 }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: maxStars }, (_, i) => (
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                        i < rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-600'
                    }`}
                />
            ))}
        </div>
    );
}

export default function EngagementScore({ score, compact = false }) {
    const level = getQualityLevel(score);
    const Icon = level.icon;

    if (compact) {
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${level.bgColor} ${level.borderColor}`}>
                <span className={`text-lg font-bold ${level.color}`}>{score}</span>
                <span className="text-slate-500 text-xs">/100</span>
                <StarRating rating={level.stars} />
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-2xl border ${level.bgColor} ${level.borderColor}`}>
            <div className="flex items-center gap-4">
                {/* Score circle */}
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-3 border-slate-700 flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-slate-700"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${(score / 100) * 176} 176`}
                                className={level.color}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className={`text-xl font-bold ${level.color}`}>{score}</span>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm">قيمة التفاعل:</span>
                        <span className={`font-bold ${level.color}`}>/100</span>
                        {Icon && <Icon className={`w-4 h-4 ${level.color}`} />}
                    </div>
                    <StarRating rating={level.stars} />
                    <p className={`text-xs font-medium ${level.color}`}>{level.label}</p>
                </div>
            </div>
        </div>
    );
}
