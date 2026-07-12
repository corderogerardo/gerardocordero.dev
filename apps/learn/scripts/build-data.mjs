// Build-time data aggregator: executes lesson .js files in a vm sandbox and
// emits per-course JSON into public/data/{locale}/ for Next.js to consume at build time.
// Supports English (en) and Spanish (es) locales with fallback.
// Usage: node scripts/build-data.mjs   (from apps/learn/)
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "public", "data");

// Course definitions: directory → course slug, store key suffix, display meta
export const COURSES = [
  { dir: "lessons",          id: "ios",     storeKey: "pawwalk-academy-ios-v1",     title: "iOS & Swift",   emoji: "📱" },
  { dir: "lessons-android",  id: "android", storeKey: "pawwalk-academy-android-v1", title: "Android & Kotlin", emoji: "🤖" },
  { dir: "lessons-ruby",     id: "ruby",    storeKey: "pawwalk-academy-ruby-v1",    title: "Ruby & Rails",  emoji: "💎" },
  { dir: "lessons-python",   id: "python",  storeKey: "pawwalk-academy-python-v1",  title: "Python & FastAPI", emoji: "🐍" },
  { dir: "lessons-go",       id: "go",      storeKey: "pawwalk-academy-go-v1",      title: "Go Backend",    emoji: "🐹" },
  { dir: "lessons-node",     id: "node",    storeKey: "pawwalk-academy-node-v1",    title: "Node & NestJS", emoji: "🟢" },
  { dir: "lessons-native",   id: "native",  storeKey: "pawwalk-academy-native-v1",  title: "Native RN & Expo Modules", emoji: "🛰️" },
  { dir: "lessons-expoui",   id: "expoui",  storeKey: "pawwalk-academy-expoui-v1",  title: "Rebuild @expo/ui", emoji: "🎛️" },
];

export const LOCALES = ["en", "es"];

// Spanish lesson directories mirror English ones with "-es" suffix
function localeDir(baseDir, locale) {
  if (locale === "en") return baseDir;
  // English: lessons, lessons-android → Spanish: lessons-es, lessons-android-es
  return baseDir + "-es";
}

export function loadCourse(courseDef, locale) {
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
          // Propagate the module's language onto each step so the runtime
          // (code-step/exercise-step read step.lang ?? "swift") highlights and
          // normalizes in the right language instead of falling back to Swift.
          if (step.lang == null && m.lang) step.lang = m.lang;
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
//
// Units address content by position (`modules[3].lessons[1].steps[4].q`), so
// inserting a step upstream silently re-points every unit after it. Each unit
// therefore carries `src`: the English string it was translated from. A unit
// only applies when the English still matches — otherwise the target is not
// what the translator saw, and we leave it in English rather than write the
// wrong Spanish onto it. `tools/i18n-check.mjs` turns any such staleness into
// a CI failure; the build itself degrades instead of crashing or corrupting.
export function applyTranslationOverlay(course, locale) {
  if (locale === "en") return { applied: 0, stale: [] };
  const workDir = join(root, "tools", "i18n-work", course.id);
  if (!existsSync(workDir)) return { applied: 0, stale: [] };

  const resolveParent = (obj, path) => {
    const segs = path.match(/[^.[\]]+/g);
    let node = obj;
    for (let i = 0; i < segs.length - 1; i++) {
      if (node === undefined || node === null) return null;
      node = node[/^\d+$/.test(segs[i]) ? Number(segs[i]) : segs[i]];
    }
    if (node === undefined || node === null) return null;
    const last = segs[segs.length - 1];
    return { node, key: /^\d+$/.test(last) ? Number(last) : last };
  };

  let applied = 0;
  const stale = [];
  for (const f of readdirSync(workDir).filter((f) => f.endsWith(".json")).sort()) {
    const work = JSON.parse(readFileSync(join(workDir, f), "utf8"));
    for (const u of work.units) {
      const target = resolveParent(course, u.path);
      const current = target ? target.node[target.key] : undefined;
      if (current === undefined) {
        stale.push({ file: f, path: u.path, reason: "path no longer exists" });
        continue;
      }
      if (u.src !== undefined && current !== u.src) {
        stale.push({ file: f, path: u.path, reason: "English source changed since translation" });
        continue;
      }
      target.node[target.key] = u.text;
      applied++;
    }
  }
  return { applied, stale };
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
      const { applied, stale } = applyTranslationOverlay(course, locale);
      const filePath = join(localeDataDir, `${course.id}.json`);
      writeFileSync(filePath, JSON.stringify(course, null, 2));
      const moduleCount = course.modules.length;
      const lessonCount = course.modules.reduce((n, m) => n + (m.lessons || []).length, 0);
      const sourceDir = localeDir(courseDef.dir, locale);
      const actualDir = existsSync(join(root, sourceDir)) ? sourceDir : courseDef.dir;
      console.log(`✓ ${locale}/${course.id}: ${moduleCount} modules, ${lessonCount} lessons ← ${actualDir}${applied ? ` (+${applied} translated units)` : ""}`);
      if (stale.length) {
        console.warn(`  ⚠ ${stale.length} stale ${locale} unit(s) left in English — run: node tools/i18n-check.mjs`);
      }
    }
  }
}

// Importable by tools/i18n-check.mjs without running the build.
if (process.argv[1] && resolvePath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
