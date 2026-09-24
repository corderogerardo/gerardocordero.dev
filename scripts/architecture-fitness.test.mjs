import assert from "node:assert/strict";
import test from "node:test";

import { validateWorkspaceDependencies } from "./architecture-fitness.mjs";

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
