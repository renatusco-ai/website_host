import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ASSETS =
  'C:/Users/Shaun/.cursor/projects/c-Users-Shaun-cursor-Renatus-website-website-host/assets';
const OUT = path.join(ROOT, 'public/portfolio');

const SOURCES = {
  'exercise-programming-engine.png':
    'c__Users_Shaun_AppData_Roaming_Cursor_User_workspaceStorage_54055e5e122473de06180323d681ac2f_images_Screenshot__1999_-8243a7b3-51ca-4782-96a3-98f423f50237.png',
  'exercise-programming-engine-weekly.png':
    'c__Users_Shaun_AppData_Roaming_Cursor_User_workspaceStorage_54055e5e122473de06180323d681ac2f_images_Screenshot__2000_-985e697f-0d16-454a-b661-fa58ce1bf587.png',
  'client-workbook.png':
    'c__Users_Shaun_AppData_Roaming_Cursor_User_workspaceStorage_54055e5e122473de06180323d681ac2f_images_Screenshot__2001_-6e89a0f8-e7c6-4a99-af42-8d9bedcf6391.png',
  'client-workbook-nutrition.png':
    'c__Users_Shaun_AppData_Roaming_Cursor_User_workspaceStorage_54055e5e122473de06180323d681ac2f_images_Screenshot__2002_-1d0df55c-e211-4bb9-bbfd-1cf8fbd087bb.png',
  'member-health-dashboard.png':
    'c__Users_Shaun_AppData_Roaming_Cursor_User_workspaceStorage_54055e5e122473de06180323d681ac2f_images_Screenshot__1996_-3aec0546-a5ed-4185-85f1-89d4b28c3c15.png',
  'referral-tracking-crm.png':
    'c__Users_Shaun_AppData_Roaming_Cursor_User_workspaceStorage_54055e5e122473de06180323d681ac2f_images_Screenshot__1997_-35c7e3a2-c425-4323-a2f9-4faeba88ec5f.png',
  'renewal-automation.png':
    'c__Users_Shaun_AppData_Roaming_Cursor_User_workspaceStorage_54055e5e122473de06180323d681ac2f_images_Screenshot__1998_-ccac4b41-5662-491b-b1b2-b350cf9c59be.png',
};

/** Normalised blur regions: x, y, w, h as fractions of image size */
const BLUR_REGIONS = {
  'exercise-programming-engine.png': [
    { x: 0, y: 0.06, w: 0.24, h: 0.94 }, // member sidebar
    { x: 0.23, y: 0, w: 0.28, h: 0.14 }, // client header name
  ],
  'client-workbook.png': [
    { x: 0.02, y: 0.08, w: 0.5, h: 0.14 }, // coach subtitle
    { x: 0, y: 0.26, w: 0.17, h: 0.74 }, // name column
    { x: 0.41, y: 0.26, w: 0.22, h: 0.74 }, // personal notes
    { x: 0.63, y: 0.26, w: 0.22, h: 0.74 }, // team notes
  ],
  'client-workbook-nutrition.png': [
    { x: 0, y: 0.035, w: 0.7, h: 0.06 }, // modal header name
    { x: 0.03, y: 0.155, w: 0.44, h: 0.09 }, // current target footer + set-by
    { x: 0.5, y: 0.12, w: 0.48, h: 0.38 }, // future targets list (names in set-by)
  ],
  'member-health-dashboard.png': [
    { x: 0.02, y: 0.4, w: 0.38, h: 0.1 }, // stakeholder manager name
    { x: 0.3, y: 0.7, w: 0.24, h: 0.3 }, // member column
    { x: 0.76, y: 0.7, w: 0.18, h: 0.3 }, // coach column
  ],
  'referral-tracking-crm.png': [
    { x: 0, y: 0.36, w: 1, h: 0.1 }, // chart legend names
    { x: 0, y: 0.5, w: 0.17, h: 0.5 }, // member column
    { x: 0.19, y: 0.5, w: 0.11, h: 0.5 }, // referral owner
    { x: 0.82, y: 0.5, w: 0.18, h: 0.5 }, // activity log
  ],
  'renewal-automation.png': [
    { x: 0, y: 0, w: 0.62, h: 0.14 }, // churn list row names
    { x: 0.52, y: 0, w: 0.48, h: 0.14 }, // summary text with client name
    { x: 0.02, y: 0.14, w: 0.48, h: 0.24 }, // AI explanation text
    { x: 0.5, y: 0.66, w: 0.5, h: 0.3 }, // membership notes card
    { x: 0, y: 0.82, w: 0.75, h: 0.18 }, // second list row
  ],
};

/** Optional crop before blur — pixel values */
const CROPS = {
  'renewal-automation.png': { left: 0, top: 100, width: 1024, height: 420 },
};

const OUTPUT_WIDTH = 1600;
const BLUR_SIGMA = 14;

async function applyBlurs(inputBuffer, regions) {
  const meta = await sharp(inputBuffer).metadata();
  const composites = [];

  for (const r of regions) {
    const left = Math.max(0, Math.round(r.x * meta.width));
    const top = Math.max(0, Math.round(r.y * meta.height));
    const width = Math.min(meta.width - left, Math.round(r.w * meta.width));
    const height = Math.min(meta.height - top, Math.round(r.h * meta.height));

    if (width < 2 || height < 2) continue;

    const blurred = await sharp(inputBuffer)
      .extract({ left, top, width, height })
      .blur(BLUR_SIGMA)
      .toBuffer();

    composites.push({ input: blurred, left, top });
  }

  if (composites.length === 0) return inputBuffer;
  return sharp(inputBuffer).composite(composites).png().toBuffer();
}

async function processImage(filename) {
  const srcPath = path.join(ASSETS, SOURCES[filename]);
  const outPath = path.join(OUT, filename);

  let pipeline = sharp(srcPath);
  const crop = CROPS[filename];

  if (crop) {
    pipeline = sharp(await pipeline.extract(crop).png().toBuffer());
  }

  let buffer = await pipeline.png().toBuffer();
  const regions = BLUR_REGIONS[filename];

  if (regions?.length) {
    buffer = await applyBlurs(buffer, regions);
  }

  const meta = await sharp(buffer).metadata();
  const scale = OUTPUT_WIDTH / meta.width;

  await sharp(buffer)
    .resize(OUTPUT_WIDTH, Math.round(meta.height * scale), {
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: meta.width < 900 ? 0.8 : 0.4 })
    .png({ compressionLevel: 8 })
    .toFile(outPath);

  const outMeta = await sharp(outPath).metadata();
  console.log(`✓ ${filename} → ${outMeta.width}x${outMeta.height}`);
}

await Promise.all(Object.keys(SOURCES).map(processImage));
console.log('Done.');
