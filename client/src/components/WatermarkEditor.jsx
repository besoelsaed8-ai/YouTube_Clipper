import React, { useState } from 'react';
import { Type, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

/**
 * WatermarkEditor — text overlay settings for video clips
 */

const POSITIONS = [
    { id: 'top-left', label: 'Top Left', icon: '↖' },
    { id: 'top-center', label: 'Top Center', icon: '↑' },
    { id: 'top-right', label: 'Top Right', icon: '↗' },
    { id: 'bottom-left', label: 'Bottom Left', icon: '↙' },
    { id: 'bottom-center', label: 'Bottom Center', icon: '↓' },
    { id: 'bottom-right', label: 'Bottom Right', icon: '↘' },
    { id: 'center', label: 'Center', icon: '●' },
];

const FONT_SIZES = [
    { id: 'small', label: 'S', value: 16 },
    { id: 'medium', label: 'M', value: 24 },
    { id: 'large', label: 'L', value: 32 },
    { id: 'xlarge', label: 'XL', value: 48 },
];

const COLORS = [
    { id: 'white', value: '#ffffff', name: 'White' },
    { id: 'yellow', value: '#fbbf24', name: 'Yellow' },
    { id: 'red', value: '#ef4444', name: 'Red' },
    { id: 'blue', value: '#3b82f6', name: 'Blue' },
    { id: 'green', value: '#22c55e', name: 'Green' },
    { id: 'pink', value: '#ec4899', name: 'Pink' },
    { id: 'orange', value: '#f97316', name: 'Orange' },
    { id: 'purple', value: '#a855f7', name: 'Purple' },
];

export default function WatermarkEditor({ watermark, onChange }) {
    const [showPreview, setShowPreview] = useState(false);

    const update = (key, value) => {
        onChange({ ...watermark, [key]: value });
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-slate-300">Text Overlay</span>
                    {watermark?.text && (
                        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-full text-[10px] font-medium">
                            Active
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                    {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPreview ? 'Hide' : 'Preview'}
                </button>
            </div>

            {/* Text input */}
            <div className="space-y-2">
                <input
                    type="text"
                    value={watermark?.text || ''}
                    onChange={(e) => update('text', e.target.value)}
                    placeholder="Add text overlay (e.g., @yourchannel)"
                    maxLength={50}
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                />
                <p className="text-[10px] text-slate-600 px-1">{(watermark?.text || '').length}/50 characters</p>
            </div>

            {/* Font size */}
            <div>
                <label className="text-[11px] text-slate-500 mb-2 block">Size</label>
                <div className="flex gap-2">
                    {FONT_SIZES.map((size) => (
                        <button
                            key={size.id}
                            onClick={() => update('fontSize', size.id)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                                watermark?.fontSize === size.id
                                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                                    : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {size.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color */}
            <div>
                <label className="text-[11px] text-slate-500 mb-2 block">Color</label>
                <div className="flex gap-2">
                    {COLORS.map((color) => (
                        <button
                            key={color.id}
                            onClick={() => update('color', color.id)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                watermark?.color === color.id
                                    ? 'border-white scale-110 shadow-lg'
                                    : 'border-slate-700/30 hover:border-slate-600'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                </div>
            </div>

            {/* Position */}
            <div>
                <label className="text-[11px] text-slate-500 mb-2 block">Position</label>
                <div className="grid grid-cols-7 gap-1">
                    {POSITIONS.map((pos) => (
                        <button
                            key={pos.id}
                            onClick={() => update('position', pos.id)}
                            className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-all border ${
                                watermark?.position === pos.id
                                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                                    : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-300'
                            }`}
                            title={pos.label}
                        >
                            {pos.icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Background */}
            <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-500">Background</label>
                <button
                    onClick={() => update('background', !watermark?.background)}
                    className={`w-10 h-5 rounded-full transition-all relative ${
                        watermark?.background ? 'bg-orange-500' : 'bg-slate-700'
                    }`}
                >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        watermark?.background ? 'left-5' : 'left-0.5'
                    }`} />
                </button>
            </div>

            {/* Preview */}
            {showPreview && watermark?.text && (
                <div className="bg-slate-900/60 border border-slate-700/30 rounded-xl p-4">
                    <p className="text-[10px] text-slate-500 mb-2">Preview</p>
                    <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg aspect-video flex items-center justify-center">
                        <div className="text-white text-xs">Video Preview</div>
                        <div
                            className={`absolute text-xs font-bold px-2 py-1 rounded ${
                                watermark?.background ? 'bg-black/60' : ''
                            }`}
                            style={{
                                color: COLORS.find(c => c.id === watermark?.color)?.value || '#fff',
                                fontSize: FONT_SIZES.find(s => s.id === watermark?.fontSize)?.value || 24,
                                ...(watermark?.position?.includes('top') ? { top: '8px' } : {}),
                                ...(watermark?.position?.includes('bottom') ? { bottom: '8px' } : {}),
                                ...(watermark?.position?.includes('left') ? { left: '8px' } : {}),
                                ...(watermark?.position?.includes('right') ? { right: '8px' } : {}),
                                ...(watermark?.position?.includes('center') && !watermark?.position?.includes('left') && !watermark?.position?.includes('right') ? { left: '50%', transform: 'translateX(-50%)' } : {}),
                                ...(watermark?.position === 'center' ? { top: '50%', transform: 'translate(-50%, -50%)' } : {}),
                            }}
                        >
                            {watermark.text}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
