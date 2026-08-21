// E2E screen verification for apps/learn — part of the standing design
// improvement loop. Uses the system Chrome via Playwright (no browser
// download). Run with the dev server up:  node tools/e2e-verify.mjs
// Env: BASE_URL (default http://localhost:3100), SHOTS_DIR.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3100';
const SHOTS = process.env.SHOTS_DIR ?? '/tmp/opencode/shots';
mkdirSync(SHOTS, { recursive: true });

const results = [];
const consoleErrors = [];
const record = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${page.url()} :: ${m.text()}`); });
  page.on('pageerror', (e) => consoleErrors.push(`${page.url()} :: ${e.message}`));

  // ---- 1. Home EN (light) -------------------------------------------------
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const lightBodyBG = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const h1 = await page.locator('h1').innerText();
  record('home h1 EN', /interactive courses/i.test(h1), h1.slice(0, 60));
  record('home #courses anchor target', (await page.locator('#courses').count()) === 1);
  const coursesHref = await page.locator('nav a', { hasText: 'Courses' }).first().getAttribute('href');
  record('nav Courses → /#courses', coursesHref === '/#courses', String(coursesHref));

  const lessonsCell = page.getByText('Lessons', { exact: true }).first().locator("xpath=ancestor::div[contains(@class,'py-4')]");
  const cellClass = (await lessonsCell.getAttribute('class')) ?? '';
  record('stats: no card boxes on cells', !/bg-card|border-border|rounded/.test(cellClass), cellClass.slice(0, 60));
  const statsContainer = lessonsCell.locator("xpath=ancestor::div[contains(@class,'grid-cols-2')]");
  const desktopCols = await statsContainer.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  record('stats: 4 columns at desktop', desktopCols === 4, `cols=${desktopCols}`);
  await page.screenshot({ path: join(SHOTS, 'home-en.png'), fullPage: true });

  // ---- 2. ES locale -------------------------------------------------------
  await page.locator('header button', { hasText: 'ES' }).first().click();
  await page.waitForTimeout(400);
  const navTexts = (await page.locator('header nav a span').allInnerTexts()).join('|');
  record('ES nav labels', navTexts.includes('Cursos') && navTexts.includes('Práctica') && navTexts.includes('Inicio'), navTexts);
  const esH1 = await page.locator('h1').innerText();
  record('ES headline renders', esH1.length > 5 && !/^Interactive/i.test(esH1), esH1.slice(0, 60));
  await page.screenshot({ path: join(SHOTS, 'home-es.png'), fullPage: true });

  // ---- 3. Dark scheme emulation (informational: dark is class-based) -----
  const darkCtx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1280, height: 900 } });
  const dpage = await darkCtx.newPage();
  await dpage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const darkBodyBG = await dpage.evaluate(() => getComputedStyle(document.body).backgroundColor);
  record('INFO dark-mode behavior on Tailwind surfaces', true,
    darkBodyBG === lightBodyBG ? 'unchanged under prefers-color-scheme (dark is class-based, no toggle yet)' : `changed → ${darkBodyBG}`);
  await darkCtx.close();

  // ---- 4. Practice RN palette unification --------------------------------
  await page.goto(`${BASE}/practice/reactnative`, { waitUntil: 'networkidle' });
  const rnBG = await page.evaluate(() => {
    const el = document.querySelector('.rn-root') ?? document.body;
    return getComputedStyle(el).backgroundColor;
  });
  const m = rnBG.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  const [r, g, b] = m ? [+m[1], +m[2], +m[3]] : [255, 255, 255];
  record('practice .rn-root cool canvas (palette unified)', b >= r - 2, rnBG);
  await page.screenshot({ path: join(SHOTS, 'practice-rn.png'), fullPage: false });

  // ---- 5. Challenges list --------------------------------------------------
  await page.goto(`${BASE}/practice/reactnative/challenges`, { waitUntil: 'networkidle' });
  const challengesVisible = await page.getByRole('heading').first().isVisible();
  record('challenges list renders', challengesVisible);
  await page.screenshot({ path: join(SHOTS, 'challenges.png'), fullPage: false });

  // ---- 6. Course page intact + Geist applied ------------------------------
  await page.goto(`${BASE}/en/learn/ios`, { waitUntil: 'networkidle' });
  const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  record('course pages use Geist (single family)', /geist/i.test(font), font.slice(0, 70));
  await page.screenshot({ path: join(SHOTS, 'course-ios.png'), fullPage: false });

  // ---- 7. Mobile viewport stats -------------------------------------------
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mob.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const mContainer = mob.getByText('Lessons', { exact: true }).first().locator("xpath=ancestor::div[contains(@class,'grid-cols-2')]");
  const mobileCols = await mContainer.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  record('stats: 2 columns on mobile', mobileCols === 2, `cols=${mobileCols}`);
  await mob.screenshot({ path: join(SHOTS, 'home-mobile.png'), fullPage: true });
  await mob.close();

  // ---- Summary -------------------------------------------------------------
  const failed = results.filter((r) => !r.pass);
  console.log('\n==== E2E VERIFY SUMMARY ====');
  console.log(`passed ${results.length - failed.length}/${results.length}`);
  if (consoleErrors.length) {
    console.log(`\nconsole errors (${consoleErrors.length}):`);
    for (const e of consoleErrors.slice(0, 8)) console.log('  •', e);
  } else {
    console.log('console errors: none');
  }
  process.exitCode = failed.length ? 1 : 0;
} finally {
  await browser.close();
}
