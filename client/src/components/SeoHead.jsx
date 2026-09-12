import { useEffect } from 'react';

const SITE_NAME = 'YouTube Clipper';
const SITE_URL = 'https://clipper.dockhosting.dev';

/**
 * Dynamically sets <title>, meta description, canonical, OG, and Twitter cards.
 * Call <SeoHead ... /> at the top of any page component.
 */
export default function SeoHead({
  title,
  description,
  canonicalPath = '/',
  ogImage = `${SITE_URL}/og-image.png`,
  ogType = 'website',
  keywords = '',
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Free Online Video Clipper & Shorts Maker`;
  const fullUrl = `${SITE_URL}${canonicalPath}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    if (keywords) setMeta('name', 'keywords', keywords);
    if (noindex) {
      setMeta('name', 'robots', 'noindex, nofollow');
    } else {
      setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Open Graph
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:url', fullUrl);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:locale', 'en_US');

    // Twitter
    setMeta('property', 'twitter:card', 'summary_large_image');
    setMeta('property', 'twitter:url', fullUrl);
    setMeta('property', 'twitter:title', fullTitle);
    setMeta('property', 'twitter:description', description);
    setMeta('property', 'twitter:image', ogImage);
  }, [fullTitle, description, fullUrl, ogImage, ogType, keywords, noindex]);

  return null;
}

export { SITE_NAME, SITE_URL };
