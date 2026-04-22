// Generates the GC monogram app icon (glassy style) and supporting assets
// for the portfolio Expo app. Produces:
//   - assets/app-icon.icon/Assets/icon.png  (iOS 26 Liquid Glass source, full-bleed)
//   - assets/images/icon.png                (legacy iOS / generic, full-bleed)
//   - assets/images/adaptive-icon.png       (Android adaptive, 66% safe area)
//   - assets/images/splash-icon.png         (mark only, transparent, for splash)
//   - assets/images/favicon.png             (32 -> rendered at 256, browser scales)
//
// Run:  node apps/portfolio/scripts/generate-icon.mjs
//
// Design: flat GC monogram in brand paper on a flat brand-red squircle.
// No gradients, no specular, no inner shadow — the v2 "Subtle HUD" aesthetic:
// confident, solid, type-forward. Brand red: #D4412A. Paper: #F6F4ED.

import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(APP_ROOT, 'assets', 'images');
const ICON_DIR = path.join(APP_ROOT, 'assets', 'app-icon.icon');
const ICON_ASSETS_DIR = path.join(ICON_DIR, 'Assets');

// Resolve Plus Jakarta Sans ExtraBold (800) from the installed package so
// resvg can rasterize the monogram with the brand font instead of a system
// fallback. The package ships TTFs per weight/folder.
const requireFromApp = createRequire(path.join(APP_ROOT, 'package.json'));
const JAKARTA_EXTRABOLD = requireFromApp.resolve(
  '@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf',
);

// --- Shared SVG fragments --------------------------------------------------

// Flat palette — no gradients, no filters.
const BRAND_RED = '#D4412A';
const BRAND_PAPER = '#F6F4ED';

// GC monogram in flat paper, Plus Jakarta Sans ExtraBold.
// Tighter tracking (-36) so the pair reads as a single designed mark.
function monogramText(scale = 1, dy = 0) {
  return /* xml */ `
    <g transform="translate(512 ${692 + dy}) scale(${scale}) translate(-512 -692)">
      <text x="512" y="692"
            font-family="Plus Jakarta Sans"
            font-weight="800"
            font-size="460"
            letter-spacing="-36"
            text-anchor="middle"
            fill="${BRAND_PAPER}">GC</text>
    </g>
  `;
}

// Full-bleed red. Fills the entire 1024×1024 canvas with no rounded corners
// or padding — iOS / Android apply their own squircle / circle masks. Padding
// inside the canvas would render as a white halo on the home screen.
const FULL_BLEED_RED = /* xml */ `
  <rect x="0" y="0" width="1024" height="1024" fill="${BRAND_RED}"/>
`;

// --- Composed SVGs ---------------------------------------------------------

// Full-bleed icon: solid red canvas + paper GC monogram. iOS masks its own
// squircle on top, so we don't draw one ourselves (avoids white halo).
function fullIconSvg() {
  return /* xml */ `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    ${FULL_BLEED_RED}
    ${monogramText(1, 0)}
  </svg>`;
}

// Android adaptive icon: just the GC monogram on transparent at its native
// size (~62% canvas width), which sits cleanly inside the ~66% adaptive
// safe area. The red surface comes from android.adaptiveIcon.backgroundColor
// (#D4412A); the system masks both with its launcher shape (circle /
// squircle / rounded square / etc.) so the letters stay readable everywhere.
function adaptiveIconSvg() {
  return /* xml */ `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    ${monogramText(1, 0)}
  </svg>`;
}

// Splash mark: just the GC letters, no tile, transparent background.
// Splash bg is set via app.json (#D4412A), Expo composites this on top.
function splashSvg() {
  return /* xml */ `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <g transform="translate(512 512) scale(0.85) translate(-512 -512)">
      ${monogramText(1, -160)}
    </g>
  </svg>`;
}

// Favicon: glass tile + monogram, rendered small. Keep tile so it reads on
// any browser theme.
function faviconSvg() {
  return fullIconSvg();
}

// --- Render ----------------------------------------------------------------

function render(svg, outPath, size = 1024) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0,0,0,0)',
    font: {
      fontFiles: [JAKARTA_EXTRABOLD],
      loadSystemFonts: false,
      defaultFontFamily: 'Plus Jakarta Sans',
    },
  });
  const pngBuffer = resvg.render().asPng();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`  ✓ ${path.relative(APP_ROOT, outPath)}  (${size}x${size})`);
}

console.log('Generating GC monogram assets...\n');

// iOS 26 .icon source (transparent bg, full-bleed glass + GC)
render(fullIconSvg(), path.join(ICON_ASSETS_DIR, 'icon.png'), 1024);

// Legacy / generic iOS icon (top-level "icon" key in app.json)
render(fullIconSvg(), path.join(IMAGES_DIR, 'icon.png'), 1024);

// Android adaptive (66% safe area, transparent bg)
render(adaptiveIconSvg(), path.join(IMAGES_DIR, 'adaptive-icon.png'), 1024);

// Splash icon (mark only, transparent — bg color set in app.json)
render(splashSvg(), path.join(IMAGES_DIR, 'splash-icon.png'), 1024);

// Favicon (browser will downscale)
render(faviconSvg(), path.join(IMAGES_DIR, 'favicon.png'), 256);

// Write the iOS 26 icon.json descriptor
const iconJson = {
  fill: 'automatic',
  groups: [
    {
      layers: [
        { glass: false, 'image-name': 'icon.png', name: 'icon' },
      ],
      shadow: { kind: 'neutral', opacity: 0.5 },
      translucency: { enabled: true, value: 0.5 },
    },
  ],
  'supported-platforms': {
    circles: ['watchOS'],
    squares: 'shared',
  },
};
fs.writeFileSync(
  path.join(ICON_DIR, 'icon.json'),
  JSON.stringify(iconJson, null, 2) + '\n',
);
console.log(`  ✓ ${path.relative(APP_ROOT, path.join(ICON_DIR, 'icon.json'))}`);

console.log('\nDone. Update app.json to point ios.icon at ./assets/app-icon.icon');
