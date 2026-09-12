import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Scissors, Code, Users, Heart, ExternalLink } from 'lucide-react';
import SeoHead from '../components/SeoHead';

export default function AboutPage() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'YouTube Clipper',
    url: 'https://clipper.dockhosting.dev',
    description: 'Free, open-source YouTube video clipping and Shorts creation tool.',
    sameAs: [],
  };

  return (
    <>
      <SeoHead
        title="About YouTube Clipper"
        description="Learn about YouTube Clipper — a free, open-source tool for downloading, clipping, and converting YouTube videos into Shorts, TikToks, and Reels."
        canonicalPath="/about"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      <div className="min-h-screen bg-[#06080f] text-slate-200">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-slate-300">About</li>
          </ol>
        </nav>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              About YouTube Clipper
            </span>
          </h1>

          <div className="space-y-8 text-slate-400 leading-relaxed">
            <p className="text-lg">
              YouTube Clipper is a free, open-source tool designed to make video clipping accessible to everyone.
              We believe that creating short-form content should not require expensive software, technical expertise,
              or a paid subscription.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-3">
                <Scissors className="w-6 h-6 text-indigo-400" />
                What We Do
              </h2>
              <p>
                YouTube Clipper lets you paste any YouTube video link and automatically split it into short clips
                optimized for YouTube Shorts, TikTok, and Instagram Reels. The tool handles downloading, cropping
                to vertical 9:16 format, and splitting into 30, 45, or 60-second segments — all in your browser.
              </p>
              <p className="mt-3">
                You can also upload video files directly for processing. The tool uses FFmpeg WASM for
                browser-based processing, meaning your videos never leave your device.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-3">
                <Code className="w-6 h-6 text-indigo-400" />
                Open Source
              </h2>
              <p>
                YouTube Clipper is completely open source. The entire codebase is publicly available,
                and we welcome contributions from the community. You can audit the code, report issues,
                submit pull requests, or deploy your own instance using Docker.
              </p>
              <p className="mt-3">
                Being open source means there is no hidden tracking, no data collection, and no vendor lock-in.
                What you see is what you get.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-400" />
                Who It Is For
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {[
                  'Content creators repurposing videos',
                  'Social media managers',
                  'Podcasters creating highlight clips',
                  'YouTubers making Shorts',
                  'Small businesses on a budget',
                  'Students and educators',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-3">
                <Heart className="w-6 h-6 text-indigo-400" />
                Our Values
              </h2>
              <div className="space-y-3">
                {[
                  { title: 'Free Forever', desc: 'No premium plans, no paywalls, no hidden fees. Every feature is available to every user.' },
                  { title: 'Privacy First', desc: 'Browser-based processing means your videos stay on your device. We do not store or view your content.' },
                  { title: 'No Watermarks', desc: 'Your clips are clean. No logos, no branding, no overlays — just your content.' },
                  { title: 'Community Driven', desc: 'Built by creators, for creators. We welcome feedback and contributions from the community.' },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl">
                    <h3 className="text-sm font-bold text-slate-200 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        <footer className="border-t border-slate-800/50 py-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-indigo-400 transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms</Link>
          </div>
          <p className="text-slate-600 text-xs">Free &amp; open source · Powered by FFmpeg WASM</p>
        </footer>
      </div>
    </>
  );
}
