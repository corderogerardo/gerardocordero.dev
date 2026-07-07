// Scaffold Spanish lesson directories by copying English lesson files and
// marking translatable strings. Run from apps/learn/:
//   node scripts/scaffold-es.mjs
//
// This creates lessons-ios-es/ etc. from lessons/ etc.
// After running, each file has a `/* @translate */` comment before every
// translatable string so you or a translation service can find them.

import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const COURSE_DIRS = [
  { src: "lessons",          dest: "lessons-es" },
  { src: "lessons-android",  dest: "lessons-android-es" },
  { src: "lessons-ruby",     dest: "lessons-ruby-es" },
  { src: "lessons-python",   dest: "lessons-python-es" },
  { src: "lessons-go",       dest: "lessons-go-es" },
];

// String fields in the lesson data format that should be translated.
// These appear in the JavaScript lesson files.
const TRANSLATABLE_KEYS = new Set([
  "title",       // lesson/module titles
  "md",          // text step markdown (array)
  "q",           // quiz question
  "choices",     // quiz choices (array)
  "explain",     // quiz explanation
  "nudge",       // quiz nudge
  "prompt",      // exercise prompt (array)
  "starter",     // exercise starter code — often translatable (comments in code)
  "success",     // exercise success message
  "caption",     // code caption
  "items",       // xcode items (array)
  "label",       // xcode label
  "intro",       // xcode intro (array)
  "hint",        // check hint
  "solution",    // solution comments are translatable
]);

// Mark translatable strings in a JS file by adding @translate comments.
function markTranslatable(content, filePath) {
  const lines = content.split("\n");
  const result = [];

  for (const line of lines) {
    // Check if the line contains a translatable key assignment
    let matched = false;
    for (const key of TRANSLATABLE_KEYS) {
      const regex = new RegExp(`(["'])${key}\\1\\s*:`);
      if (regex.test(line)) {
        result.push(`      /* @translate */`);
        result.push(line);
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.push(line);
    }
  }

  return result.join("\n");
}

for (const { src, dest } of COURSE_DIRS) {
  const srcDir = join(root, src);
  const destDir = join(root, dest);

  if (!existsSync(srcDir)) {
    console.warn(`✗ Source directory not found: ${src}`);
    continue;
  }

  if (existsSync(destDir)) {
    console.log(`→ ${dest} already exists, skipping (remove it first to regenerate)`);
    continue;
  }

  mkdirSync(destDir, { recursive: true });
  let count = 0;

  const files = readdirSync(srcDir)
    .filter((f) => f.endsWith(".js"))
    .sort();

  for (const file of files) {
    const srcContent = readFileSync(join(srcDir, file), "utf8");
    const markedContent = markTranslatable(srcContent, file);
    writeFileSync(join(destDir, file), markedContent);
    count++;
  }

  console.log(`✓ ${dest}: ${count} files scaffolded (translatable fields marked with @translate)`);
}

console.log("\nDone. All translatable strings are marked with `/* @translate */`.");
console.log("Edit the files in *-es/ directories to translate the content.");
