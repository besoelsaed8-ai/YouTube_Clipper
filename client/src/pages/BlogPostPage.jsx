import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Clock, ArrowRight, Tag } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import blogPosts from '../data/blogPosts';

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <>
        <SeoHead title="Post Not Found" noindex />
        <div className="min-h-screen bg-[#06080f] flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-100 mb-4">Post Not Found</h1>
            <p className="text-slate-400 mb-8">The blog post you are looking for does not exist.</p>
            <Link to="/blog" className="text-indigo-400 hover:text-indigo-300 underline">Back to Blog</Link>
          </div>
        </div>
      </>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'YouTube Clipper',
      url: 'https://clipper.dockhosting.dev',
    },
    mainEntityOfPage: `https://clipper.dockhosting.dev${post.canonicalPath}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://clipper.dockhosting.dev' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://clipper.dockhosting.dev/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://clipper.dockhosting.dev${post.canonicalPath}` },
    ],
  };

  const faqSchema = post.content.faq && post.content.faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.content.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }
    : null;

  return (
    <>
      <SeoHead
        title={post.title}
        description={post.description}
        canonicalPath={post.canonicalPath}
        keywords={post.keywords}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <div className="min-h-screen bg-[#06080f] text-slate-200">
        {/* Breadcrumbs */}
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
            <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link to="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-slate-300 truncate max-w-[200px]">{post.title}</li>
          </ol>
        </nav>

        <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
              <span>{post.date}</span>
              <span>By {post.author}</span>
            </div>
          </header>

          {/* Introduction */}
          <div className="prose prose-invert max-w-none mb-10">
            <p className="text-slate-400 text-lg leading-relaxed">{post.content.intro}</p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {post.content.sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold text-slate-100 mb-3">{section.heading}</h2>
                <p className="text-slate-400 leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>

          {/* Tool CTA */}
          <div className="mt-12 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl text-center">
            <p className="text-slate-300 mb-4">{post.content.toolCTA}</p>
            <Link
              to={post.content.toolLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-95 text-sm"
            >
              <span>Try It Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* FAQ */}
          {post.content.faq && post.content.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-slate-100 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {post.content.faq.map((item, i) => (
                  <div key={i} className="p-5 bg-slate-900/30 border border-slate-800/40 rounded-2xl">
                    <h3 className="text-sm font-semibold text-slate-200 mb-2">{item.q}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          <div className="mt-10 flex flex-wrap gap-2">
            {post.keywords.split(',').slice(0, 5).map((kw, i) => (
              <span key={i} className="flex items-center gap-1 px-3 py-1 bg-slate-900/40 border border-slate-800/40 rounded-full text-xs text-slate-500">
                <Tag className="w-3 h-3" />
                {kw.trim()}
              </span>
            ))}
          </div>
        </article>

        {/* More posts */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl border-t border-slate-800/50">
          <h2 className="text-xl font-bold text-slate-100 mb-6">More Guides</h2>
          <div className="space-y-4">
            {blogPosts
              .filter((p) => p.slug !== slug)
              .slice(0, 3)
              .map((p) => (
                <Link
                  key={p.slug}
                  to={p.canonicalPath}
                  className="block p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl hover:border-indigo-500/30 transition-all group"
                >
                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{p.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.description}</p>
                </Link>
              ))}
          </div>
        </section>

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
