#!/usr/bin/env node
// Merge translated work units into public/data/es/<course>.json.
//
//   node tools/i18n-merge.mjs <course>
//
// Starts from a fresh copy of the English course (so code fields — starter,
// solution, checks, source, ids — are always verbatim), then applies every
// translated unit found in tools/i18n-work/<course>/*.json by path. Modules
// with no work file simply stay English (translate incrementally, module by
// module). Validates that every path resolves before writing.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const course = process.argv[2];
if (!course) {
  console.error("usage: node tools/i18n-merge.mjs <course>");
  process.exit(1);
}

const data = JSON.parse(readFileSync(join(ROOT, "public/data/en", `${course}.json`), "utf8"));
const workDir = join(ROOT, "tools/i18n-work", course);
if (!existsSync(workDir)) { console.error(`no work dir ${workDir}`); process.exit(1); }

// path like modules[3].lessons[0].steps[2].md[1] -> segments
function setByPath(obj, path, value) {
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
}

let applied = 0, files = 0;
for (const f of readdirSync(workDir).filter((f) => f.endsWith(".json")).sort()) {
  const work = JSON.parse(readFileSync(join(workDir, f), "utf8"));
  for (const u of work.units) {
    setByPath(data, u.path, u.text);
    applied++;
  }
  files++;
}

const out = join(ROOT, "public/data/es", `${course}.json`);
writeFileSync(out, JSON.stringify(data, null, 1));
console.log(`applied ${applied} units from ${files} module file(s) -> ${out}`);
