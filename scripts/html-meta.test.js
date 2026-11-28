import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fillRouteHtml, injectRoot } from './html-meta.mjs';

const template = `<!DOCTYPE html>
<html>
  <head>
    <title>Old title</title>
    <meta name="description" content="Old description" />
    <meta property="og:title" content="Old title" />
    <meta property="og:description" content="Old description" />
    <meta property="og:url" content="https://example.com/old" />
    <meta name="twitter:title" content="Old title" />
    <meta name="twitter:description" content="Old description" />
    <link rel="canonical" href="https://example.com/old" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

describe('fillRouteHtml', () => {
  it('keeps $266k intact in the description', () => {
    const description = 'Documented annual saving. $266k documented annual saving. Also $& and $\'.';
    const html = fillRouteHtml(template, {
      title: 'Title $100',
      description,
      url: 'https://www.renatusco.com/',
    });
    assert.ok(html.includes('$266k documented annual saving. Also $&amp; and $\'.'));
    assert.match(html, /<title>Title \$100<\/title>/);
    assert.match(html, /og:url" content="https:\/\/www\.renatusco\.com\/"/);
  });

  it('injects rendered body without interpreting replacement tokens', () => {
    const html = injectRoot(template, '<p>$266k &amp; $&</p>');
    assert.match(html, /<div id="root"><p>\$266k &amp; \$&<\/p><\/div>/);
  });
});
