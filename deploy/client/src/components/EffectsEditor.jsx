import React, { useState } from 'react';
import { Palette, ZoomIn, Gauge, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { COLOR_FILTERS, ZOOM_EFFECTS, SPEED_EFFECTS } from '../api/effectsLibrary';

/**
 * EffectsEditor — collapsible effects section with visual picker
 */
export default function EffectsEditor({ effects, onChange }) {
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const updateEffect = (category, value) => {
        onChange({ ...effects, [category]: value });
    };

    // Count active effects
    const activeCount = Object.values(effects).filter(v => v && v !== 'none').length;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-medium text-slate-300">Video Effects</span>
                    {activeCount > 0 && (
                        <span className="px-2 py-0.5 bg-pink-500/10 text-pink-400 rounded-full text-[10px] font-medium">
                            {activeCount} active
                        </span>
                    )}
                </div>
            </div>

            {/* Color Filters */}
            <EffectSection
                title="Color & Style"
                icon={<Palette className="w-4 h-4" />}
                color="text-purple-400"
                isOpen={openSection === 'color'}
                onToggle={() => toggleSection('color')}
                activeValue={effects.color}
            >
                <div className="grid grid-cols-4 gap-2">
                    {COLOR_FILTERS.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => updateEffect('color', filter.id)}
                            className={`p-2.5 rounded-xl text-center transition-all duration-200 border ${
                                effects.color === filter.id
                                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                                    : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-800/60 hover:border-slate-600'
                            }`}
                        >
                            <div className="text-lg mb-1">{filter.icon}</div>
                            <div className="text-[10px] font-medium leading-tight">{filter.name}</div>
                        </button>
                    ))}
                </div>
                {effects.color && effects.color !== 'none' && (
                    <p className="text-[11px] text-slate-500 mt-2 px-1">
                        {COLOR_FILTERS.find(f => f.id === effects.color)?.description}
                    </p>
                )}
            </EffectSection>

            {/* Zoom Effects */}
            <EffectSection
                title="Zoom & Movement"
                icon={<ZoomIn className="w-4 h-4" />}
                color="text-blue-400"
                isOpen={openSection === 'zoom'}
                onToggle={() => toggleSection('zoom')}
                activeValue={effects.zoom}
            >
                <div className="grid grid-cols-3 gap-2">
                    {ZOOM_EFFECTS.map((effect) => (
                        <button
                            key={effect.id}
                            onClick={() => updateEffect('zoom', effect.id)}
                            className={`p-3 rounded-xl text-center transition-all duration-200 border ${
                                effects.zoom === effect.id
                                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                                    : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-800/60 hover:border-slate-600'
                            }`}
                        >
                            <div className="text-lg mb-1">{effect.icon}</div>
                            <div className="text-[10px] font-medium leading-tight">{effect.name}</div>
                        </button>
                    ))}
                </div>
                {effects.zoom && effects.zoom !== 'none' && (
                    <p className="text-[11px] text-slate-500 mt-2 px-1">
                        {ZOOM_EFFECTS.find(f => f.id === effects.zoom)?.description}
                    </p>
                )}
            </EffectSection>

            {/* Speed Control */}
            <EffectSection
                title="Speed"
                icon={<Gauge className="w-4 h-4" />}
                color="text-green-400"
                isOpen={openSection === 'speed'}
                onToggle={() => toggleSection('speed')}
                activeValue={effects.speed}
            >
                <div className="grid grid-cols-3 gap-2">
                    {SPEED_EFFECTS.map((effect) => (
                        <button
                            key={effect.id}
                            onClick={() => updateEffect('speed', effect.id)}
                            className={`p-3 rounded-xl text-center transition-all duration-200 border ${
                                effects.speed === effect.id
                                    ? 'bg-green-500/10 border-green-500/40 text-green-300'
                                    : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-800/60 hover:border-slate-600'
                            }`}
                        >
                            <div className="text-lg mb-1">{effect.icon}</div>
                            <div className="text-[10px] font-medium leading-tight">{effect.name}</div>
                        </button>
                    ))}
                </div>
                {effects.speed && effects.speed !== 'none' && (
                    <p className="text-[11px] text-slate-500 mt-2 px-1">
                        {SPEED_EFFECTS.find(f => f.id === effects.speed)?.description}
                    </p>
                )}
            </EffectSection>
        </div>
    );
}

/**
 * Collapsible effect section
 */
function EffectSection({ title, icon, color, isOpen, onToggle, activeValue, children }) {
    const hasActive = activeValue && activeValue !== 'none';

    return (
        <div className={`rounded-xl border transition-all duration-200 ${
            isOpen ? 'border-slate-700/50 bg-slate-900/40' : 'border-slate-800/30 bg-transparent'
        }`}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
                <div className="flex items-center gap-2">
                    <span className={color}>{icon}</span>
                    <span className="text-xs font-medium text-slate-300">{title}</span>
                    {hasActive && (
                        <span className={`w-2 h-2 rounded-full bg-current ${color}`} />
                    )}
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
            </button>

            {isOpen && (
                <div className="px-4 pb-4 space-y-2 animate-slide-up">
                    {children}
                </div>
            )}
        </div>
    );
}
