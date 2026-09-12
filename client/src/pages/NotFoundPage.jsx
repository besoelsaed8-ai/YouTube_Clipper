import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scissors } from 'lucide-react';
import SeoHead from '../components/SeoHead';

export default function NotFoundPage() {
  return (
    <>
      <SeoHead title="Page Not Found" description="The page you are looking for does not exist." noindex />

      <div className="min-h-screen bg-[#06080f] flex items-center justify-center text-center px-4">
        <div className="max-w-md">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-6">
            <Scissors className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-6xl font-extrabold text-slate-100 mb-4">404</h1>
          <h2 className="text-xl font-bold text-slate-200 mb-3">Page Not Found</h2>
          <p className="text-slate-400 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              <span>Go to YouTube Clipper</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold transition-all duration-300 border border-slate-700/50 hover:border-slate-600"
            >
              <span>Read Our Guides</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
