import React from 'react';
import { List, Clock, ChevronRight, Flame, TrendingUp } from 'lucide-react';

/**
 * ClipListSidebar — navigation sidebar showing all clips with AI titles
 */

export default function ClipListSidebar({ clips, clipAnalysis, selectedIndex, onSelectClip }) {
    if (!clips || clips.length === 0) return null;

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getScoreBadge = (score) => {
        if (score >= 85) return { color: 'text-red-400 bg-red-500/10', icon: Flame, label: 'عالي الانتشار' };
        if (score >= 70) return { color: 'text-orange-400 bg-orange-500/10', icon: TrendingUp, label: 'متوسط' };
        return { color: 'text-slate-400 bg-slate-500/10', icon: null, label: '' };
    };

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2 px-1 mb-3">
                <List className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">المقاطع ({clips.length})</span>
            </div>

            {/* Clip list */}
            <div className="space-y-1.5">
                {clips.map((clip, index) => {
                    const isSelected = index === selectedIndex;
                    const analysis = clipAnalysis?.[index];
                    const duration = (clip.endTime || 30) - (clip.startTime || 0);
                    const scoreBadge = getScoreBadge(analysis?.score || 75);
                    const ScoreIcon = scoreBadge.icon;

                    return (
                        <button
                            key={index}
                            onClick={() => onSelectClip(index)}
                            className={`w-full text-right p-3 rounded-xl transition-all duration-200 border ${
                                isSelected
                                    ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                                    : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Number */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    isSelected
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-700 text-slate-400'
                                }`}>
                                    <span className="text-sm font-bold">{index + 1}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    {/* AI-generated title */}
                                    <p className={`text-sm font-medium truncate ${
                                        isSelected ? 'text-slate-200' : 'text-slate-400'
                                    }`}>
                                        {analysis?.title || `مقطع ${index + 1}`}
                                    </p>

                                    {/* Duration + Score */}
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3 text-slate-600" />
                                        <span className="text-[10px] text-slate-600">
                                            {formatDuration(clip.startTime)} - {formatDuration(clip.endTime)}
                                        </span>
                                        <span className="text-[10px] text-slate-600">•</span>
                                        <span className="text-[10px] text-slate-600">{formatDuration(duration)}</span>

                                        {/* Score badge */}
                                        {analysis?.score >= 70 && (
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${scoreBadge.color}`}>
                                                {ScoreIcon && <ScoreIcon className="w-2.5 h-2.5 inline mr-0.5" />}
                                                {analysis.score}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                    isSelected ? 'text-indigo-400' : 'text-slate-600'
                                }`} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
