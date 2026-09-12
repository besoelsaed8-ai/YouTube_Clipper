import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield } from 'lucide-react';
import SeoHead from '../components/SeoHead';

export default function PrivacyPage() {
  return (
    <>
      <SeoHead
        title="Privacy Policy"
        description="YouTube Clipper privacy policy. Learn how we handle data, video processing, and user privacy."
        canonicalPath="/privacy"
        noindex
      />

      <div className="min-h-screen bg-[#06080f] text-slate-200">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-slate-300">Privacy Policy</li>
          </ol>
        </nav>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          <p className="text-sm text-slate-500 mb-10">Last updated: September 8, 2026</p>

          <div className="space-y-8 text-slate-400 leading-relaxed text-sm">
            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                Overview
              </h2>
              <p>
                YouTube Clipper is designed with privacy as a core principle. We do not collect, store, or share
                your personal data. All video processing happens directly in your web browser — your videos
                never leave your device.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">Video Processing</h2>
              <p>
                When you use the client-side processing feature (the default), your video is processed entirely
                within your browser using FFmpeg WebAssembly. No video data is transmitted to any server.
                The video stays on your device from start to finish.
              </p>
              <p className="mt-2">
                When you use the YouTube URL feature, the tool attempts to download the video through third-party
                APIs. During this process, the video URL is transmitted to these services for downloading.
                The downloaded video is processed in your browser and is not stored on any server.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">Data We Do Not Collect</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Personal information (name, email, address)</li>
                <li>Video files or content you process</li>
                <li>Usage analytics or tracking data</li>
                <li>Cookies for tracking purposes</li>
                <li>IP addresses for identification</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">Third-Party Services</h2>
              <p>
                Our tool may use third-party APIs for downloading YouTube videos. These services operate
                under their own privacy policies. We do not share any user data with these services
                beyond the video URL required for downloading.
              </p>
              <p className="mt-2">
                If the site displays advertisements, those are served by third-party ad networks which
                may use cookies and tracking technologies. Refer to the respective ad network's privacy
                policy for details.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">Open Source</h2>
              <p>
                YouTube Clipper is open source. You can audit the entire codebase to verify our privacy
                claims. We have nothing to hide.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. Changes will be reflected on this page
                with an updated date. Continued use of the tool after changes constitutes acceptance of
                the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-100 mb-3">Contact</h2>
              <p>
                If you have questions about this privacy policy, please open an issue on the project's
                GitHub repository.
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
