import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dependencyFields = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

export function validateWorkspaceDependencies(workspacePackages) {
  const packagesByName = new Map();
  for (const workspacePackage of workspacePackages) {
    if (packagesByName.has(workspacePackage.name)) {
      throw new Error(`Duplicate workspace package name: ${workspacePackage.name}`);
    }
    packagesByName.set(workspacePackage.name, workspacePackage);
  }

  const uniqueEdges = new Map();
  for (const source of workspacePackages) {
    for (const field of dependencyFields) {
      for (const targetName of Object.keys(source[field] ?? {})) {
        if (!packagesByName.has(targetName)) continue;
        uniqueEdges.set(`${source.name}\0${targetName}`, {
          source: source.name,
          target: targetName,
        });
      }
    }
  }

  const edges = [...uniqueEdges.values()].sort(
    (left, right) =>
      (left.source < right.source ? -1 : left.source > right.source ? 1 : 0) ||
      (left.target < right.target ? -1 : left.target > right.target ? 1 : 0),
  );
  const violations = edges.flatMap((edge) => {
    const source = packagesByName.get(edge.source);
    const target = packagesByName.get(edge.target);
    const direction = `${source.group} -> ${target.group}`;
    const allowed =
      (source.group === "apps" && target.group === "packages") ||
      (source.group === "packages" && target.group === "packages");

    return allowed ? [] : [{ ...edge, direction }];
  });

  return {
    packageCount: workspacePackages.length,
    localEdgeCount: edges.length,
    allowedEdgeCount: edges.length - violations.length,
    violationCount: violations.length,
    violations,
  };
}

async function inventoryWorkspacePackages(rootDirectory) {
  const workspacePackages = [];

  for (const group of ["apps", "packages"]) {
    const groupDirectory = path.join(rootDirectory, group);
    const children = await readdir(groupDirectory, { withFileTypes: true });

    for (const child of children
      .filter((entry) => entry.isDirectory())
      .sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0))) {
      const manifestPath = path.join(groupDirectory, child.name, "package.json");
      let manifestContents;
      try {
        manifestContents = await readFile(manifestPath, "utf8");
      } catch (error) {
        if (error.code === "ENOENT") continue;
        throw error;
      }

      const manifest = JSON.parse(manifestContents);
      if (typeof manifest.name !== "string" || manifest.name.length === 0) {
        throw new Error(`Workspace manifest has no package name: ${manifestPath}`);
      }

      workspacePackages.push({ ...manifest, group });
    }
  }

  return workspacePackages;
}

async function runAudit() {
  const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const workspacePackages = await inventoryWorkspacePackages(rootDirectory);
  const result = validateWorkspaceDependencies(workspacePackages);

  console.log("Architecture fitness check");
  console.log(`Workspace packages: ${result.packageCount}`);
  console.log(`Declared local workspace edges: ${result.localEdgeCount}`);
  console.log(`Allowed edges: ${result.allowedEdgeCount}`);
  console.log(`Violations: ${result.violationCount}`);

  for (const violation of result.violations) {
    console.error(
      `Forbidden dependency: ${violation.source} -> ${violation.target} (${violation.direction})`,
    );
  }

  if (result.violationCount > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runAudit().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
