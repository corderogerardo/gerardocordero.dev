#!/usr/bin/env node
// Fail when a translation overlay no longer lines up with the English lessons.
//
//   node tools/i18n-check.mjs        (from apps/learn/)
//
// Overlay units in tools/i18n-work/<course>/*.json address content by position
// (`modules[11].lessons[1].steps[4].q`). Insert a step into a lesson and every
// unit after it now points one slot too early — at best the build crashes on a
// missing key, at worst it writes one step's translation onto another step's
// prose and nobody notices.
//
// Each unit carries `src`, the English string it was translated from, so drift
// is detectable: resolve the path, compare against `src`. This is the gate that
// makes that check fail CI. `scripts/build-data.mjs` skips stale units (leaving
// them in English) rather than crashing, so the site always builds.
//
// To repair drift: re-point the unit's `path` at the content its `src`/`text`
// belong to, and refresh `src` to the current English.
import { COURSES, LOCALES, loadCourse, applyTranslationOverlay } from "../scripts/build-data.mjs";

let stale = 0;
let checked = 0;

for (const locale of LOCALES.filter((l) => l !== "en")) {
  for (const courseDef of COURSES) {
    const course = loadCourse(courseDef, locale);
    if (!course) continue;
    const result = applyTranslationOverlay(course, locale);
    checked += result.applied + result.stale.length;
    for (const s of result.stale) {
      stale++;
      console.error(`✗ ${locale}/${courseDef.id} ${s.file}: ${s.path}\n    ${s.reason}`);
    }
  }
}

if (stale > 0) {
  console.error(`\n${stale} stale unit(s) of ${checked} checked. These stay English until re-anchored.`);
  process.exit(1);
}

console.log(`✓ ${checked} translation units all match their English source.`);
