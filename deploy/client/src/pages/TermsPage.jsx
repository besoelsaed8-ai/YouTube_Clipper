import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';
import SeoHead from '../components/SeoHead';

export default function TermsPage() {
  return (
    <>
      <SeoHead
        title="Terms of Service"
        description="YouTube Clipper terms of service. Read the guidelines for using our free video clipping tool."
        canonicalPath="/terms"
        noindex
      />

      <div className="min-h-screen bg-[#06080f] text-slate-200">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-slate-300">Terms of Service</li>
          </ol>
        </nav>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
          <p className="text-sm text-slate-500 mb-10">Last updated: September 8, 2026</p>

          <div className="space-y-8 text-slate-400 leading-relaxed text-sm">
            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Acceptance of Terms
              </h2>
              <p>
                By accessing or using YouTube Clipper, you agree to be bound by these Terms of Service.
                If you do not agree with any part of these terms, please do not use the tool.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">Description of Service</h2>
              <p>
                YouTube Clipper is a free, open-source web tool that allows users to download YouTube videos
                and split them into short clips. The tool processes videos in the user's browser and does not
                store any content on servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">User Responsibilities</h2>
              <p>You agree to:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Use the tool only for lawful purposes</li>
                <li>Respect copyright and intellectual property rights</li>
                <li>Not use the tool to distribute harmful, illegal, or infringing content</li>
                <li>Not attempt to disrupt or overload the service</li>
                <li>Not use automated scripts to access the tool</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">Intellectual Property</h2>
              <p>
                YouTube Clipper is open-source software released under its respective license. Users are
                responsible for ensuring they have the right to download and clip any video they process
                through the tool. The tool developers are not responsible for copyright infringement by users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">Disclaimer</h2>
              <p>
                YouTube Clipper is provided "as is" without warranty of any kind. We make no guarantees
                about the tool's availability, reliability, or fitness for any particular purpose.
                Use at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">Limitation of Liability</h2>
              <p>
                In no event shall the developers of YouTube Clipper be liable for any indirect, incidental,
                special, consequential, or punitive damages arising from the use of the tool.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be reflected on this
                page. Continued use of the tool after changes constitutes acceptance of the updated terms.
              </p>
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
