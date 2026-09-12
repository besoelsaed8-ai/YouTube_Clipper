import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, ArrowRight, BookOpen } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import blogPosts from '../data/blogPosts';

export default function BlogPage() {
  return (
    <>
      <SeoHead
        title="Blog — YouTube Clipper Guides & Tutorials"
        description="Guides and tutorials for creating YouTube Shorts, clipping videos, and repurposing content for TikTok, Reels, and Shorts."
        canonicalPath="/blog"
        keywords="youtube shorts guide, video clipping tutorial, content repurposing tips, youtube tips"
      />

      <div className="min-h-screen bg-[#06080f] text-slate-200">
        {/* Breadcrumbs */}
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-slate-300">Blog</li>
          </ol>
        </nav>

        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Guides &amp; Tutorials
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Learn to Create Better Shorts
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Practical guides for clipping YouTube videos, creating Shorts, and repurposing content across platforms.
          </p>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 max-w-4xl">
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                to={post.canonicalPath}
                className="block p-6 bg-slate-900/40 border border-slate-800/40 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-200 group-hover:text-indigo-300 transition-colors mb-2 leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed mb-3 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 mt-2 flex-shrink-0 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-3">Ready to Start Clipping?</h2>
            <p className="text-slate-400 mb-6">Put these guides into practice with our free YouTube Clipper.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              <span>Launch YouTube Clipper</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
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
