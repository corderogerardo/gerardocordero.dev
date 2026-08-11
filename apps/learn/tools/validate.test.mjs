// Tests for tools/validate.mjs: the lesson schema/solvability rules (Go-course
// era) and the Phase 0 token-parity guard for the unified styles.css namespace.
//
// Zero dependencies, matching the rest of apps/learn — run with:
//   node --test apps/learn/tools/validate.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { validateTokenParity } from "./validate.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const LEARN_ROOT = join(here, ".."); // apps/learn
const VALIDATE_SCRIPT = join(here, "validate.mjs");

function runValidate(args) {
  return spawnSync(process.execPath, [VALIDATE_SCRIPT, ...args], {
    encoding: "utf8",
    cwd: LEARN_ROOT,
  });
}

// Fixtures must live directly under apps/learn (validate.mjs resolves `dir`
// relative to its own file location, not the process cwd), so temp dirs are
// created there and torn down after each test, pass or fail.
function withFixtureDir(files, fn) {
  const dir = mkdtempSync(join(LEARN_ROOT, ".tmp-validate-fixture-"));
  try {
    for (const [name, content] of Object.entries(files)) {
      writeFileSync(join(dir, name), content, "utf8");
    }
    return fn(basename(dir));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---------- Real lessons-go content ----------

test("validates the real lessons-go directory with zero errors", () => {
  const res = runValidate(["lessons-go"]);
  assert.equal(res.status, 0, `expected success, stderr:\n${res.stderr}`);
  // Counts stay flexible as content grows, but "Checked 0 files" must not pass:
  // a typo'd path or an empty dir would otherwise be a green run.
  const checked = res.stdout.match(/Checked (\d+) files: \d+ modules, \d+ lessons, \d+ steps/);
  assert.ok(checked && Number(checked[1]) > 0, `expected a positive file count, got:\n${res.stdout}`);
  assert.match(res.stdout, /✓ All lesson files valid\./);
  assert.equal(res.stderr, "");
});

test("running with no argument validates all five course directories, including lessons-go", () => {
  const res = runValidate([]);
  assert.equal(res.status, 0, `expected success, stderr:\n${res.stderr}`);
  assert.match(res.stdout, /=== lessons ===/);
  assert.match(res.stdout, /=== lessons-android ===/);
  assert.match(res.stdout, /=== lessons-ruby ===/);
  assert.match(res.stdout, /=== lessons-python ===/);
  assert.match(res.stdout, /=== lessons-go ===/);
});

// ---------- Fixture-based schema/solvability checks, using lang: "go" ----------

test("accepts a well-formed go fixture module", () => {
  const src = String.raw`window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "fixture-go-valid",
  title: "Fixture Go Valid",
  lang: "go",
  lessons: [
    {
      id: "lesson-one",
      title: "Lesson One",
      steps: [
        { type: "text", md: ["## Hello Go"] },
        {
          type: "exercise",
          title: "Greet",
          prompt: ["Print a greeting with fmt.Println."],
          starter: "package main\n\nfunc main() {\n\t// your code here\n}",
          solution: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"hi\")\n}",
          checks: [{ re: /fmt\.Println\("hi"\)/, hint: "call fmt.Println with hi" }],
          mustNot: [{ re: /fmt\.Print\("hi"\)/, hint: "use Println, not Print" }],
        },
      ],
    },
  ],
});
`;
  withFixtureDir({ "00-fixture.js": src }, (dir) => {
    const res = runValidate([dir]);
    assert.equal(res.status, 0, `expected success, stderr:\n${res.stderr}`);
    assert.match(res.stdout, /Checked 1 files: 1 modules, 1 lessons, 2 steps \(1 exercises, 0 quizzes\)/);
    assert.match(res.stdout, /✓ All lesson files valid\./);
  });
});

test("rejects an unknown module lang", () => {
  const src = String.raw`window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "fixture-go-bad-lang",
  title: "Fixture",
  lang: "golang",
  lessons: [
    {
      id: "lesson-one",
      title: "Lesson One",
      steps: [
        { type: "quiz", q: "Pick one", choices: ["a", "b"], answer: 0 },
      ],
    },
  ],
});
`;
  withFixtureDir({ "00-fixture.js": src }, (dir) => {
    const res = runValidate([dir]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /module\.lang "golang" must be one of/);
  });
});

test("rejects a lesson that ends on a text step", () => {
  const src = String.raw`window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "fixture-go-ends-text",
  title: "Fixture",
  lang: "go",
  lessons: [
    {
      id: "lesson-one",
      title: "Lesson One",
      steps: [
        { type: "text", md: ["## Only a text step"] },
      ],
    },
  ],
});
`;
  withFixtureDir({ "00-fixture.js": src }, (dir) => {
    const res = runValidate([dir]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /ends with a text step — end on a quiz, exercise, or xcode step/);
  });
});

test("rejects an exercise whose solution fails its own check", () => {
  const src = String.raw`window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "fixture-go-bad-solution",
  title: "Fixture",
  lang: "go",
  lessons: [
    {
      id: "lesson-one",
      title: "Lesson One",
      steps: [
        {
          type: "exercise",
          title: "Greet",
          prompt: ["Print a greeting."],
          starter: "package main\n\nfunc main() {\n\t// your code here\n}",
          solution: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"hi\")\n}",
          checks: [{ re: /fmt\.Println\("bye"\)/, hint: "this can never match \"hi\"" }],
        },
      ],
    },
  ],
});
`;
  withFixtureDir({ "00-fixture.js": src }, (dir) => {
    const res = runValidate([dir]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /SOLUTION FAILS ITS OWN CHECK/);
  });
});

test("rejects a mustNot rule that matches the solution", () => {
  const src = String.raw`window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "fixture-go-mustnot",
  title: "Fixture",
  lang: "go",
  lessons: [
    {
      id: "lesson-one",
      title: "Lesson One",
      steps: [
        {
          type: "exercise",
          title: "Greet",
          prompt: ["Print a greeting."],
          starter: "package main\n\nfunc main() {\n\t// your code here\n}",
          solution: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"hi\")\n}",
          checks: [{ re: /fmt\.Println\("hi"\)/, hint: "call fmt.Println" }],
          mustNot: [{ re: /fmt\.Println\(/, hint: "this always matches its own solution" }],
        },
      ],
    },
  ],
});
`;
  withFixtureDir({ "00-fixture.js": src }, (dir) => {
    const res = runValidate([dir]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /solution MATCHES forbidden pattern/);
  });
});

test("rejects an exercise whose starter already passes all checks", () => {
  const src = String.raw`window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "fixture-go-noop-exercise",
  title: "Fixture",
  lang: "go",
  lessons: [
    {
      id: "lesson-one",
      title: "Lesson One",
      steps: [
        {
          type: "exercise",
          title: "Greet",
          prompt: ["Print a greeting."],
          starter: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"hi\")\n}",
          solution: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"hi\")\n}",
          checks: [{ re: /fmt\.Println\("hi"\)/, hint: "call fmt.Println" }],
        },
      ],
    },
  ],
});
`;
  withFixtureDir({ "00-fixture.js": src }, (dir) => {
    const res = runValidate([dir]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /the STARTER already passes all checks — nothing to do/);
  });
});

test("rejects duplicate module ids across files in the same directory", () => {
  const src = String.raw`window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "fixture-go-dup",
  title: "Fixture",
  lang: "go",
  lessons: [
    {
      id: "lesson-one",
      title: "Lesson One",
      steps: [
        { type: "quiz", q: "Pick one", choices: ["a", "b"], answer: 0 },
      ],
    },
  ],
});
`;
  withFixtureDir({ "00-fixture.js": src, "01-fixture-dup.js": src }, (dir) => {
    const res = runValidate([dir]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /duplicate module id fixture-go-dup/);
  });
});

test("rejects a quiz with an out-of-range answer index", () => {
  const src = String.raw`window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "fixture-go-bad-quiz",
  title: "Fixture",
  lang: "go",
  lessons: [
    {
      id: "lesson-one",
      title: "Lesson One",
      steps: [
        { type: "quiz", q: "Which loop keyword does Go have?", choices: ["for", "while"], answer: 5 },
      ],
    },
  ],
});
`;
  withFixtureDir({ "00-fixture.js": src }, (dir) => {
    const res = runValidate([dir]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /quiz\.answer out of range/);
  });
});

test("rejects a module that does not push exactly one course entry", () => {
  const src = "window.COURSE = window.COURSE || [];\n// no push at all\n";
  withFixtureDir({ "00-fixture.js": src }, (dir) => {
    const res = runValidate([dir]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /must push exactly 1 module \(pushed 0\)/);
  });
});

test("go-lang solutions strip // comments the same way Swift/Kotlin do (C-style normalization)", () => {
  const src = String.raw`window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "fixture-go-comment-strip",
  title: "Fixture",
  lang: "go",
  lessons: [
    {
      id: "lesson-one",
      title: "Lesson One",
      steps: [
        {
          type: "exercise",
          title: "Comment stripping",
          prompt: ["Return the price."],
          starter: "package main\n\n// your code here\n",
          solution: "package main\n\n// a helpful comment that must be stripped\nfunc price() int {\n\treturn 1800\n}",
          checks: [{ re: /func price\(\)int\{return 1800\}/, hint: "define price() returning 1800" }],
        },
      ],
    },
  ],
});
`;
  withFixtureDir({ "00-fixture.js": src }, (dir) => {
    const res = runValidate([dir]);
    assert.equal(res.status, 0, `expected success, stderr:\n${res.stderr}`);
  });
});

// ---------- Phase 0: unified token namespace parity guard ----------

const STYLES_CSS = join(LEARN_ROOT, "styles.css");

// Builds the 8 declarations (4 steps × hex + -hsl twin) of one course ramp.
function ramp(id, { base, baseHsl, strong, strongHsl, soft, softHsl, on, onHsl }) {
  const decl = (step, hex, hsl) => `--course-${id}-${step}: ${hex}; --course-${id}-${step}-hsl: ${hsl};`;
  return decl("base", base, baseHsl) + decl("strong", strong, strongHsl) +
    decl("soft", soft, softHsl) + decl("on", on, onHsl);
}

// A styles.css-shaped fixture: a :root block plus an optional dark media block.
function cssWith(lightDecls, darkDecls) {
  const dark = darkDecls ? `\n@media (prefers-color-scheme: dark) { :root { ${darkDecls} } }` : "";
  return `:root { ${lightDecls} }${dark}`;
}

const IOS = ramp("ios", {
  base: "#1B6BBB", baseHsl: "210 75% 42%",
  strong: "#16599C", strongHsl: "210 75% 35%",
  soft: "#E7F0F9", softHsl: "210 60% 94%",
  on: "#FFFFFF", onHsl: "0 0% 100%",
});
const IOS_DARK = ramp("ios", {
  base: "#6CADEF", baseHsl: "210 80% 68%",
  strong: "#91C2F3", strongHsl: "210 80% 76%",
  soft: "#152637", softHsl: "210 45% 15%",
  on: "#0E0C17", onHsl: "251 31% 7%",
});
const ANDROID = ramp("android", {
  base: "#188653", baseHsl: "152 70% 31%",
  strong: "#157548", strongHsl: "152 70% 27%",
  soft: "#E7F9F0", softHsl: "152 60% 94%",
  on: "#FFFFFF", onHsl: "0 0% 100%",
});
const ANDROID_DARK = ramp("android", {
  base: "#70EBB1", baseHsl: "152 75% 68%",
  strong: "#94F0C5", strongHsl: "152 75% 76%",
  soft: "#153727", softHsl: "152 40% 15%",
  on: "#0E0C17", onHsl: "251 31% 7%",
});

test("token parity accepts a complete ramp defined in both light and dark", () => {
  assert.doesNotThrow(() => validateTokenParity(cssWith(IOS, IOS_DARK)));
});

test("token parity accepts multiple complete ramps in both modes", () => {
  assert.doesNotThrow(() => validateTokenParity(cssWith(IOS + ANDROID, IOS_DARK + ANDROID_DARK)));
});

test("token parity rejects a course ramp missing entirely from dark mode", () => {
  // Fixture required by Phase 0: the whole ios ramp exists in :root but has no
  // dark counterpart. The per-mode loops would not visit it, so the cross-mode
  // assertion must catch it.
  assert.throws(
    () => validateTokenParity(cssWith(IOS, "")),
    /Parity violation: course ramp "ios" is missing from dark mode/
  );
});

test("token parity rejects a course ramp missing entirely from light mode", () => {
  assert.throws(
    () => validateTokenParity(cssWith("", IOS_DARK)),
    /Parity violation: course ramp "ios" is missing from light mode/
  );
});

test("token parity rejects a missing ramp step in light mode, naming token and mode", () => {
  const partial = IOS.replace("--course-ios-strong: #16599C; --course-ios-strong-hsl: 210 75% 35%;", "");
  assert.throws(
    () => validateTokenParity(cssWith(partial, IOS_DARK)),
    /Parity violation \(light\): --course-ios-strong missing for course ios in :root/
  );
});

test("token parity rejects a missing ramp step in dark mode independently of light", () => {
  // Light is complete; only the dark copy is missing a step. This must fail the
  // dark loop — the guard checks each mode independently, not with an OR.
  const partialDark = IOS_DARK.replace("--course-ios-soft: #152637; --course-ios-soft-hsl: 210 45% 15%;", "");
  assert.throws(
    () => validateTokenParity(cssWith(IOS, partialDark)),
    /Parity violation \(dark\): --course-ios-soft missing for course ios in @media \(prefers-color-scheme: dark\)/
  );
});

test("token parity rejects an orphan -hsl variable with no matching base variable", () => {
  // Spec scenario: Tailwind references --course-new-hsl but the hex base is missing.
  const orphan = "--course-new-base-hsl: 210 75% 42%;";
  assert.throws(
    () => validateTokenParity(cssWith(orphan, "")),
    /Parity violation \(light\): --course-new-base-hsl has no matching base variable --course-new-base/
  );
});

test("CLI exits 1 and names the violation when styles.css fails parity", () => {
  const dir = mkdtempSync(join(LEARN_ROOT, ".tmp-validate-fixture-"));
  try {
    const badCss = join(dir, "bad.css");
    writeFileSync(badCss, cssWith(IOS, ""), "utf8");
    const res = spawnSync(process.execPath, [VALIDATE_SCRIPT], {
      encoding: "utf8",
      cwd: LEARN_ROOT,
      env: { ...process.env, VALIDATE_STYLES_CSS: badCss },
    });
    assert.equal(res.status, 1);
    assert.match(res.stderr, /Parity violation: course ramp "ios" is missing from dark mode/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the real styles.css defines complete course ramps and passes token parity", () => {
  const css = readFileSync(STYLES_CSS, "utf8");
  // 8 courses × 8 declarations (4 steps × hex+hsl) × 2 modes = 128 --course-* decls.
  const courseDecls = css.match(/--course-[a-z0-9-]+:/g) || [];
  assert.ok(courseDecls.length >= 128, `expected ≥128 course token declarations, got ${courseDecls.length}`);
  assert.match(css, /--course-ios-base:/);
  assert.match(css, /--course-expoui-base:/);
  const darkBlock = css.match(/@media \(prefers-color-scheme: dark\) \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(darkBlock, /--course-ios-base:/, "dark media block must contain the ios ramp");
  assert.doesNotThrow(() => validateTokenParity(css));
});

test("the real styles.css defines the Phase 0 type scale, radius, and shadow tokens", () => {
  const css = readFileSync(STYLES_CSS, "utf8");
  assert.match(css, /--text-hero:\s*clamp\(40px,\s*6vw,\s*64px\)/);
  assert.match(css, /--text-page-title:\s*32px/);
  assert.match(css, /--text-section-label:\s*13px/);
  assert.match(css, /--text-section-label-font-family:\s*var\(--mono\)/);
  assert.match(css, /--text-body:\s*16\.5px/);
  assert.match(css, /--text-caption:\s*12\.5px/);
  assert.match(css, /--radius-lg:\s*18px/);
  assert.match(css, /--radius-xl:\s*24px/);
  // Dark shadow tokens with a 5% white tint (design's corrected values).
  assert.match(css, /--shadow-sm-dark:\s*0 1px 2px rgba\(255,\s*255,\s*255,\s*0\.05\)/);
  assert.match(css, /--shadow-md-dark:\s*0 4px 12px rgba\(255,\s*255,\s*255,\s*0\.06\)/);
  assert.match(css, /--ease-rise:/);
  assert.match(css, /--duration-progress:\s*600ms/);
});