import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, HelpCircle, Scissors, Zap, Film, ExternalLink, Star, Quote } from 'lucide-react';
import SeoHead from './SeoHead';

function FeatureCard({ title, desc }) {
  return (
    <div className="p-6 bg-slate-900/40 border border-slate-800/40 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 group">
      <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border border-slate-800/40 rounded-2xl overflow-hidden bg-slate-900/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/20 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-200 pr-4">{q}</span>
        <ChevronRight className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/30 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

const TESTIMONIALS = [
  {
    name: 'أحمد محمد',
    role: 'صانع محتوى يوتيوب',
    text: 'أفضل أداة قص شوفتها! بحوّل فيديوهاتي الطويلة لشورت في ثواني. الترجمة التلقائية رائعة.',
    rating: 5,
  },
  {
    name: 'سارة علي',
    role: 'مديرة سوشيال ميديا',
    text: 'بنستخدمها يوميًا للمطاعم اللي بنعملها دعاية. الفيديوهات بتطلع احترافية جدًا من غير أي تعقيد.',
    rating: 5,
  },
  {
    name: 'خالد حسن',
    role: 'بودكاستر',
    text: 'الـ AI Smart Highlights بيوفر عليّ ساعات من الشغل. بيختار أحسن لقطات تلقائيًا!',
    rating: 5,
  },
  {
    name: 'نور إبراهيم',
    role: 'طالبة جامعية',
    name: 'فاطمة أحمد',
    role: 'مدرسة',
    text: 'بنستخدمه في المدرسة عشان نعمل مقاطع تعليمية قصيرة. سهل جدًا على الأولاد يفهموه.',
    rating: 4,
  },
];

/**
 * Reusable SEO landing page component.
 */
export default function LandingPage({ data }) {
  if (!data) return null;

  const { title, description, canonicalPath, keywords, h1, intro, features, howItWorks, useCases, faq, relatedTools } = data;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://clipper.dockhosting.dev' },
      { '@type': 'ListItem', position: 2, name: h1, item: `https://clipper.dockhosting.dev${canonicalPath}` },
    ],
  };

  const faqSchema = faq && faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }
    : null;

  return (
    <>
      <SeoHead
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        keywords={keywords}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="min-h-screen bg-[#06080f] text-slate-200">
        {/* Breadcrumbs */}
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li>
              <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-slate-300">{h1}</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              {h1}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            {intro}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-95 text-base"
          >
            <span>جرّب الآن — مجاني</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </header>

        {/* Features */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 text-center mb-8">
            المميزات
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 text-center mb-8">
            إزاي بيشتغل
          </h2>
          <div className="space-y-6">
            {howItWorks.map((step) => (
              <div key={step.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 text-center mb-8">
            حالات الاستخدام
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {useCases.map((uc, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                <p className="text-sm text-slate-400">{uc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 text-center mb-8">
            المستخدمين بيقولوا إيه
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-6 bg-slate-900/40 border border-slate-800/40 rounded-2xl hover:border-indigo-500/20 transition-all">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        {faq && faq.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 text-center mb-8 flex items-center justify-center gap-3">
              <HelpCircle className="w-7 h-7 text-indigo-400" />
              الأسئلة الشائعة
            </h2>
            <div className="space-y-3">
              {faq.map((item, i) => (
                <FaqItem key={i} {...item} />
              ))}
            </div>
          </section>
        )}

        {/* Related Tools */}
        {relatedTools && relatedTools.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
            <h2 className="text-2xl font-extrabold text-slate-100 text-center mb-8">
              أدوات ذات صلة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedTools.map((tool, i) => (
                <Link
                  key={i}
                  to={tool.path}
                  className="p-5 bg-slate-900/40 border border-slate-800/40 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 group"
                >
                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{tool.desc}</p>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 mt-3 transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium mb-4">
            <Scissors className="w-3.5 h-3.5" />
            مجاني ومفتوح المصدر
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 mb-3">
            جاهز تبدأ؟
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8">
            بدون تسجيل، بدون علامات مائية، بدون حدود. الصق الرابط وابدأ.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            <Zap className="w-5 h-5" />
            <span>افتح YouTube Clipper</span>
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 py-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-indigo-400 transition-colors">About</Link>
            <Link to="/faq" className="hover:text-indigo-400 transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms</Link>
          </div>
          <p className="text-slate-600 text-xs">
            Free &amp; open source · Powered by FFmpeg WASM
          </p>
        </footer>
      </div>
    </>
  );
}
