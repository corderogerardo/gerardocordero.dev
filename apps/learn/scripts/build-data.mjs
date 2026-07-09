// Build-time data aggregator: executes lesson .js files in a vm sandbox and
// emits per-course JSON into public/data/{locale}/ for Next.js to consume at build time.
// Supports English (en) and Spanish (es) locales with fallback.
// Usage: node scripts/build-data.mjs   (from apps/learn/)
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "public", "data");

// Course definitions: directory → course slug, store key suffix, display meta
const COURSES = [
  { dir: "lessons",          id: "ios",     storeKey: "pawwalk-academy-ios-v1",     title: "iOS & Swift",   emoji: "📱" },
  { dir: "lessons-android",  id: "android", storeKey: "pawwalk-academy-android-v1", title: "Android & Kotlin", emoji: "🤖" },
  { dir: "lessons-ruby",     id: "ruby",    storeKey: "pawwalk-academy-ruby-v1",    title: "Ruby & Rails",  emoji: "💎" },
  { dir: "lessons-python",   id: "python",  storeKey: "pawwalk-academy-python-v1",  title: "Python & FastAPI", emoji: "🐍" },
  { dir: "lessons-go",       id: "go",      storeKey: "pawwalk-academy-go-v1",      title: "Go Backend",    emoji: "🐹" },
  { dir: "lessons-node",     id: "node",    storeKey: "pawwalk-academy-node-v1",    title: "Node & NestJS", emoji: "🟢" },
];

const LOCALES = ["en", "es"];

// Spanish lesson directories mirror English ones with "-es" suffix
function localeDir(baseDir, locale) {
  if (locale === "en") return baseDir;
  // English: lessons, lessons-android → Spanish: lessons-es, lessons-android-es
  return baseDir + "-es";
}

function loadCourse(courseDef, locale) {
  const { dir, id, storeKey, title, emoji } = courseDef;
  const lessonsDir = localeDir(dir, locale);
  const fullPath = join(root, lessonsDir);

  // Fall back to English if locale-specific directory doesn't exist
  const sourceDir = existsSync(fullPath) ? lessonsDir : dir;
  const sourcePath = join(root, sourceDir);

  let files;
  try { files = readdirSync(sourcePath).filter((f) => f.endsWith(".js")).sort(); }
  catch {
    // No files — fall back to English base
    const basePath = join(root, dir);
    try { files = readdirSync(basePath).filter((f) => f.endsWith(".js")).sort(); }
    catch { return null; }
  }

  const modules = [];
  for (const file of files) {
    const src = readFileSync(join(sourcePath, file), "utf8");
    const sandbox = { window: { COURSE: [] } };
    try {
      vm.runInNewContext(src, sandbox, { filename: file, timeout: 5000 });
    } catch {
      continue;
    }
    const mods = sandbox.window.COURSE;
    for (const m of mods) {
      const isRe = (v) => v && typeof v === "object" && typeof v.source === "string" && "flags" in v;
      const serRe = (v) => (isRe(v) ? { source: v.source, flags: v.flags } : v);
      for (const lesson of m.lessons || []) {
        for (const step of lesson.steps || []) {
          if (step.checks) step.checks = step.checks.map((c) => ({ ...c, re: serRe(c.re) }));
          if (step.mustNot) step.mustNot = step.mustNot.map((c) => ({ ...c, re: serRe(c.re) }));
        }
      }
      modules.push(m);
    }
  }

  return { id, title, emoji, storeKey, modules };
}

// Apply committed translation overlays (tools/i18n-work/<course>/*.json,
// produced by tools/i18n-extract.mjs and translated in place) onto a course
// built from the English lessons. Lets es ship translated JSON without
// duplicating the lesson .js sources; untranslated modules stay English.
function applyTranslationOverlay(course, locale) {
  if (locale === "en") return 0;
  const workDir = join(root, "tools", "i18n-work", course.id);
  if (!existsSync(workDir)) return 0;
  let applied = 0;
  const setByPath = (obj, path, value) => {
    const segs = path.match(/[^.[\]]+/g);
    let node = obj;
    for (let i = 0; i < segs.length - 1; i++) {
      node = node[/^\d+$/.test(segs[i]) ? Number(segs[i]) : segs[i]];
      if (node === undefined) throw new Error(`bad path: ${path}`);
    }
    const last = segs[segs.length - 1];
    const key = /^\d+$/.test(last) ? Number(last) : last;
    if (node[key] === undefined) throw new Error(`bad path: ${path}`);
    node[key] = value;
  };
  for (const f of readdirSync(workDir).filter((f) => f.endsWith(".json")).sort()) {
    const work = JSON.parse(readFileSync(join(workDir, f), "utf8"));
    for (const u of work.units) {
      setByPath(course, u.path, u.text);
      applied++;
    }
  }
  return applied;
}

function main() {
  for (const locale of LOCALES) {
    const localeDataDir = join(dataDir, locale);
    mkdirSync(localeDataDir, { recursive: true });

    for (const courseDef of COURSES) {
      const course = loadCourse(courseDef, locale);
      if (!course) {
        console.warn(`Skipping ${courseDef.dir} — directory not found`);
        continue;
      }
      const applied = applyTranslationOverlay(course, locale);
      const filePath = join(localeDataDir, `${course.id}.json`);
      writeFileSync(filePath, JSON.stringify(course, null, 2));
      const moduleCount = course.modules.length;
      const lessonCount = course.modules.reduce((n, m) => n + (m.lessons || []).length, 0);
      const sourceDir = localeDir(courseDef.dir, locale);
      const actualDir = existsSync(join(root, sourceDir)) ? sourceDir : courseDef.dir;
      console.log(`✓ ${locale}/${course.id}: ${moduleCount} modules, ${lessonCount} lessons ← ${actualDir}${applied ? ` (+${applied} translated units)` : ""}`);
    }
  }
}

main();
