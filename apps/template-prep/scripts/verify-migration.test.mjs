// Smoke check for the template-prep Next.js 16.3.0 migration.
// Runs on Node native node:test — zero deps, no subprocess, no git, no shell.
// Exit 0 = GREEN (all four version pins + the 14-route static export set),
// nonzero = RED. Cwd-independent: resolves the app root from this file.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, sep } from "node:path";

// App root = parent of scripts/. Safe to run from repo root or the app dir.
const APP_DIR = fileURLToPath(new URL("..", import.meta.url));
const PKG_PATH = join(APP_DIR, "package.json");
const OUT_DIR = join(APP_DIR, "out");

const PINNED = {
  next: "16.3.0",
  react: "19.2.8",
  "react-dom": "19.2.8",
  "eslint-config-next": "16.3.0",
};

// 7 routes x 2 locales = 14 route HTML files (trailingSlash: true emits /index.html).
const ROUTES = ["en", "es"].flatMap((l) => [
  `${l}/index.html`,
  `${l}/flashcards/index.html`,
  `${l}/practice/index.html`,
  `${l}/progress/index.html`,
  `${l}/quiz/index.html`,
  `${l}/search/index.html`,
  `${l}/today/index.html`,
]);

// Matches exactly the 14 locale route HTML paths (not root picker, 404, _next, etc.).
const ROUTE_RE = /^(en|es)(\/(flashcards|practice|progress|quiz|search|today))?\/index\.html$/;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(OUT_DIR, full).split(sep).join("/");
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(rel);
    }
  }
  return files;
}

describe("Migration version pins", () => {
  test("package.json declares the four pinned versions", () => {
    const pkg = JSON.parse(readFileSync(PKG_PATH, "utf8"));
    const picked = {};
    for (const dep of Object.keys(PINNED)) {
      picked[dep] = pkg.dependencies?.[dep] ?? pkg.devDependencies?.[dep];
    }
    assert.deepEqual(picked, PINNED);
  });
});

describe("Build output routes", () => {
  test("out/ contains exactly the 14 locale route HTML paths", () => {
    if (!existsSync(OUT_DIR)) {
      assert.fail("out/ is missing — run the build gate first");
    }
    const routes = walk(OUT_DIR).filter((f) => ROUTE_RE.test(f)).sort();
    assert.deepEqual(routes, [...ROUTES].sort());
  });
});
