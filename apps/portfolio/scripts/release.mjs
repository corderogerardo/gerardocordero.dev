#!/usr/bin/env node
// Cut a release: bump the marketing version in app.json, commit, and create an
// annotated git tag vX.Y.Z. Build numbers are NOT touched here — EAS owns those
// (appVersionSource: remote + autoIncrement).
//
//   node scripts/release.mjs <patch|minor|major|X.Y.Z> [--push]
//
// Pushing the v* tag triggers .github/workflows/release.yml (GitHub Release; plus
// an EAS production build if RELEASE_BUILDS=true + EXPO_TOKEN are configured).
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const appJsonPath = join(appDir, "app.json");
const git = (cmd) =>
  execSync(`git ${cmd}`, { cwd: appDir, stdio: "pipe" }).toString().trim();
const gitIO = (cmd) => execSync(`git ${cmd}`, { cwd: appDir, stdio: "inherit" });

const bump = process.argv[2];
const push = process.argv.includes("--push");
if (!bump) {
  console.error(
    "usage: node scripts/release.mjs <patch|minor|major|X.Y.Z> [--push]",
  );
  process.exit(1);
}

// Require a clean tree — the script's app.json bump should be the only change.
if (git("status --porcelain")) {
  console.error("✖ working tree is dirty — commit or stash changes first.");
  process.exit(1);
}

const app = JSON.parse(readFileSync(appJsonPath, "utf8"));
const current = app.expo.version;
const [maj, min, pat] = current.split(".").map(Number);
const next =
  bump === "major"
    ? `${maj + 1}.0.0`
    : bump === "minor"
      ? `${maj}.${min + 1}.0`
      : bump === "patch"
        ? `${maj}.${min}.${pat + 1}`
        : /^\d+\.\d+\.\d+$/.test(bump)
          ? bump
          : null;
if (!next) {
  console.error(`✖ invalid version: ${bump} (use patch|minor|major|X.Y.Z)`);
  process.exit(1);
}
const tag = `v${next}`;

app.expo.version = next;
writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + "\n");
console.log(`app.json version ${current} → ${next}`);

gitIO("add app.json");
gitIO(`commit -m "release ${tag}"`);
gitIO(`tag -a ${tag} -m "${tag}"`);
console.log(`✓ committed + tagged ${tag}`);

if (push) {
  gitIO("push origin HEAD --follow-tags");
  console.log(`✓ pushed branch + ${tag}`);
} else {
  console.log("\nnext:");
  console.log("  git push origin HEAD --follow-tags   # pushes the commit + tag");
  console.log("  # the v* tag triggers the Release workflow on GitHub");
}
