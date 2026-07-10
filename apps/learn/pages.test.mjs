// Tests for the new Go course wiring added in this PR: the go.html shell, the
// cross-links added to the other four course shells, and the accompanying
// docs (README.md, CLAUDE.md, docs/learning/go-academy-plan.md) staying in
// sync with the actual lessons-go/*.js modules.
//
// These are lightweight structural/content assertions (no DOM dependency),
// consistent with the zero-dependency style of the rest of apps/learn — run
// with:
//   node --test apps/learn/pages.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const LEARN_ROOT = here;
const REPO_ROOT = join(LEARN_ROOT, "..", "..");

const read = (p) => readFileSync(p, "utf8");

const PAGES = {
  "index.html": "iOS",
  "android.html": "Android",
  "ruby.html": "Ruby",
  "python.html": "Python",
  "go.html": "Go",
};

// ---------- go.html ----------

test("go.html sets the go-specific store key before loading lesson scripts", () => {
  const html = read(join(LEARN_ROOT, "go.html"));
  const storeIdx = html.indexOf('window.STORE_KEY = "pawwalk-academy-go-v1"');
  const firstLessonIdx = html.indexOf('lessons-go/00-go-welcome.js');
  assert.notEqual(storeIdx, -1, "expected go.html to set window.STORE_KEY to the go store key");
  assert.notEqual(firstLessonIdx, -1, "expected go.html to load lessons-go/00-go-welcome.js");
  assert.ok(storeIdx < firstLessonIdx, "STORE_KEY must be set before any lesson script tag");
});

test("go.html loads every lessons-go module, in numeric order, before app.js", () => {
  const html = read(join(LEARN_ROOT, "go.html"));
  const scriptSrcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  const expectedLessons = readdirSync(join(LEARN_ROOT, "lessons-go"))
    .filter((f) => f.endsWith(".js"))
    .sort()
    .map((f) => `lessons-go/${f}`);
  // Derived from the directory, not hardcoded: adding a module should not fail this.
  assert.ok(expectedLessons.length > 0, "expected at least one lessons-go module");
  assert.deepEqual(scriptSrcs.slice(0, expectedLessons.length), expectedLessons);
  assert.equal(scriptSrcs[scriptSrcs.length - 1], "app.js");
});

test("go.html links to the other four course shells but not to itself", () => {
  const html = read(join(LEARN_ROOT, "go.html"));
  for (const page of Object.keys(PAGES)) {
    if (page === "go.html") {
      assert.ok(!html.includes(`href="${page}"`), "go.html should not link to itself");
    } else {
      assert.ok(html.includes(`href="${page}"`), `go.html should link to ${page}`);
    }
  }
});

// ---------- Cross-links from the other four shells ----------

for (const [page, label] of Object.entries(PAGES)) {
  test(`${page} links to every other course shell (full cross-link mesh)`, () => {
    const html = read(join(LEARN_ROOT, page));
    for (const other of Object.keys(PAGES)) {
      if (other === page) {
        assert.ok(!html.includes(`href="${other}"`), `${page} should not link to itself`);
      } else {
        assert.ok(html.includes(`href="${other}"`), `${page} should link to ${other}`);
      }
    }
  });
}

test("index.html and android.html mono-caption nav both include a Go link (this PR's addition)", () => {
  for (const page of ["index.html", "android.html"]) {
    const html = read(join(LEARN_ROOT, page));
    const captionMatch = html.match(/<p class="mono-caption">([\s\S]*?)<\/p>/);
    assert.ok(captionMatch, `expected a mono-caption paragraph in ${page}`);
    assert.match(captionMatch[1], /<a href="go\.html">Go/);
  }
});

// ---------- README.md ----------

test("README.md documents five courses including Go", () => {
  const readme = read(join(LEARN_ROOT, "README.md"));
  assert.match(readme, /Five courses share one engine/);
  assert.match(readme, /\*\*Go\*\* \(`go\.html`\)/);
  assert.match(readme, /pawwalk-academy-go-v1.*for Go/);
  assert.match(readme, /lessons-go\/\*\.js/);
  assert.match(readme, /lessons-go\/FORMAT-GO\.md/);
  assert.match(readme, /validate all five lesson dirs \(iOS\/Android\/Ruby\/Python\/Go\)/);
  assert.match(readme, /lessons \| lessons-android \| lessons-ruby \| lessons-python \| lessons-go/);
});

// ---------- CLAUDE.md ----------

test("CLAUDE.md's apps/learn row mentions the Go course and all five lesson dirs", () => {
  const claude = read(join(REPO_ROOT, "CLAUDE.md"));
  const row = claude.split("\n").find((line) => line.includes("`apps/learn`"));
  assert.ok(row, "expected a table row documenting apps/learn in CLAUDE.md");
  assert.match(row, /Go\/net-http\+backend/);
  assert.match(row, /validates all five lesson dirs/);
  assert.match(row, /lessons-go/);
});

// ---------- docs/learning/go-academy-plan.md stays in sync with lessons-go/*.js ----------

function loadModule(file) {
  const src = read(join(LEARN_ROOT, "lessons-go", file));
  const sandbox = { window: { COURSE: [] } };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: file });
  assert.equal(sandbox.window.COURSE.length, 1, `${file} should push exactly one module`);
  return sandbox.window.COURSE[0];
}

test("go-academy-plan.md's module table matches the id/title of every lessons-go/*.js module", () => {
  const plan = read(join(REPO_ROOT, "docs", "learning", "go-academy-plan.md"));
  const rows = [...plan.matchAll(/\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|/g)];

  const files = readdirSync(join(LEARN_ROOT, "lessons-go")).filter((f) => f.endsWith(".js")).sort();
  assert.ok(files.length > 0, "expected at least one lessons-go module");
  assert.ok(
    rows.length >= files.length,
    `plan table has ${rows.length} rows for ${files.length} lessons-go modules`
  );

  const docFileToTitle = new Map(rows.map((m) => [m[1], m[2].trim()]));
  for (const file of files) {
    assert.ok(docFileToTitle.has(file), `expected go-academy-plan.md to document ${file}`);
    const mod = loadModule(file);
    assert.equal(
      docFileToTitle.get(file),
      mod.title,
      `title for ${file} in go-academy-plan.md should match the module's actual title`
    );
  }
});

test("every lessons-go/*.js module declares lang: \"go\" and a go- prefixed kebab-case id (FORMAT-GO.md rule)", () => {
  const files = readdirSync(join(LEARN_ROOT, "lessons-go")).filter((f) => f.endsWith(".js")).sort();
  const seenIds = new Set();
  for (const file of files) {
    const mod = loadModule(file);
    assert.equal(mod.lang, "go", `${file}: module.lang must be "go"`);
    assert.match(mod.id, /^go-[a-z0-9-]+$/, `${file}: module.id "${mod.id}" should be go-prefixed kebab-case`);
    assert.ok(!seenIds.has(mod.id), `${file}: duplicate module id ${mod.id}`);
    seenIds.add(mod.id);
    assert.ok(Array.isArray(mod.lessons) && mod.lessons.length > 0, `${file}: module.lessons should be non-empty`);
  }
});