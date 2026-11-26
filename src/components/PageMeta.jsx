import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGE_BY_PATH, pageUrl } from '../data/seo';

const UNLISTED_META = {
  '/app-store-intake': {
    title: 'iOS App Store Onboarding Intake | Renatus',
    description: 'Share your business details, branding and app idea with Renatus before kickoff.',
  },
};

function setMeta(selector, attribute, value) {
  const element = document.head.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export default function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname.replace(/\/+$/, '') || '/';
    const unlisted = UNLISTED_META[normalizedPath];
    if (unlisted) {
      document.title = unlisted.title;
      setMeta('meta[name="description"]', 'content', unlisted.description);
      setMeta('meta[name="robots"]', 'content', 'noindex, nofollow');
      setMeta('meta[property="og:title"]', 'content', unlisted.title);
      setMeta('meta[property="og:description"]', 'content', unlisted.description);
      setMeta('meta[name="twitter:title"]', 'content', unlisted.title);
      setMeta('meta[name="twitter:description"]', 'content', unlisted.description);
      const canonical = document.head.querySelector('link[rel="canonical"]');
      if (canonical) canonical.remove();
      return;
    }

    const page = PAGE_BY_PATH[normalizedPath];
    if (!page) {
      setMeta('meta[name="robots"]', 'content', 'noindex, nofollow');
      return;
    }

    const url = pageUrl(page.path);
    document.title = page.title;
    setMeta('meta[name="description"]', 'content', page.description);
    setMeta('meta[name="robots"]', 'content', 'index, follow');
    setMeta('meta[property="og:title"]', 'content', page.title);
    setMeta('meta[property="og:description"]', 'content', page.description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[name="twitter:title"]', 'content', page.title);
    setMeta('meta[name="twitter:description"]', 'content', page.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [pathname]);

  return null;
}
