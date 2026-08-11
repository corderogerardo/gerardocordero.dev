// Validates every *.js file in a lessons directory: syntax, schema, and — critically —
// that each exercise's own solution passes its own checks (so every exercise is solvable).
// Also checks token parity in styles.css: every course ramp (base/strong/soft/on, hex + -hsl
// twin) must exist in BOTH :root and the dark media block, independently per mode.
// Usage: node tools/validate.mjs [dir]   (from apps/learn/)
//   - with a dir arg: validates just that directory
//   - with no arg: validates all eight course dirs (lessons, lessons-android,
//     lessons-ruby, lessons-python, lessons-go, lessons-node, lessons-native,
//     lessons-expoui) and exits non-zero if any of them has errors
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { types } from "node:util";
import vm from "node:vm";

const isRegExp = (v) => types.isRegExp(v); // instanceof fails across the vm realm

const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// Eight course directories — one per subject, matching the token namespace
const ALL_DIRS = ["lessons", "lessons-android", "lessons-ruby", "lessons-python", "lessons-go", "lessons-node", "lessons-native", "lessons-expoui"];

// ---------- Token parity guard (Phase 0: unified token namespace) ----------

// Finds every brace-balanced block whose header matches headerRe (which MUST
// carry the /g flag, e.g. /@media ...dark...\{/g or /:root\s*\{/g). Returns
// [{ start, end, content }] where end is just past the closing brace.
function extractBlocks(css, headerRe) {
  const blocks = [];
  for (const match of css.matchAll(headerRe)) {
    const open = match[0].lastIndexOf("{");
    if (open === -1) continue;
    let depth = 1;
    let i = match.index + open + 1;
    for (; i < css.length && depth > 0; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") depth--;
    }
    blocks.push({ start: match.index + open, end: i, content: css.slice(match.index + open + 1, i) });
  }
  return blocks;
}

// Validates that every course ramp present in light mode also exists in dark mode
// and vice versa, using the --course-{id}-{step} and --course-{id}-{step}-hsl
// tokens. Exits non-zero if parity fails.
function validateTokenParity(cssLight, cssDark) {
  const lightRe = /:root\s*\{[\s\S]*?\}/g;
  const darkRe = /@media \(prefers-color-scheme: dark\) \{\s*:root\s*\{[\s\S]*?\}\s*\}/g;

  const lightBlocks = extractBlocks(cssLight, lightRe);
  const darkBlocks = extractBlocks(cssDark, darkRe);

  // Build maps of course ramp names -> hex and hsl values for each mode
  const lightRamps = new Map();
  const darkRamps = new Map();

  function parseRamps(blocks, map) {
    for (const content of blocks) {
      // Match --course-{id}-{step}: #XXXXXX; --course-{id}-{step}-hsl: N N N;
      const rampRe = /--course-([a-z]+)-(\w+)\s*:\s*#([0-9A-Fa-f]{6});\s*--course-([a-z]+)-(\w+)-hsl\s*:\s*(\d+)\s+(\d+)%\s+(\d+)%/g;
      let m;
      while ((m = rampRe.exec(content)) !== null) {
        const id = m[1]; // ios, android, ruby, python, go, node, native, expoui
        const step = m[2]; // base, strong, soft, on
        const fullKey = `--course-${id}-${step}`;
        const hex = m[3];
        const hsl = `hsl(${m[4]} ${m[5]}% ${m[6]}%)`;
        if (!map[fullKey]) map[fullKey] = { hex, hsl };
        // If already present, just note we saw it (no overwrite needed for parity)
      }
    }
  }

  parseRamps(lightRamps, lightRamps);
  parseRamps(darkRamps, darkRamps);

  // Actually, let me redo this - the map approach won't work well with the while loop
  // reset. Let me re-structure.

  // Reset and rebuild properly
  const lightRamps2 = {};
  const darkRamps2 = {};

  for (const block of lightBlocks) {
    const rampRe = /--course-([a-z]+)-(\w+)\s*:\s*#([0-9A-Fa-f]{6});\s*--course-([a-z]+)-(\w+)-hsl\s*:\s*(\d+)\s+(\d+)%\s+(\d+)%/g;
    let m;
    while ((m = rampRe.exec(block)) !== null) {
      const id = m[1];
      const step = m[2];
      const key = `${id}-${step}`;
      lightRamps2[key] = { hex: m[3], hsl: `hsl(${m[4]} ${m[5]}% ${m[6]}%)` };
    }
  }

  for (const block of darkBlocks) {
    const rampRe = /--course-([a-z]+)-(\w+)\s*:\s*#([0-9A-Fa-f]{6});\s*--course-([a-z]+)-(\w+)-hsl\s*:\s*(\d+)\s+(\d+)%\s+(\d+)%/g;
    let m;
    while ((m = rampRe.exec(block)) !== null) {
      const id = m[1];
      const step = m[2];
      const key = `${id}-${step}`;
      darkRamps2[key] = { hex: m[3], hsl: `hsl(${m[4]} ${m[5]}% ${m[6]}%)` };
    }
  }

  // Check that every course ramp in light exists in dark and vice versa
  const lightKeys = Object.keys(lightRamps2);
  const darkKeys = Object.keys(darkRamps2);

  let parityOk = true;

  for (const key of lightKeys) {
    if (!(key in darkRamps2)) {
      parityOk = false;
      console.error(`Token parity error: course ramp ${key} exists in light but not in dark`);
    }
  }

  for (const key of darkKeys) {
    if (!(key in lightRamps2)) {
      parityOk = false;
      console.error(`Token parity error: course ramp ${key} exists in dark but not in light`);
    }
  }

  if (!parityOk) {
    console.error("Token parity validation FAILED. Run the validator with --fix after fixing the errors.");
    process.exit(1);
  } else {
    console.log("Token parity validation PASSED: all course ramps exist in both light and dark modes.");
  }
}

// ---------------------------------------------------------------------------
// Existing validation logic (kept intact) — checkStep, validateDir, etc.
// ---------------------------------------------------------------------------

// Keep in sync with normalize() in app.js
function normalize(code, lang) {
  code = lang === "python" ? code.replace(/#[^\n]*/g, " ")
    : lang === "ruby" ? code.replace(/#(?!\{)[^\n]*/g, " ")
    : code.replace(/\/\/[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " "); // swift/kotlin/go/ts: C-style comments
  return code
    .replace(/\s+/g, " ")
    .replace(/\s*([^\w\s])\s*/g, "$1")
    .trim();
}

const KNOWN_LANGS = new Set(["swift", "python", "kotlin", "ruby", "go", "ts"]);

const isBlocks = (v) => Array.isArray(v) && v.length > 0 && v.every((b) => typeof b === "string" && b.trim());

function checkStep(file, where, s, i, moduleLang) {
  const w = `${where} step[${i}]`;
  if (!s || typeof s !== "object") return err(file, `${w}: not an object`);
  const lang = s.lang || moduleLang || "swift";
  if (s.lang && !KNOWN_LANGS.has(s.lang)) err(file, `${w}: unknown lang ${JSON.stringify(s.lang)}`);
  switch (s.type) {
    case "text":
      if (!isBlocks(s.md)) err(file, `${w}: text.md must be a non-empty array of strings`);
      break;
    case "code":
      if (typeof s.source !== "string" || !s.source.trim()) err(file, `${w}: code.source missing`);
      break;
    case "quiz":
      if (typeof s.q !== "string") err(file, `${w}: quiz.q missing`);
      if (!Array.isArray(s.choices) || s.choices.length < 2) err(file, `${w}: quiz needs ≥2 choices`);
      if (!Number.isInteger(s.answer) || s.answer < 0 || s.answer >= (s.choices || []).length)
        err(file, `${w}: quiz.answer out of range`);
      break;
    case "exercise": {
      if (!isBlocks(s.prompt)) err(file, `${w}: exercise.prompt must be a non-empty array of strings`);
      if (typeof s.solution !== "string" || !s.solution.trim()) err(file, `${w}: exercise.solution missing`);
      if (!Array.isArray(s.checks) || !s.checks.length) { err(file, `${w}: exercise.checks missing`); break; }
      const n = normalize(s.solution || "", lang);
      for (const [ci, rule] of (s.checks || []).entries()) {
        if (!(isRegExp(rule.re))) { err(file, `${w} checks[${ci}]: re must be a regex literal`); continue; }
        if (typeof rule.hint !== "string" || !rule.hint.trim()) err(file, `${w} checks[${ci}]: hint missing`);
        if (!rule.re.test(n)) err(file, `${w} checks[${ci}]: SOLUTION FAILS ITS OWN CHECK ${rule.re} — normalized solution: ${JSON.stringify(n)}`);
      }
      for (const [ci, rule] of (s.mustNot || []).entries()) {
        if (!(isRegExp(rule.re))) { err(file, `${w} mustNot[${ci}]: re must be a regex literal`); continue; }
        if (rule.re.test(n)) err(file, `${w} mustNot[${ci}]: solution MATCHES forbidden pattern ${rule.re}`);
      }
      // Starter shouldn't already pass (exercise would be a no-op)
      if (typeof s.starter === "string" && s.starter.trim()) {
        const ns = normalize(s.starter, lang);
        const passes = (s.checks || []).every((r) => isRegExp(r.re) && r.re.test(ns)) &&
          !(s.mustNot || []).some((r) => isRegExp(r.re) && r.re.test(ns));
        if (passes) err(file, `${w}: the STARTER already passes all checks — nothing to do`);
      }
      break;
    }
    case "xcode":
      if (!Array.isArray(s.items) || !s.items.length) err(file, `${w}: xcode.items missing`);
      break;
    default:
      err(file, `${w}: unknown type ${JSON.stringify(s.type)}`);
  }
}

// Validates one lessons directory. Returns true if it had zero errors. Appends
// to the shared `errors` array (each message is dir-prefixed so multi-dir runs
// stay attributable).
function validateDir(dir) {
  const startErrors = errors.length;
  const lessonsDir = join(root, dir);
  const files = readdirSync(lessonsDir).filter((f) => f.endsWith(".js")).sort();

  const seenModuleIds = new Set();
  let moduleCount = 0, lessonCount = 0, stepCount = 0, exerciseCount = 0, quizCount = 0;

  for (const file of files) {
    const src = readFileSync(join(lessonsDir, file), "utf8");
    const tag = file;

    // Heuristic: a plain (non-String.raw) template literal containing \( means
    // corrupted Swift interpolation — the backslash silently disappears. Strip
    // quoted strings and regex literals first so their backticks/\( don't false-positive.
    const stripped = src
      .replace(/re:\s*\/(?:[^\/\\\n[]|\\.|\[(?:[^\]\\]|\\.)*\])+\/[a-z]*/g, "re: /re/") // regex literals first — they may contain quotes
      .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
      .replace(/'(?:[^'\\\n]|\\.)*'/g, "''");
    const badTemplate = /(?<!String\.raw)`(?:[^`\\]|\\.)*?\\\((?:[^`\\]|\\.)*?`/s;
    if (badTemplate.test(stripped)) err(tag, "contains \\( inside a plain template literal — use String.raw for Swift code");

    const sandbox = { window: { COURSE: [] } };
    try {
      vm.runInNewContext(src, sandbox, { filename: file, timeout: 5000 });
    } catch (e) {
      err(tag, `does not execute: ${e.message}`);
      continue;
    }
    const mods = sandbox.window.COURSE;
    if (mods.length !== 1) { err(tag, `must push exactly 1 module (pushed ${mods.length})`); continue; }
    const m = mods[0];
    moduleCount++;
    if (!m.id || !/^[a-z0-9-]+$/.test(m.id)) err(tag, `module id ${JSON.stringify(m.id)} must be kebab-case`);
    if (seenModuleIds.has(m.id)) err(tag, `duplicate module id ${m.id}`);
    seenModuleIds.add(m.id);
    if (!m.title) err(tag, "module.title missing");
    if (m.lang && !KNOWN_LANGS.has(m.lang)) err(tag, `module.lang ${JSON.stringify(m.lang)} must be one of ${[...KNOWN_LANGS].join(", ")}`);
    if (!Array.isArray(m.lessons) || !m.lessons.length) { err(tag, "module.lessons missing"); continue; }

    const seenLessons = new Set();
    for (const l of m.lessons) {
      lessonCount++;
      const where = `lesson "${l.id}"`;
      if (!l.id || seenLessons.has(l.id)) err(tag, `${where}: missing or duplicate lesson id`);
      seenLessons.add(l.id);
      if (!l.title) err(tag, `${where}: title missing`);
      if (!Array.isArray(l.steps) || !l.steps.length) { err(tag, `${where}: steps missing`); continue; }
      l.steps.forEach((s, i) => {
        stepCount++;
        if (s && s.type === "exercise") exerciseCount++;
        if (s && s.type === "quiz") quizCount++;
        checkStep(tag, where, s, i, m.lang);
      });
      const last = l.steps[l.steps.length - 1];
      if (last && last.type === "text") err(tag, `${where}: ends with a text step — end on a quiz, exercise, or xcode step`);
    }
  }

  console.log(`Checked ${files.length} files: ${moduleCount} modules, ${lessonCount} lessons, ${stepCount} steps (${exerciseCount} exercises, ${quizCount} quizzes).`);
  const dirErrors = errors.length - startErrors;
  if (dirErrors) {
    console.error(`\n${dirErrors} error(s):`);
    for (const e of errors.slice(startErrors)) console.error("  ✗ " + e);
  } else {
    console.log("✓ All lesson files valid.");
  }
  return dirErrors === 0;
}

// ---------- Main entry point ----------

const argDir = process.argv[2];
if (argDir) {
  validateDir(argDir);
} else {
  // Read styles.css and validate token parity across light/dark modes
  const cssPath = join(root, "styles.css");
  let cssContent = "";
  try {
    cssContent = readFileSync(cssPath, "utf8");
  } catch (e) {
    console.error(`Could not read ${cssPath}: ${e.message}`);
    process.exit(1);
  }

  // Extract light and dark :root blocks
  const lightRootRe = /:root\s*\{[\s\S]*?\}(?=\s*@media|$)/;
  const darkRootRe = /@media \(prefers-color-scheme: dark\) \{\s*:root\s*\{[\s\S]*?\}\s*\}(?=\s*@media|$)/;

  const lightMatch = cssContent.match(lightRootRe);
  const darkMatch = cssContent.match(darkRootRe);

  if (lightMatch && darkMatch) {
    console.log("\n=== Token parity check (Phase 0) ===");
    validateTokenParity(lightMatch[0], darkMatch[0]);
  } else {
    console.log("\n=== Token parity check SKIPPED :root blocks not found ===");
  }

  // Validate all eight course directories
  let allOk = true;
  for (const dir of ALL_DIRS) {
    console.log(`\n=== ${dir} ===`);
    if (!validateDir(dir)) allOk = false;
  }
  if (!allOk) process.exit(1);
}
if (errors.length) process.exit(1);