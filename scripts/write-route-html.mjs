import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PAGES, pageUrl } from '../src/data/seo.js';
import { fillRouteHtml, injectRoot } from './html-meta.mjs';

const dist = join(process.cwd(), 'dist');
const template = readFileSync(join(dist, 'index.html'), 'utf8');

function pageHtml(rendered, page) {
  const filled = fillRouteHtml(template, {
    title: page.title,
    description: page.description,
    url: pageUrl(page.path),
  });
  const html = injectRoot(filled, rendered);
  if (page.path === '/' && !html.includes('$266k')) {
    throw new Error('Homepage meta lost the $266k figure. Check the description replacer.');
  }
  if (!rendered.includes('main-content')) {
    throw new Error(`Prerender of ${page.path} produced no main content`);
  }
  if (!rendered.includes('ABN 66 665 657 349')) {
    throw new Error(`${page.path} prerender is missing the legal line`);
  }
  if (page.path === '/contact' && !rendered.includes('<form')) {
    throw new Error('Contact prerender is missing a form');
  }
  if (page.path === '/about' && !rendered.includes('Shaun Townsend is the Founder and MD of Renatus Pty Ltd')) {
    throw new Error('About prerender is missing the founder bio');
  }
  if (page.path === '/trust' && !rendered.includes('iad1')) {
    throw new Error('Trust prerender is missing the hosting note');
  }
  if (page.path === '/privacy' && !rendered.includes('browser user agent')) {
    throw new Error('Privacy prerender is missing the collection note');
  }
  return html;
}

const serverEntry = pathToFileURL(join(process.cwd(), 'dist-ssr/entry-server.js')).href;
const { render } = await import(serverEntry);

for (const page of PAGES) {
    const rendered = render(page.path);
    const html = pageHtml(rendered, page);
    const file = page.path === '/' ? join(dist, 'index.html') : join(dist, `${page.path.slice(1)}.html`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    console.log(`prerendered ${page.path}`);
  }

  const notFoundRendered = render('/__not-found__');
  let notFound = fillRouteHtml(template, {
    title: 'Page not found | Renatus',
    description: 'That page is not on the Renatus site.',
    url: pageUrl('/'),
  });
  notFound = notFound.replace('content="index, follow"', 'content="noindex"');
  notFound = injectRoot(notFound, notFoundRendered);
  if (!notFoundRendered.includes('That page') || !notFoundRendered.includes('href="/trust"')) {
    throw new Error('404 prerender is missing its links');
  }
writeFileSync(join(dist, '404.html'), notFound);
console.log('prerendered 404.html');
