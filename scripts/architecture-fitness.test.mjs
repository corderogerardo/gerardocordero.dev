import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  findImportingFiles,
  formatImpactLines,
  validateWorkspaceDependencies,
} from "./architecture-fitness.mjs";

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
