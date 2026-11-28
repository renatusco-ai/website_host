export function escapeAttr(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;');
}

function replaceGroup(html, pattern, value) {
  return html.replace(pattern, (_match, prefix, suffix) => `${prefix}${value}${suffix}`);
}

/**
 * Swap title, description and canonical tags.
 * Values are inserted with a function replacer so `$` in copy (for example `$266k`)
 * is not treated as a String.replace token.
 */
export function fillRouteHtml(html, page) {
  const title = escapeAttr(page.title);
  const description = escapeAttr(page.description);
  const url = escapeAttr(page.url);

  return replaceGroup(
    replaceGroup(
      replaceGroup(
        replaceGroup(
          replaceGroup(
            replaceGroup(
              replaceGroup(
                html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${title}</title>`),
                /(<meta name="description" content=")[^"]*(")/,
                description,
              ),
              /(<meta property="og:title" content=")[^"]*(")/,
              title,
            ),
            /(<meta property="og:description" content=")[^"]*(")/,
            description,
          ),
          /(<meta property="og:url" content=")[^"]*(")/,
          url,
        ),
        /(<meta name="twitter:title" content=")[^"]*(")/,
        title,
      ),
      /(<meta name="twitter:description" content=")[^"]*(")/,
      description,
    ),
    /(<link rel="canonical" href=")[^"]*(")/,
    url,
  );
}

export function injectRoot(html, body) {
  const marker = '<div id="root"></div>';
  if (!html.includes(marker)) {
    throw new Error('dist/index.html is missing <div id="root"></div>');
  }
  return html.replace(marker, () => `<div id="root">${body}</div>`);
}
