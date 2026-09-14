import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import SeoHead from '../components/SeoHead';

const FAQ_DATA = [
    {
        category: 'الاستخدام',
        questions: [
            {
                q: 'إزاي أستخدم الموقع؟',
                a: 'ببساطة: انسخ رابط فيديو YouTube والصقه في خانة الرابط، اختار الإعدادات اللي عايزها (مدة المقطع، تحويل 9:16، ترجمة، إلخ)، واضغط "Start Processing". الفيديو هينزّل ويعمله قص تلقائي.',
            },
            {
                q: 'هل الموقع مجاني؟',
                a: 'أيوه، الموقع مجاني بالكامل. مفيش باقات مدفوعة ولا إعلانات مزعجة. كل الميزات متاحة لكل المستخدمين.',
            },
            {
                q: 'هل محتاج أسجل حساب؟',
                a: 'لا،الموقع بيشتغل بدون تسجيل. افتح الموقع واستخدمه مباشرة.',
            },
            {
                q: 'هل بيشتغل على الموبايل؟',
                a: 'أيوه، الموقع متوافق مع الموبايل. بس المعالجة أسرع على الكمبيوتر.',
            },
        ],
    },
    {
        category: 'الفني',
        questions: [
            {
                q: 'إيه الفيديوهات اللي بتشتغل معاه؟',
                a: 'بيشتغل مع أي فيديو YouTube. كمان تقدر ترفع فيديو من جهازك بصيغ MP4, MOV, AVI, MKV.',
            },
            {
                q: 'حد أقصى لحجم الفيديو؟',
                a: 'الحد الأقصى 400MB للمعالجة في المتصفح. لو الفيديو أكبر، ممكن تنزّله وتقسّمه يدويًا.',
            },
            {
                q: 'الترجمة بتشتغل بإيه؟',
                a: 'بنستخدم Whisper AI على السيرفر — بيسمع الصوت وبيكتبه بأي لغة. بيشتغل على كل المتصفحات.',
            },
            {
                q: 'ليه الترجمة بتاخد وقت؟',
                a: 'لأن السيرفر بيسمع الفيديو كله ويحلل الصوت. الفيديو الأطول = وقت أطول. عادة 1-3 دقائق.',
            },
            {
                q: 'الجودة بتتحسن إزاي؟',
                a: 'تقدر تختار الجودة من الإعدادات: Best, 4K, 1080p, 720p, 480p. الأعلى جودة = ملف أكبر.',
            },
        ],
    },
    {
        category: 'الميزات',
        questions: [
            {
                q: 'إزاي أعمل شورت من فيديو طويل؟',
                a: 'فعّل "Shorts Mode" في الإعدادات — هيحوّل الفيديو لـ 9:16 تلقائيًا. كمان تقدر تختار مدة المقطع (15s, 30s, 45s, 60s).',
            },
            {
                q: 'إزاي أضيف ترجمة؟',
                a: 'فعّل "Auto Subtitles" واختار اللغة. الترجمة هتتكتب تلقائيًا وتندمج في الفيديو.',
            },
            {
                q: 'الـ AI Smart Highlights بيعمل إيه؟',
                a: 'بيحلل الفيديو ويختار أفضل 10 لقطات بناءً على المشاهد والصوت والطاقة. كل مقطع ليه تقييم من 100.',
            },
            {
                q: 'Face Tracking بيشتغل إزاي؟',
                a: 'بيتبع الوجوه في الفيديو وبيحرك القص معاها. يعني لو الشخص بيمشي، القص بيمشي معاه.',
            },
            {
                q: 'إزاي أضيف watermark؟',
                a: 'في الإعدادات، اختار "Text Overlay" واكتب النص اللي عايزه. تقدر تختار الحجم واللون والمكان.',
            },
        ],
    },
    {
        category: 'المشاكل',
        questions: [
            {
                q: 'الفيديو مش بينزّل من YouTube، حل إيه؟',
                a: 'جرب خطوتين: 1) حمّل الفيديو من جهازك وارفعه مباشرة. 2) جرب فيديو تاني — أحيانًا YouTube بيقفل فيديوهات معينة.',
            },
            {
                q: 'المعالجة بتكتر أو بتقف عند نسبة معينة؟',
                a: 'ده ممكن يحصل مع الفيديوهات الكبيرة. جرب تستخدم فيديو أقصر أو جودة أقل. كمان تأكد إن المتصفح Chrome أو Edge.',
            },
            {
                q: 'الترجمة مش دقيقة، حل إيه؟',
                a: 'Whisper مش مثالي 100% — أحيانًا بيقفل كلمات. جرب تختار اللغة الصح في الإعدادات. كمان الفيديو الواضح بيطلع أحسن.',
            },
            {
                q: 'الموقع بطيء على الموبايل؟',
                a: 'المعالجة في المتصفح بتاخد موارد. على الموبايل ممكن يكون أبطأ. جرب تستخدم WiFi بدل البيانات.',
            },
        ],
    },
];

export default function FaqPage() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <>
            <SeoHead
                title="FAQ — YouTube Clipper"
                description="Frequently asked questions about YouTube Clipper. Learn how to use the tool, troubleshoot issues, and discover all features."
                canonicalPath="/faq"
            />

            <div className="min-h-screen bg-[#06080f] text-slate-200">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-2 text-sm text-slate-500">
                        <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
                        <li><ChevronRight className="w-3 h-3" /></li>
                        <li className="text-slate-300">FAQ</li>
                    </ol>
                </nav>

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <HelpCircle className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                                الأسئلة الشائعة
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm">
                            إجابات على الأكتر سؤال بيتكرر
                        </p>
                    </div>

                    <div className="space-y-8">
                        {FAQ_DATA.map((category, catIdx) => (
                            <div key={catIdx}>
                                <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                    {category.category}
                                </h2>

                                <div className="space-y-2">
                                    {category.questions.map((item, qIdx) => {
                                        const globalIdx = `${catIdx}-${qIdx}`;
                                        const isOpen = openIndex === globalIdx;

                                        return (
                                            <div
                                                key={qIdx}
                                                className={`border rounded-xl transition-all ${
                                                    isOpen ? 'border-indigo-500/30 bg-slate-900/40' : 'border-slate-800/30 bg-slate-900/20'
                                                }`}
                                            >
                                                <button
                                                    onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                                                    className="w-full flex items-center justify-between p-4 text-right"
                                                >
                                                    <span className="text-sm font-medium text-slate-300">{item.q}</span>
                                                    {isOpen ? (
                                                        <ChevronUp className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                    )}
                                                </button>

                                                {isOpen && (
                                                    <div className="px-4 pb-4 animate-slide-up">
                                                        <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Still have questions */}
                    <div className="mt-12 text-center card py-8">
                        <p className="text-slate-400 text-sm mb-4">لسه عندك سؤال؟</p>
                        <Link
                            to="/contact"
                            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm"
                        >
                            اتصل بنا
                        </Link>
                    </div>
                </main>

                <footer className="border-t border-slate-800/50 py-8 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 mb-4">
                        <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
                        <Link to="/about" className="hover:text-indigo-400 transition-colors">About</Link>
                        <Link to="/faq" className="hover:text-indigo-400 transition-colors">FAQ</Link>
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
