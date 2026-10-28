import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  evaluateWorkspace,
  findImportingFiles,
  formatImpactLines,
  validateWorkspaceDependencies,
} from "./architecture-fitness.mjs";

const execFileAsync = promisify(execFile);
const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "architecture-fitness.mjs");

test("allows app-to-package and package-to-package edges and counts unique local edges", () => {
  const result = validateWorkspaceDependencies([
    {
      name: "@example/app",
      group: "apps",
      dependencies: { "@example/kit": "workspace:*" },
      devDependencies: { "@example/kit": "workspace:*" },
      peerDependencies: { "@example/ui": "workspace:*" },
      optionalDependencies: { "external-library": "^1.0.0" },
    },
    {
      name: "@example/kit",
      group: "packages",
      optionalDependencies: { "@example/ui": "workspace:*" },
    },
    { name: "@example/ui", group: "packages" },
  ]);

  assert.deepEqual(result, {
    packageCount: 3,
    localEdgeCount: 3,
    allowedEdgeCount: 3,
    violationCount: 0,
    violations: [],
  });
});

test("rejects app-to-app edges", () => {
  const result = validateWorkspaceDependencies([
    {
      name: "@example/app-a",
      group: "apps",
      dependencies: { "@example/app-b": "workspace:*" },
    },
    { name: "@example/app-b", group: "apps" },
  ]);

  assert.equal(result.localEdgeCount, 1);
  assert.equal(result.allowedEdgeCount, 0);
  assert.equal(result.violationCount, 1);
  assert.deepEqual(result.violations, [
    {
      source: "@example/app-a",
      target: "@example/app-b",
      direction: "apps -> apps",
    },
  ]);
});

test("rejects package-to-app edges", () => {
  const result = validateWorkspaceDependencies([
    {
      name: "@example/shared",
      group: "packages",
      peerDependencies: { "@example/app": "workspace:*" },
    },
    { name: "@example/app", group: "apps" },
  ]);

  assert.equal(result.localEdgeCount, 1);
  assert.equal(result.allowedEdgeCount, 0);
  assert.equal(result.violationCount, 1);
  assert.deepEqual(result.violations, [
    {
      source: "@example/shared",
      target: "@example/app",
      direction: "packages -> apps",
    },
  ]);
});

test("violation impact names at least one importing file", async () => {
  const packageDirectory = await mkdtemp(path.join(tmpdir(), "fitness-impact-"));
  await mkdir(path.join(packageDirectory, "src"), { recursive: true });
  await writeFile(
    path.join(packageDirectory, "src", "index.ts"),
    `import { shared } from "@example/app-b";\n`,
  );
  await writeFile(
    path.join(packageDirectory, "src", "clean.ts"),
    `export const value = 1;\n`,
  );

  const impact = await findImportingFiles(packageDirectory, "@example/app-b");

  assert.equal(impact.totalCount, 1);
  assert.deepEqual(impact.files, [path.join("src", "index.ts")]);
});

test("clean package reports no importing files", async () => {
  const packageDirectory = await mkdtemp(path.join(tmpdir(), "fitness-clean-"));
  await writeFile(
    path.join(packageDirectory, "index.ts"),
    `export const value = 1;\n`,
  );

  const impact = await findImportingFiles(packageDirectory, "@example/app-b");

  assert.equal(impact.totalCount, 0);
  assert.deepEqual(impact.files, []);
});

test("violation impact skips node_modules and build outputs", async () => {
  const packageDirectory = await mkdtemp(path.join(tmpdir(), "fitness-skip-"));
  await mkdir(path.join(packageDirectory, "node_modules", "dep"), { recursive: true });
  await mkdir(path.join(packageDirectory, ".next", "static"), { recursive: true });
  await writeFile(
    path.join(packageDirectory, "node_modules", "dep", "index.js"),
    `require("@example/app-b");\n`,
  );
  await writeFile(
    path.join(packageDirectory, ".next", "static", "bundle.js"),
    `import "@example/app-b";\n`,
  );
  await writeFile(
    path.join(packageDirectory, "app.ts"),
    `import "@example/app-b";\n`,
  );

  const impact = await findImportingFiles(packageDirectory, "@example/app-b");

  assert.equal(impact.totalCount, 1);
  assert.deepEqual(impact.files, ["app.ts"]);
});

test("violation impact caps files and reports the remaining count", async () => {
  const packageDirectory = await mkdtemp(path.join(tmpdir(), "fitness-cap-"));
  for (let index = 0; index < 12; index += 1) {
    await writeFile(
      path.join(packageDirectory, `file-${String(index).padStart(2, "0")}.ts`),
      `import "@example/app-b";\n`,
    );
  }

  const impact = await findImportingFiles(packageDirectory, "@example/app-b", {
    maxFiles: 10,
  });
  const lines = formatImpactLines({
    sourceDirectory: "apps/example",
    target: "@example/app-b",
    files: impact.files,
    totalCount: impact.totalCount,
  });

  assert.equal(impact.totalCount, 12);
  assert.equal(impact.files.length, 10);
  assert.ok(lines[0].includes("12 file(s)"));
  assert.ok(lines.some((line) => line.includes(path.join("file-00.ts"))));
  assert.ok(lines.some((line) => line.includes("... and 2 more")));
});

test("clean impact formats as a none line without file entries", () => {
  const lines = formatImpactLines({
    sourceDirectory: "apps/example",
    target: "@example/app-b",
    files: [],
    totalCount: 0,
  });

  assert.deepEqual(lines, ["  Impact: no files in apps/example import @example/app-b"]);
});

test("evaluateWorkspace inventories real manifests and assigns groups", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "fitness-workspace-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(path.join(root, "apps", "my-app"), { recursive: true });
  await mkdir(path.join(root, "packages", "my-kit"), { recursive: true });
  await writeFile(
    path.join(root, "apps", "my-app", "package.json"),
    JSON.stringify({ name: "@example/my-app", version: "1.0.0" }),
  );
  await writeFile(
    path.join(root, "packages", "my-kit", "package.json"),
    JSON.stringify({ name: "@example/my-kit", version: "1.0.0" }),
  );

  const report = await evaluateWorkspace(root);

  assert.equal(report.root, path.resolve(root));
  assert.equal(report.packageCount, 2);
  assert.deepEqual(report.packages, [
    { name: "@example/my-app", group: "apps", directory: path.join("apps", "my-app") },
    { name: "@example/my-kit", group: "packages", directory: path.join("packages", "my-kit") },
  ]);
  assert.equal(report.localEdgeCount, 0);
  assert.equal(report.allowedEdgeCount, 0);
  assert.equal(report.violationCount, 0);
  assert.deepEqual(report.violations, []);
});

test("evaluateWorkspace reports violations from real temp manifests", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "fitness-violation-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(path.join(root, "apps", "app-a"), { recursive: true });
  await mkdir(path.join(root, "apps", "app-b"), { recursive: true });
  await mkdir(path.join(root, "packages", "kit"), { recursive: true });
  await writeFile(
    path.join(root, "apps", "app-a", "package.json"),
    JSON.stringify({ name: "@example/app-a", dependencies: { "@example/app-b": "workspace:*" } }),
  );
  await writeFile(
    path.join(root, "apps", "app-b", "package.json"),
    JSON.stringify({ name: "@example/app-b" }),
  );
  await writeFile(
    path.join(root, "packages", "kit", "package.json"),
    JSON.stringify({ name: "@example/kit", dependencies: { "@example/app-a": "workspace:*" } }),
  );

  const report = await evaluateWorkspace(root);

  assert.equal(report.packageCount, 3);
  assert.equal(report.localEdgeCount, 2);
  assert.equal(report.allowedEdgeCount, 0);
  assert.equal(report.violationCount, 2);
  assert.deepEqual(report.violations, [
    { source: "@example/app-a", target: "@example/app-b", direction: "apps -> apps" },
    { source: "@example/kit", target: "@example/app-a", direction: "packages -> apps" },
  ]);
});

async function runCliFixture(root) {
  const args = [scriptPath];
  if (root !== undefined) args.push(root);
  let stdout = "";
  let stderr = "";
  let code = 0;
  try {
    const result = await execFileAsync(process.execPath, args, { encoding: "utf8" });
    if (Array.isArray(result)) {
      [stdout, stderr] = result;
    } else {
      stdout = result.stdout ?? "";
      stderr = result.stderr ?? "";
    }
  } catch (error) {
    stdout = error.stdout ?? "";
    stderr = error.stderr ?? "";
    code = error.code ?? 1;
  }
  return { stdout, stderr, code };
}

test("CLI inventory reports counts and violation output for a temp root", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "fitness-cli-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(path.join(root, "apps", "app-a"), { recursive: true });
  await mkdir(path.join(root, "apps", "app-b"), { recursive: true });
  await writeFile(
    path.join(root, "apps", "app-a", "package.json"),
    JSON.stringify({ name: "@example/app-a", dependencies: { "@example/app-b": "workspace:*" } }),
  );
  await writeFile(
    path.join(root, "apps", "app-b", "package.json"),
    JSON.stringify({ name: "@example/app-b" }),
  );

  const outcome = await runCliFixture(root);

  assert.equal(outcome.code, 1);
  assert.ok(outcome.stdout.includes("Architecture fitness check"));
  assert.ok(outcome.stdout.includes("Workspace packages: 2"));
  assert.ok(outcome.stdout.includes("Declared local workspace edges: 1"));
  assert.ok(outcome.stdout.includes("Allowed edges: 0"));
  assert.ok(outcome.stdout.includes("Violations: 1"));
  assert.ok(outcome.stderr.includes("Forbidden dependency: @example/app-a -> @example/app-b (apps -> apps)"));
  assert.ok(outcome.stderr.includes("  Impact: 1 file(s) in apps/app-a import @example/app-b:"));
  assert.ok(outcome.stderr.includes("    - package.json"));
});

test("CLI inventory on a clean temp root exits zero", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "fitness-cli-clean-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(path.join(root, "packages", "kit"), { recursive: true });
  await writeFile(
    path.join(root, "packages", "kit", "package.json"),
    JSON.stringify({ name: "@example/kit" }),
  );

  const outcome = await runCliFixture(root);

  assert.equal(outcome.code, 0);
  assert.ok(outcome.stdout.includes("Workspace packages: 1"));
  assert.ok(outcome.stdout.includes("Violations: 0"));
  assert.equal(outcome.stderr, "");
});

test("CLI with no root argument still audits the repository root", async () => {
  const outcome = await runCliFixture();

  assert.equal(outcome.code, 0);
  assert.ok(outcome.stdout.includes("Architecture fitness check"));
  assert.ok(outcome.stdout.includes("Workspace packages: 13"));
  assert.ok(outcome.stdout.includes("Declared local workspace edges: 9"));
  assert.ok(outcome.stdout.includes("Allowed edges: 9"));
  assert.ok(outcome.stdout.includes("Violations: 0"));
  assert.equal(outcome.stderr, "");
});
