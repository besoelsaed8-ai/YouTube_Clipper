import React, { useState } from 'react';
import { Layout, Gamepad2, Mic, GraduationCap, TrendingUp, Music, Flame, Star, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Video Templates — preset configurations for different content types
 * Each template sets: duration, effects, caption style, and crop settings
 */

const TEMPLATES = [
    {
        id: 'youtube-shorts',
        name: 'YouTube Shorts',
        icon: <Flame className="w-5 h-5" />,
        color: 'text-red-400',
        bgColor: 'from-red-500/10 to-orange-500/10',
        borderColor: 'border-red-500/30',
        description: 'Optimized for YouTube Shorts — 60s max, vertical format',
        settings: {
            duration: 60,
            crop: true,
            effects: { color: 'none', zoom: 'none', speed: 'none' },
            captionStyle: 'bold',
        },
    },
    {
        id: 'tiktok',
        name: 'TikTok Viral',
        icon: <Music className="w-5 h-5" />,
        color: 'text-pink-400',
        bgColor: 'from-pink-500/10 to-purple-500/10',
        borderColor: 'border-pink-500/30',
        description: 'Fast-paced, high energy — 15-30s clips with zoom effects',
        settings: {
            duration: 30,
            crop: true,
            effects: { color: 'vibrant', zoom: 'slow-zoom', speed: 'none' },
            captionStyle: 'neon',
        },
    },
    {
        id: 'instagram-reels',
        name: 'Instagram Reels',
        icon: <Star className="w-5 h-5" />,
        color: 'text-purple-400',
        bgColor: 'from-purple-500/10 to-pink-500/10',
        borderColor: 'border-purple-500/30',
        description: 'Clean, aesthetic style — 30-60s with subtle effects',
        settings: {
            duration: 45,
            crop: true,
            effects: { color: 'warm', zoom: 'none', speed: 'none' },
            captionStyle: 'minimal',
        },
    },
    {
        id: 'gaming',
        name: 'Gaming Highlights',
        icon: <Gamepad2 className="w-5 h-5" />,
        color: 'text-green-400',
        bgColor: 'from-green-500/10 to-emerald-500/10',
        borderColor: 'border-green-500/30',
        description: 'Action-packed — 30s clips with zoom on key moments',
        settings: {
            duration: 30,
            crop: true,
            effects: { color: 'none', zoom: 'slow-zoom', speed: 'none' },
            captionStyle: 'gaming',
        },
    },
    {
        id: 'podcast',
        name: 'Podcast Clips',
        icon: <Mic className="w-5 h-5" />,
        color: 'text-blue-400',
        bgColor: 'from-blue-500/10 to-indigo-500/10',
        borderColor: 'border-blue-500/30',
        description: 'Talking-head style — 45-60s with face tracking',
        settings: {
            duration: 60,
            crop: true,
            effects: { color: 'none', zoom: 'none', speed: 'none' },
            captionStyle: 'clean',
        },
    },
    {
        id: 'tutorial',
        name: 'Tutorial Snippets',
        icon: <GraduationCap className="w-5 h-5" />,
        color: 'text-yellow-400',
        bgColor: 'from-yellow-500/10 to-amber-500/10',
        borderColor: 'border-yellow-500/30',
        description: 'Educational — 45s clips with clear captions',
        settings: {
            duration: 45,
            crop: false,
            effects: { color: 'none', zoom: 'none', speed: 'none' },
            captionStyle: 'clean',
        },
    },
    {
        id: 'trending',
        name: 'Trending/Viral',
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-orange-400',
        bgColor: 'from-orange-500/10 to-red-500/10',
        borderColor: 'border-orange-500/30',
        description: 'Maximum engagement — 15s clips with all effects',
        settings: {
            duration: 15,
            crop: true,
            effects: { color: 'vibrant', zoom: 'slow-zoom', speed: 'none' },
            captionStyle: 'bold',
        },
    },
];

const CAPTION_STYLES = [
    { id: 'bold', name: 'Bold', icon: '🔥', desc: 'Large, impactful text' },
    { id: 'neon', name: 'Neon', icon: '💎', desc: 'Glowing effect' },
    { id: 'clean', name: 'Clean', icon: '✨', desc: 'Simple and readable' },
    { id: 'minimal', name: 'Minimal', icon: '🎨', desc: 'Subtle, elegant' },
    { id: 'gaming', name: 'Gaming', icon: '🎮', desc: 'Pixel-style, energetic' },
];

/**
 * Templates — picker for video template presets
 */
export default function Templates({ selectedTemplate, onSelect }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-slate-300">Quick Templates</span>
                    {selectedTemplate && (
                        <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full text-[10px] font-medium">
                            {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                    {expanded ? 'Less' : 'All templates'}
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
            </div>

            {/* Template grid */}
            <div className={`grid gap-2 ${expanded ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {(expanded ? TEMPLATES : TEMPLATES.slice(0, 3)).map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onSelect(selectedTemplate === template.id ? null : template.id)}
                        className={`p-3 rounded-xl text-left transition-all duration-200 border ${
                            selectedTemplate === template.id
                                ? `bg-gradient-to-br ${template.bgColor} ${template.borderColor} shadow-lg`
                                : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600'
                        }`}
                    >
                        <div className={`flex items-center gap-2 mb-1.5 ${
                            selectedTemplate === template.id ? template.color : 'text-slate-500'
                        }`}>
                            {template.icon}
                            <span className={`text-xs font-semibold ${
                                selectedTemplate === template.id ? 'text-slate-200' : 'text-slate-400'
                            }`}>
                                {template.name}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                            {template.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Selected template details */}
            {selectedTemplate && (
                <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-3 animate-slide-up">
                    {(() => {
                        const t = TEMPLATES.find(t => t.id === selectedTemplate);
                        if (!t) return null;
                        return (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className={t.color}>{t.icon}</span>
                                    <span className="text-xs font-semibold text-slate-300">{t.name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="text-slate-500">Duration: <span className="text-slate-300">{t.settings.duration}s</span></div>
                                    <div className="text-slate-500">Format: <span className="text-slate-300">{t.settings.crop ? '9:16' : '16:9'}</span></div>
                                    <div className="text-slate-500">Color: <span className="text-slate-300">{t.settings.effects.color}</span></div>
                                    <div className="text-slate-500">Zoom: <span className="text-slate-300">{t.settings.effects.zoom}</span></div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}

/**
 * Get template settings by ID
 */
export function getTemplateSettings(templateId) {
    const template = TEMPLATES.find(t => t.id === templateId);
    return template ? template.settings : null;
}

/**
 * Get caption style name
 */
export function getCaptionStyleName(styleId) {
    const style = CAPTION_STYLES.find(s => s.id === styleId);
    return style ? style.name : 'Default';
}
