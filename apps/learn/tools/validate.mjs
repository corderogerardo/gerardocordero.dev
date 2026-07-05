// Validates every *.js file in a lessons directory: syntax, schema, and — critically —
// that each exercise's own solution passes its own checks (so every exercise is solvable).
// Usage: node tools/validate.mjs [dir]   (from apps/learn/)
//   - with a dir arg: validates just that directory
//   - with no arg: validates all four course dirs (lessons, lessons-android,
//     lessons-ruby, lessons-python) and exits non-zero if any of them has errors
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { types } from "node:util";
import vm from "node:vm";

const isRegExp = (v) => types.isRegExp(v); // instanceof fails across the vm realm

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ALL_DIRS = ["lessons", "lessons-android", "lessons-ruby", "lessons-python", "lessons-go"];

const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

// Keep in sync with normalize() in app.js
function normalize(code, lang) {
  code = lang === "python" ? code.replace(/#[^\n]*/g, " ")
    : lang === "ruby" ? code.replace(/#(?!\{)[^\n]*/g, " ")
    : code.replace(/\/\/[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
  return code
    .replace(/\s+/g, " ")
    .replace(/\s*([^\w\s])\s*/g, "$1")
    .trim();
}

const KNOWN_LANGS = new Set(["swift", "python", "kotlin", "ruby", "go"]);

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

const argDir = process.argv[2];
if (argDir) {
  validateDir(argDir);
} else {
  let allOk = true;
  for (const dir of ALL_DIRS) {
    console.log(`\n=== ${dir} ===`);
    if (!validateDir(dir)) allOk = false;
  }
  if (!allOk) process.exit(1);
}
if (errors.length) process.exit(1);
