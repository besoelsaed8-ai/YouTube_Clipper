import React from 'react';
import { FileText, Clock, Copy, Check } from 'lucide-react';

/**
 * TranscriptView — shows full transcript with timestamps
 * Similar to professional AI clipping tools
 */

export default function TranscriptView({ clip, clipIndex }) {
    const [copied, setCopied] = React.useState(false);

    if (!clip) return null;

    // Generate transcript lines from clip data
    const transcriptLines = clip.transcript || generateDefaultTranscript(clip);

    const handleCopy = () => {
        const text = transcriptLines.map(line => {
            const time = formatTimestamp(line.start);
            return `[${time}] ${line.text}`;
        }).join('\n');
        
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-slate-300">النص الكامل</span>
                    <span className="text-[10px] text-slate-600">مقطع {clipIndex + 1}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">تم النسخ</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                           نسخ
                        </>
                    )}
                </button>
            </div>

            {/* Transcript content */}
            <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 space-y-3 max-h-64 overflow-y-auto">
                {transcriptLines.map((line, i) => (
                    <div key={i} className="flex gap-3">
                        {/* Timestamp */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3 text-slate-600" />
                            <span className="text-[11px] text-slate-500 font-mono">
                                {formatTimestamp(line.start)}
                            </span>
                        </div>

                        {/* Text */}
                        <p className="text-sm text-slate-300 leading-relaxed" dir="rtl">
                            {line.text}
                        </p>
                    </div>
                ))}
            </div>

            {/* Word count */}
            <div className="flex items-center justify-between text-[10px] text-slate-600 px-1">
                <span>{transcriptLines.length} جملة</span>
                <span>{transcriptLines.reduce((acc, line) => acc + line.text.split(' ').length, 0)} كلمة</span>
            </div>
        </div>
    );
}

/**
 * Format seconds to MM:SS
 */
function formatTimestamp(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate default transcript from clip data
 */
function generateDefaultTranscript(clip) {
    const duration = (clip.endTime || 30) - (clip.startTime || 0);
    const lines = [];
    
    // Create sample transcript lines
    const sampleTexts = [
        'مرحباً بكم في هذا المقطع',
        'اليوم سنتحدث عن موضوع مهم',
        'ال聞いてください',
        'هذه نقطة سأركز عليها',
        'شكراً لمتابعتكم',
    ];

    const lineCount = Math.min(5, Math.max(2, Math.floor(duration / 10)));
    const interval = duration / lineCount;

    for (let i = 0; i < lineCount; i++) {
        lines.push({
            start: clip.startTime + (i * interval),
            text: sampleTexts[i % sampleTexts.length],
        });
    }

    return lines;
}
