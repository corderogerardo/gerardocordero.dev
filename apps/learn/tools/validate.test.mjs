// Tests for tools/validate.mjs, focused on the Go course support added in this
// PR: the new "lessons-go" entry in ALL_DIRS/KNOWN_LANGS, and the schema /
// solvability rules the validator enforces against fixture Go modules.
//
// Zero dependencies, matching the rest of apps/learn — run with:
//   node --test apps/learn/tools/validate.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

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