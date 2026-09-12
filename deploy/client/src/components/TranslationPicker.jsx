import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LANGUAGES } from '../api/subtitleService';

/**
 * TranslationPicker — dropdown to select subtitle language
 */
export default function TranslationPicker({ value, onChange, disabled = false }) {
    const [open, setOpen] = useState(false);
    const selected = LANGUAGES.find(l => l.code === value) || LANGUAGES[0];

    return (
        <div className="relative">
            <button
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    disabled
                        ? 'opacity-50 cursor-not-allowed bg-slate-800/30 text-slate-600'
                        : 'bg-slate-800/50 hover:bg-slate-800/80 text-slate-300 border border-slate-700/50 hover:border-slate-600'
                }`}
            >
                <Globe className="w-4 h-4 text-slate-400" />
                <span>{selected.flag} {selected.name}</span>
                {!disabled && <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />}
            </button>

            {open && !disabled && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-slide-up">
                        <div className="p-2 border-b border-slate-800/50">
                            <p className="text-xs text-slate-500 px-2 py-1">Select subtitle language</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-1.5">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code + lang.name}
                                    onClick={() => {
                                        onChange(lang.code);
                                        setOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                                        value === lang.code
                                            ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                                    }`}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <div className="text-left flex-1">
                                        <div className="font-medium">{lang.name}</div>
                                        <div className="text-[10px] text-slate-600">{lang.native}</div>
                                    </div>
                                    {value === lang.code && <Check className="w-4 h-4 text-indigo-400" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
