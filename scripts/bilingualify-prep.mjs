#!/usr/bin/env node

/**
 * bilingualify-prep.mjs
 *
 * Converts a prep study app to bilingual (en/es) with `[locale]` routing.
 *
 * Usage:
 *   node scripts/bilingualify-prep.mjs apps/nextjs-prep
 *
 * What it does:
 *   1. Restructures src/app/ → pages move under [locale]/
 *   2. Root layout sheds PrepProvider/header/footer (locale picker doesn't need them)
 *   3. Root page becomes a locale picker
 *   4. [locale]/layout.tsx has I18nProvider + PrepProvider + header/footer
 *   5. Each page.tsx receives `locale` from params
 *   6. Creates Spanish content stubs in src/data/*.es.ts
 *
 * Run from the repo root. Only run once per app.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP = process.argv[2];
if (!APP) {
  console.error("Usage: node scripts/bilingualify-prep.mjs <app-dir>");
  console.error('  e.g. node scripts/bilingualify-prep.mjs apps/nextjs-prep');
  process.exit(1);
}

const APP_DIR = path.resolve(ROOT, APP);
const SRC_APP = path.join(APP_DIR, "src/app");
const LOCALE_DIR = path.join(SRC_APP, "[locale]");

if (!fs.existsSync(SRC_APP)) {
  console.error(`❌ ${APP}/src/app/ not found`);
  process.exit(1);
}
if (fs.existsSync(LOCALE_DIR)) {
  console.error(`⚠️  [locale]/ already exists in ${APP} — skipping`);
  process.exit(0);
}

// ── 1. Read the existing root layout ────────────────────────────────
const rootLayoutPath = path.join(SRC_APP, "layout.tsx");
const origLayout = fs.readFileSync(rootLayoutPath, "utf-8");
const APP_NAME = APP.split("/").pop() || APP;

// ── 2. Create [locale]/ directory ─────────────────────────────────
fs.mkdirSync(LOCALE_DIR, { recursive: true });
console.log(`✓ Created [locale]/`);

// ── 3. Move page files into [locale]/ ─────────────────────────────
const ROUTES = [
  "page.tsx",
  "layout.tsx",
  "architecture/page.tsx",
  "flashcards/page.tsx",
  "pitches/page.tsx",
  "practice/page.tsx",
  "progress/page.tsx",
  "quiz/page.tsx",
  "roadmap/page.tsx",
  "search/page.tsx",
  "study/page.tsx",
  "today/page.tsx",
];

for (const route of ROUTES) {
  const src = path.join(SRC_APP, route);
  if (!fs.existsSync(src)) {
    console.log(`  ⤷ skipping ${route}`);
    continue;
  }
  const dest = path.join(LOCALE_DIR, route);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
}

console.log(`  moved ${ROUTES.length} files into [locale]/`);

// ── 4. Create root layout (locale picker) ─────────────────────────
// Strip PrepProvider/header/footer — locale picker doesn't need them.
// Keep HTML structure, fonts, CSS imports.
const parserPatterns = [
  [/import.*PrepProvider.*from.*/g, '// (provider stripped from root layout)'],
  [/import.*SiteHeader.*from.*/g, '// (header stripped)'],
  [/import.*SiteFooter.*from.*/g, '// (footer stripped)'],
  [/import.*prepConfig.*from.*/g, '// (config stripped)'],
  [/<PrepProvider[^>]*>[\s\S]*?<\/PrepProvider>/g, '<>{children}</>'],
];

// Much simpler: just write a clean root layout
const brandName = {
  "nextjs-prep": "Next.js",
  "ios-prep": "iOS",
  "android-prep": "Android",
  "nest-prep": "NestJS",
}[APP_NAME] || APP_NAME;

const rootLayout = `import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./rich.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://${APP_NAME}.gerardocordero.dev"),
  title: "${brandName} Interview Prep",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={\`\${sans.variable} \${mono.variable} h-full antialiased\`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
`;

fs.writeFileSync(rootLayoutPath, rootLayout);
console.log(`✓ Updated root layout.tsx (stripped providers, kept fonts + CSS)`);

// ── 5. Create root page.tsx (locale picker) ────────────────────────
const rootPage = `import Link from "next/link";

export default function RootPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            ${brandName} Interview Prep
          </span>
        </h1>
        <p className="text-lg text-muted">Choose your language / Elige tu idioma</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/en"
          className="rounded-xl bg-gradient-to-r from-accent to-accent-2 px-8 py-4 text-lg font-bold text-bg transition-opacity hover:opacity-90"
        >
          English
        </Link>
        <Link
          href="/es"
          className="rounded-xl border border-border bg-surface px-8 py-4 text-lg font-bold text-text transition-colors hover:border-accent/50"
        >
          Español
        </Link>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(SRC_APP, "page.tsx"), rootPage);
console.log(`✓ Created root page.tsx (locale picker)`);

// ── 6. Rewrite [locale]/layout.tsx with I18nProvider ──────────────
// The old layout is now at [locale]/layout.tsx. Overwrite it.
const localeLayout = `import { I18nProvider, PrepProvider, SiteHeader, SiteFooter } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { prepConfig } from "@/prep.config";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <I18nProvider locale={locale as Locale}>
      <PrepProvider config={prepConfig}>
        <SiteHeader />
        <main className="mx-auto w-full max-w-content flex-1 px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
        <SiteFooter />
      </PrepProvider>
    </I18nProvider>
  );
}
`;

fs.writeFileSync(path.join(LOCALE_DIR, "layout.tsx"), localeLayout);
console.log(`✓ Rewrote [locale]/layout.tsx (I18nProvider + PrepProvider + header/footer)`);

// ── 7. Update each page.tsx to accept locale param ─────────────────
const PAGE_ROUTES = [
  "page.tsx",
  "architecture/page.tsx",
  "flashcards/page.tsx",
  "pitches/page.tsx",
  "practice/page.tsx",
  "progress/page.tsx",
  "quiz/page.tsx",
  "roadmap/page.tsx",
  "search/page.tsx",
  "study/page.tsx",
  "today/page.tsx",
];

for (const route of PAGE_ROUTES) {
  const fp = path.join(LOCALE_DIR, route);
  if (!fs.existsSync(fp) || route === "layout.tsx") continue;

  let content = fs.readFileSync(fp, "utf-8");

  // Add generateStaticParams if missing
  if (!content.includes("generateStaticParams")) {
    const gspBlock = `
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

`;
    // Insert after last import
    const importLines = [...content.matchAll(/^import .+$/gm)];
    if (importLines.length > 0) {
      const lastImport = importLines[importLines.length - 1];
      const insertAt = content.indexOf("\n", lastImport.index) + 1;
      content = content.slice(0, insertAt) + "\n" + gspBlock + content.slice(insertAt);
    }
  }

  // Add locale param to default export function
  content = content.replace(
    /export default function (\w+)\s*\(\)/,
    'export default async function $1({ params }: { params: Promise<{ locale: string }> })',
  );

  // Add locale extraction in function body
  content = content.replace(
    /(export default async function \w+\([^)]+\))\s*\{/,
    '$1 {\n  const { locale } = await params;',
  );

  fs.writeFileSync(fp, content);
  console.log(`  updated ${route}`);
}

// ── 8. Create Spanish content stubs in src/data/ ──────────────────
const DATA_DIR = path.join(APP_DIR, "src/data");
if (fs.existsSync(DATA_DIR)) {
  const dataFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".ts") && !f.endsWith(".es.ts") && f !== "all.ts");

  for (const file of dataFiles) {
    const esFile = file.replace(/\.ts$/, ".es.ts");
    const esPath = path.join(DATA_DIR, esFile);
    if (fs.existsSync(esPath)) {
      console.log(`  ⤷ skipping ${esFile} (exists)`);
      continue;
    }

    const stub = `// ${esFile} — Spanish content stubs.
// Copy the English export structures and translate string fields.
// Mark translatable fields with /* @translate */.
// Then update the importing pages to locale-aware imports.

export * from "./${file.replace(/\.ts$/, "")}";
`;

    fs.writeFileSync(esPath, stub);
    console.log(`  created data/${esFile} (stub)`);
  }
}

console.log(`\n✅ ${APP} is now bilingual-ready!`);
console.log(`\nWhat's left manually per app:`);
console.log(`  1. Edit src/data/*.es.ts — translate string fields`);
console.log(`  2. Update page files to load locale-appropriate data`);
console.log(`     (e.g. locale === "es" ? import from *.es : import from base)`);
console.log(`  3. Run \`pnpm typecheck\` and \`pnpm build\``);
