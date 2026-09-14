import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Mail, MessageSquare, Send, CheckCircle, Bug, Lightbulb, HelpCircle } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const SUBJECTS = [
    { id: 'bug', label: 'إبلاغ عن خطأ', icon: Bug, color: 'text-red-400' },
    { id: 'feature', label: 'اقتراح ميزة جديدة', icon: Lightbulb, color: 'text-yellow-400' },
    { id: 'support', label: 'دعم فني', icon: HelpCircle, color: 'text-blue-400' },
    { id: 'other', label: 'أخرى', icon: MessageSquare, color: 'text-purple-400' },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: 'support', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        // Simulate sending (in production, connect to a backend)
        await new Promise(r => setTimeout(r, 1500));

        setSending(false);
        setSubmitted(true);
    };

    return (
        <>
            <SeoHead
                title="Contact Us — YouTube Clipper"
                description="Get in touch with the YouTube Clipper team. Report bugs, suggest features, or get technical support."
                canonicalPath="/contact"
            />

            <div className="min-h-screen bg-[#06080f] text-slate-200">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-2 text-sm text-slate-500">
                        <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
                        <li><ChevronRight className="w-3 h-3" /></li>
                        <li className="text-slate-300">Contact Us</li>
                    </ol>
                </nav>

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-2xl">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <Mail className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                                اتصل بنا
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm">
                            عندك سؤال أو اقتراح أو مشكلة؟ كلمنا وهرد عليك في أقرب وقت
                        </p>
                    </div>

                    {submitted ? (
                        <div className="card text-center py-12 animate-slide-up">
                            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100 mb-2">تم الإرسال! ✅</h2>
                            <p className="text-slate-400 text-sm mb-6">شكراً ليك — هنرد عليك في أقرب وقت</p>
                            <button
                                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: 'support', message: '' }); }}
                                className="btn-primary px-6 py-2.5 rounded-xl text-sm"
                            >
                                إرسال رسالة جديدة
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="card space-y-6 animate-slide-up">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">الاسم</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="اسمك"
                                    className="input-field w-full rounded-xl"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="input-field w-full rounded-xl"
                                    dir="ltr"
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-3">نوع الرسالة</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SUBJECTS.map((sub) => {
                                        const Icon = sub.icon;
                                        return (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                onClick={() => setForm({ ...form, subject: sub.id })}
                                                className={`p-3 rounded-xl border text-right transition-all ${
                                                    form.subject === sub.id
                                                        ? 'border-indigo-500/40 bg-indigo-500/10'
                                                        : 'border-slate-700/30 bg-slate-800/30 hover:bg-slate-800/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`w-4 h-4 ${sub.color}`} />
                                                    <span className="text-xs font-medium text-slate-300">{sub.label}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">الرسالة</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    placeholder="اكتب رسالتك هنا..."
                                    className="input-field w-full rounded-xl resize-none"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl"
                            >
                                {sending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        إرسال الرسالة
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Alternative contact */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-xs">
                            أو تقدر تفتح issue على{' '}
                            <a href="https://github.com/besoelsaed8-ai/YouTube_Clipper/issues" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                                GitHub
                            </a>
                        </p>
                    </div>
                </main>

                <footer className="border-t border-slate-800/50 py-8 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 mb-4">
                        <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
                        <Link to="/about" className="hover:text-indigo-400 transition-colors">About</Link>
                        <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
                        <Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms</Link>
                    </div>
                    <p className="text-slate-600 text-xs">Free &amp; open source · Powered by FFmpeg WASM</p>
                </footer>
            </div>
        </>
    );
}
