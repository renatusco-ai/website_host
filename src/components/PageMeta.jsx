import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGE_BY_PATH, pageUrl } from '../data/seo';

function setMeta(selector, attribute, value) {
  const element = document.head.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export default function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = PAGE_BY_PATH[pathname];
    if (!page) return;

    const url = pageUrl(page.path);
    document.title = page.title;
    setMeta('meta[name="description"]', 'content', page.description);
    setMeta('meta[property="og:title"]', 'content', page.title);
    setMeta('meta[property="og:description"]', 'content', page.description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[name="twitter:title"]', 'content', page.title);
    setMeta('meta[name="twitter:description"]', 'content', page.description);
    setMeta('link[rel="canonical"]', 'href', url);
  }, [pathname]);

  return null;
}
