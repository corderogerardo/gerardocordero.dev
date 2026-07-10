#!/usr/bin/env node
// Extract translatable prose from a course JSON into per-module work units.
//
//   node tools/i18n-extract.mjs <course> [moduleIndex]
//     course: ios | android | ruby | python | go
//     moduleIndex: 0-based; omit to list modules with word counts.
//
// Writes tools/i18n-work/<course>/<NN>-<moduleId>.json — a flat list of
// { path, src, text } units. Translate each `text` in place (leave `path` and
// `src` alone, keep ``` fenced code, `inline code`, and URLs untranslated),
// then run i18n-merge.mjs to fold the translations into
// public/data/es/<course>.json.
//
// `src` is the English string `text` was translated from. Paths are positional,
// so inserting a step upstream re-points every later unit; build-data.mjs
// compares `src` against the English at `path` and refuses to apply a unit that
// no longer matches. Never hand-edit `src` to silence tools/i18n-check.mjs —
// that check is telling you the path now aims at the wrong content.
//
// PROSE fields are extracted; code/mechanical fields (starter, solution,
// checks, mustNot, source, answer, ids) are never extracted — merge copies
// them verbatim from the English course.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROSE = new Set([
  "md", "title", "caption", "q", "choices", "explain", "nudge",
  "prompt", "success", "label", "intro", "items",
]);

const [course, modArg] = process.argv.slice(2);
if (!course) {
  console.error("usage: node tools/i18n-extract.mjs <course> [moduleIndex]");
  process.exit(1);
}
const data = JSON.parse(readFileSync(join(ROOT, "public/data/en", `${course}.json`), "utf8"));

const words = (s) => String(s).split(/\s+/).filter(Boolean).length;

function collect(node, path, out) {
  if (typeof node === "string") {
    // `src` is the drift baseline and stays English; `text` is what gets translated.
    out.push({ path, src: node, text: node });
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => collect(v, `${path}[${i}]`, out));
  }
}

function moduleUnits(m, mi) {
  const out = [];
  collect(m.title, `modules[${mi}].title`, out);
  m.lessons.forEach((l, li) => {
    collect(l.title, `modules[${mi}].lessons[${li}].title`, out);
    l.steps.forEach((s, si) => {
      for (const [k, v] of Object.entries(s)) {
        if (PROSE.has(k)) collect(v, `modules[${mi}].lessons[${li}].steps[${si}].${k}`, out);
      }
    });
  });
  return out;
}

if (modArg === undefined) {
  console.log(`${course}: ${data.modules.length} modules`);
  data.modules.forEach((m, i) => {
    const units = moduleUnits(m, i);
    const w = units.reduce((n, u) => n + words(u.text), 0);
    console.log(`  [${String(i).padStart(2)}] ${m.id.padEnd(28)} ${String(units.length).padStart(4)} units ${String(w).padStart(6)} words`);
  });
  process.exit(0);
}

const mi = Number(modArg);
const m = data.modules[mi];
if (!m) { console.error(`no module ${mi}`); process.exit(1); }
const units = moduleUnits(m, mi);
const outDir = join(ROOT, "tools/i18n-work", course);
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `${String(mi).padStart(2, "0")}-${m.id}.json`);
writeFileSync(outFile, JSON.stringify({ course, module: mi, units }, null, 1));
console.log(`${units.length} units (${units.reduce((n, u) => n + words(u.text), 0)} words) -> ${outFile}`);
