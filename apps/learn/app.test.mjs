// Tests for the Go language support added to app.js's syntax highlighter in
// this PR: the GO_KW keyword set and the LANG.go entry (keyword set + token
// regex) used by highlight().
//
// app.js is an IIFE with no exports (it runs directly against `window` /
// `document` / `localStorage` in the browser), so these internals can't be
// imported directly. Instead we extract the exact, self-contained slice of
// the real source that defines the keyword sets, LANG table, and highlight()
// function (lines fenced by stable markers already present in app.js) and
// evaluate it in a vm context, stubbing only `esc` (a trivial, unrelated
// helper that highlight() calls to HTML-escape text). This exercises the
// actual shipped code rather than a reimplementation of it.
//
// Zero dependencies — run with:
//   node --test apps/learn/app.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const APP_JS = join(here, "app.js");
const appJsSrc = readFileSync(APP_JS, "utf8");

const START_MARKER = "const SWIFT_KW = new Set(";
const END_MARKER = "// A step's language:";

function extractHighlighterSource() {
  const start = appJsSrc.indexOf(START_MARKER);
  assert.notEqual(start, -1, "expected to find the start of the keyword/highlighter block in app.js");
  const end = appJsSrc.indexOf(END_MARKER, start);
  assert.notEqual(end, -1, "expected to find the end of the keyword/highlighter block in app.js");
  return appJsSrc.slice(start, end);
}

function loadHighlighter() {
  const src = extractHighlighterSource();
  const sandbox = {
    esc: (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
  };
  vm.createContext(sandbox);
  vm.runInContext(
    src + "\nthis.__LANG = LANG; this.__highlight = highlight; this.__GO_KW = GO_KW;",
    sandbox,
    { filename: "app.js (extracted)" }
  );
  return { LANG: sandbox.__LANG, highlight: sandbox.__highlight, GO_KW: sandbox.__GO_KW };
}

const { LANG, highlight, GO_KW } = loadHighlighter();

// ---------- GO_KW ----------

test("GO_KW contains Go's reserved words and stdlib primitive type names", () => {
  for (const kw of ["package", "import", "func", "var", "const", "type", "struct", "interface", "map", "chan", "go", "defer", "select", "range", "switch", "case", "default", "fallthrough", "goto", "iota", "make", "append", "panic", "recover", "error"]) {
    assert.ok(GO_KW.has(kw), `expected GO_KW to contain "${kw}"`);
  }
  for (const t of ["string", "int", "int64", "uint", "byte", "rune", "float64", "bool"]) {
    assert.ok(GO_KW.has(t), `expected GO_KW to contain builtin type "${t}"`);
  }
});

test("GO_KW does not contain identifiers that merely look like keywords", () => {
  for (const notKw of ["Walker", "walkerName", "goroutine", "class", "extends", "def", "fun", "val"]) {
    assert.ok(!GO_KW.has(notKw), `did not expect GO_KW to contain "${notKw}"`);
  }
});

test("LANG.go wires GO_KW as its keyword set", () => {
  assert.ok(LANG.go, "expected LANG.go to be defined");
  assert.equal(LANG.go.kw, GO_KW);
});

// ---------- highlight(src, "go") ----------

test("highlights Go line comments", () => {
  const html = highlight('// a comment\nfunc main() {}', "go");
  assert.match(html, /<span class="tok-com">\/\/ a comment<\/span>/);
});

test("highlights Go block comments spanning multiple lines", () => {
  const html = highlight("/* line one\nline two */\nfunc f() {}", "go");
  assert.match(html, /<span class="tok-com">\/\* line one\nline two \*\/<\/span>/);
});

test("highlights double-quoted string literals", () => {
  const html = highlight('name := "Mochi"', "go");
  assert.match(html, /<span class="tok-str">"Mochi"<\/span>/);
});

test("highlights backtick raw string literals (Go-specific token, unlike Swift/Kotlin)", () => {
  const html = highlight('tag := `json:"name"`', "go");
  assert.match(html, /<span class="tok-str">`json:"name"`<\/span>/);
});

test("highlights single-quoted rune literals", () => {
  const html = highlight("r := 'a'", "go");
  assert.match(html, /<span class="tok-str">'a'<\/span>/);
});

test("highlights keywords", () => {
  const html = highlight("func main() { return }", "go");
  assert.match(html, /<span class="tok-kw">func<\/span>/);
  assert.match(html, /<span class="tok-kw">return<\/span>/);
});

test("highlights capitalized identifiers as types, not keywords", () => {
  const html = highlight("var w Walker", "go");
  assert.match(html, /<span class="tok-type">Walker<\/span>/);
  assert.ok(!html.includes('<span class="tok-kw">Walker</span>'));
});

test("leaves lowercase, non-keyword identifiers unwrapped", () => {
  const html = highlight("walkerName := 1", "go");
  assert.ok(html.includes("walkerName"));
  assert.ok(!html.includes('<span class="tok-kw">walkerName</span>'));
  assert.ok(!html.includes('<span class="tok-type">walkerName</span>'));
});

test("highlights numeric literals", () => {
  const html = highlight("price := 1800", "go");
  assert.match(html, /<span class="tok-num">1800<\/span>/);
});

test("HTML-escapes special characters inside highlighted strings", () => {
  const html = highlight('s := "a<b&c"', "go");
  assert.match(html, /<span class="tok-str">"a&lt;b&amp;c"<\/span>/);
});

test("unknown languages fall back to the swift table (existing behavior unaffected by adding go)", () => {
  const html = highlight("func main() {}", "not-a-real-lang");
  assert.match(html, /<span class="tok-kw">func<\/span>/);
});

test("go and swift tokenize a shared snippet consistently for common keywords", () => {
  const src = "func main() { return }";
  const goHtml = highlight(src, "go");
  const swiftHtml = highlight(src, "swift");
  assert.match(goHtml, /<span class="tok-kw">func<\/span>/);
  assert.match(swiftHtml, /<span class="tok-kw">func<\/span>/);
});