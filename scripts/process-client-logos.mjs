/**
 * Normalises client logos into a single ink monochrome on transparency.
 *
 * Source logos arrive with hard-coded backgrounds (black, navy, white) and mixed
 * brand colours, which cannot sit together on the cream page. Each source gets an
 * alpha mask derived from its own background type, then every surviving pixel is
 * flattened to one ink tone so the wall reads as a set rather than a pile.
 *
 * Usage: npm run process-logos
 */
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = path.resolve('assets/logos-src');
const OUT_DIR = path.resolve('public/clients');

/** Ink tone baked into every output pixel. Matches --color-ink. */
const INK = { r: 0x1e, g: 0x25, b: 0x21 };

/** Longest edge of the emitted PNG, at 2x for retina. */
const MAX_EDGE = 640;

/**
 * mask modes:
 *  brightOnDark  - logo is lighter than its background; alpha from max(r,g,b)
 *  darkOnLight   - logo is darker than its background; alpha from 255-min(r,g,b)
 *  whiteOnly     - logo is white over a busy/photographic background; alpha from
 *                  min(r,g,b) with a high floor so only near-white survives
 */
const LOGOS = [
  { id: 'lockeroom', file: 'lockeroom.png', mode: 'brightOnDark', floor: 24, gain: 1.4 },
  { id: 'aspire', file: 'aspire.png', mode: 'brightOnDark', floor: 10, gain: 3.6 },
  { id: 'ajw', file: 'ajw.png', mode: 'brightOnDark', floor: 18, gain: 1.5 },
  { id: 'mobility-collective', file: 'mobility-collective.png', mode: 'brightOnDark', floor: 78, gain: 2.6 },
  { id: 'white-key', file: 'white-key.png', mode: 'darkOnLight', floor: 18, gain: 1.4 },
  {
    id: 'jd-financial',
    file: 'jd-financial-raw.png',
    mode: 'darkOnLight',
    floor: 20,
    gain: 1.5,
    // Screenshot carries a page-border hairline along the top edge.
    crop: { left: 24, top: 26, width: 596, height: 156 },
  },
  {
    id: 'ipa',
    file: 'ipa-raw.png',
    mode: 'whiteOnly',
    floor: 168,
    gain: 5,
    crop: { left: 118, top: 165, width: 510, height: 278 },
    // The hero's white panel divider is a 2px column behind the A. It is hidden by the
    // A's stroke through the middle and only needs clearing above and below it.
    knockouts: [
      { left: 408, top: 0, width: 3, height: 55 },
      { left: 408, top: 252, width: 3, height: 26 },
    ],
  },
];

const clamp = (n) => (n < 0 ? 0 : n > 255 ? 255 : Math.round(n));

function alphaFor(mode, r, g, b) {
  switch (mode) {
    case 'brightOnDark':
      return Math.max(r, g, b);
    case 'darkOnLight':
      return 255 - Math.min(r, g, b);
    case 'whiteOnly':
      return Math.min(r, g, b);
    default:
      throw new Error(`Unhandled mask mode: ${mode}`);
  }
}

async function processLogo(logo) {
  const buffer = await readFile(path.join(SRC_DIR, logo.file));

  let pipeline = sharp(buffer);
  if (logo.crop) pipeline = pipeline.extract(logo.crop);

  const { data, info } = await pipeline
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);
  const knockouts = logo.knockouts ?? [];

  const isKnockedOut = (x, y) =>
    knockouts.some(
      (k) => x >= k.left && x < k.left + k.width && y >= k.top && y < k.top + k.height,
    );

  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    const pixel = o / 4;
    const srcAlpha = channels === 4 ? data[i + 3] : 255;
    const raw = alphaFor(logo.mode, data[i], data[i + 1], data[i + 2]);
    const alpha = clamp((raw - logo.floor) * logo.gain) * (srcAlpha / 255);

    out[o] = INK.r;
    out[o + 1] = INK.g;
    out[o + 2] = INK.b;
    out[o + 3] = isKnockedOut(pixel % width, Math.floor(pixel / width)) ? 0 : clamp(alpha);
  }

  const outPath = path.join(OUT_DIR, `${logo.id}.png`);
  const result = await sharp(out, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 2 })
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(
    `${logo.id.padEnd(20)} ${String(result.width).padStart(4)}x${String(result.height).padEnd(4)} -> public/clients/${logo.id}.png`,
  );
}

await mkdir(OUT_DIR, { recursive: true });
for (const logo of LOGOS) {
  await processLogo(logo);
}
