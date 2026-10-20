import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dependencyFields = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

// Directories never scanned for violation impact: installed dependencies and
// generated build outputs. Kept dependency-free per ADR-0001 (Node.js
// builtins only).
const skippedImpactDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);

// Only file types that can statically reference a workspace package name.
const scannedImpactExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

const maxImpactFiles = 10;
const maxImpactFileBytes = 1024 * 1024;

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

// Bounded static grep: lists the files inside a source package directory that
// reference a forbidden target package name. Returns display paths relative
// to the package directory, sorted, capped at maxFiles, plus the total match
// count so callers can report truncation ("first 10 files + count").
export async function findImportingFiles(packageDirectory, targetName, options = {}) {
  const cappedFiles = options.maxFiles ?? maxImpactFiles;
  const matches = [];

  async function walk(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries
      .slice()
      .sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0))) {
      if (entry.isSymbolicLink()) continue;
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (skippedImpactDirectories.has(entry.name)) continue;
        await walk(entryPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (!scannedImpactExtensions.has(path.extname(entry.name))) continue;

      let fileStat;
      try {
        fileStat = await stat(entryPath);
      } catch {
        continue;
      }
      if (fileStat.size > maxImpactFileBytes) continue;

      let contents;
      try {
        contents = await readFile(entryPath, "utf8");
      } catch {
        continue;
      }
      if (contents.includes(targetName)) {
        matches.push(path.relative(packageDirectory, entryPath));
      }
    }
  }

  try {
    await walk(packageDirectory);
  } catch {
    return { files: [], totalCount: 0 };
  }

  matches.sort();
  return { files: matches.slice(0, cappedFiles), totalCount: matches.length };
}

// Additive report lines for one violation. The existing
// "Forbidden dependency: ..." line is untouched; these lines only append.
export function formatImpactLines({ sourceDirectory, target, files, totalCount }) {
  if (totalCount === 0) {
    return [`  Impact: no files in ${sourceDirectory} import ${target}`];
  }

  const lines = [`  Impact: ${totalCount} file(s) in ${sourceDirectory} import ${target}:`];
  for (const file of files) {
    lines.push(`    - ${file}`);
  }
  if (totalCount > files.length) {
    lines.push(`    ... and ${totalCount - files.length} more`);
  }
  return lines;
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

      workspacePackages.push({ ...manifest, group, directory: path.join(group, child.name) });
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

    const sourcePackage = workspacePackages.find(
      (workspacePackage) => workspacePackage.name === violation.source,
    );
    if (sourcePackage?.directory) {
      const impact = await findImportingFiles(
        path.join(rootDirectory, sourcePackage.directory),
        violation.target,
      );
      for (const line of formatImpactLines({
        sourceDirectory: sourcePackage.directory,
        target: violation.target,
        files: impact.files,
        totalCount: impact.totalCount,
      })) {
        console.error(line);
      }
    }
  }

  if (result.violationCount > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runAudit().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
