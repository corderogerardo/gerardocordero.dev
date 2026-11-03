#!/usr/bin/env node
/**
 * Verifies that `expo prebuild` produced the native permission surface that
 * `app.config.ts` declares.
 *
 * Why this exists: `app.config.ts` is a promise. Prebuild is what turns it into an
 * Info.plist and an AndroidManifest, and the OS silently ignores a capability whose
 * permission is missing — background sync that never wakes, a camera that never
 * opens. The failure looks like a bug in the app, three days later, on one platform.
 *
 * Usage:
 *   node scripts/verify-native-config.mjs              # verify what exists, skip what does not
 *   node scripts/verify-native-config.mjs --require    # fail if a native project is absent (local gate)
 *   node scripts/verify-native-config.mjs --platform ios
 *
 * CI has no `ios/` or `android/` because they are generated and gitignored, so the
 * default behaviour is to skip, not to fail. `--require` is for a machine that just
 * ran prebuild and wants proof.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Strings and arrays the app cannot work without on iOS. */
const EXPECTED_IOS_STRINGS = [
  "NSLocationWhenInUseUsageDescription",
  "NSLocationAlwaysAndWhenInUseUsageDescription",
  "NSCameraUsageDescription",
  "NSPhotoLibraryUsageDescription",
];
const EXPECTED_IOS_BACKGROUND_MODES = ["location", "fetch", "processing"];

/** Permissions declared in `app.config.ts` that must survive the manifest merge. */
const EXPECTED_ANDROID_PERMISSIONS = [
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_BACKGROUND_LOCATION",
  "android.permission.CAMERA",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.RECEIVE_BOOT_COMPLETED",
  "android.permission.WAKE_LOCK",
];

/** Permissions a library adds but this app never uses. */
const FORBIDDEN_ANDROID_PERMISSIONS = ["android.permission.RECORD_AUDIO"];

const argv = process.argv.slice(2);
const requireNative = argv.includes("--require");
const platformArg = argv[argv.indexOf("--platform") + 1];
const platforms = argv.includes("--platform") ? [platformArg] : ["ios", "android"];

const failures = [];
const notes = [];

function findPlist() {
  const dir = path.join(ROOT, "ios");
  if (!existsSync(dir)) return null;
  // The scheme name is the app name from app.config.ts ("Knockout").
  const candidate = path.join(dir, "Knockout", "Info.plist");
  return existsSync(candidate) ? candidate : null;
}

function readPlistJson(plistPath) {
  const out = execFileSync("plutil", ["-convert", "json", "-o", "-", plistPath], {
    encoding: "utf8",
  });
  return JSON.parse(out);
}

function verifyIosDeploymentTarget() {
  const podfile = path.join(ROOT, "ios", "Podfile");
  if (!existsSync(podfile)) return "skipped";

  // The plugin exists because Xcode 27 refuses pods below iOS 15. If someone runs
  // prebuild after deleting the plugin, the build fails ten minutes later with a
  // deployment-target error that looks unrelated to their change. Catch it here.
  const contents = execFileSync("cat", [podfile], { encoding: "utf8" });
  if (!contents.includes("withIosDeploymentTarget.js")) {
    failures.push(
      "iOS: Podfile is missing the withIosDeploymentTarget post_install override (was the plugin removed?)",
    );
  }
  return "verified";
}

function verifyIos() {
  const plistPath = findPlist();
  if (!plistPath) return "skipped";
  if (process.platform !== "darwin") {
    notes.push("iOS: skipping plutil checks on a non-darwin host.");
    return "skipped";
  }

  const plist = readPlistJson(plistPath);

  for (const key of EXPECTED_IOS_STRINGS) {
    const value = plist[key];
    if (typeof value !== "string" || value.trim().length === 0) {
      failures.push(`iOS: missing usage description "${key}"`);
    }
  }

  const modes = plist.UIBackgroundModes;
  if (!Array.isArray(modes)) {
    failures.push('iOS: "UIBackgroundModes" is missing entirely');
  } else {
    for (const mode of EXPECTED_IOS_BACKGROUND_MODES) {
      if (!modes.includes(mode)) failures.push(`iOS: UIBackgroundModes is missing "${mode}"`);
    }
  }

  if (plist.CFBundleShortVersionString === undefined) {
    failures.push("iOS: CFBundleShortVersionString is missing");
  }

  return "verified";
}

function verifyAndroid() {
  const manifest = path.join(ROOT, "android", "app", "src", "main", "AndroidManifest.xml");
  if (!existsSync(manifest)) return "skipped";

  const xml = execFileSync("cat", [manifest], { encoding: "utf8" });
  // `blockedPermissions` writes the permission with `tools:node="remove"`, which the
  // manifest merger honours. Treat those as blocked, not granted, or the check would
  // flag the exact entry that removes it.
  const granted = new Set();
  const blocked = new Set();
  for (const [tag] of xml.matchAll(/<uses-permission[^>]*\/>/g)) {
    const name = /android:name="([^"]+)"/.exec(tag)?.[1];
    if (!name) continue;
    if (tag.includes('tools:node="remove"')) blocked.add(name);
    else granted.add(name);
  }

  for (const permission of EXPECTED_ANDROID_PERMISSIONS) {
    if (!granted.has(permission)) {
      failures.push(`Android: manifest is missing ${permission}`);
    }
  }
  for (const permission of FORBIDDEN_ANDROID_PERMISSIONS) {
    if (granted.has(permission)) {
      failures.push(`Android: manifest asks for ${permission}, which this app never uses`);
    } else if (!blocked.has(permission)) {
      failures.push(`Android: ${permission} is neither granted nor explicitly blocked`);
    }
  }

  return "verified";
}

const results = {};
for (const platform of platforms) {
  if (platform === "ios") {
    results.ios = verifyIos();
    results["ios-pods"] = verifyIosDeploymentTarget();
  }
  else if (platform === "android") results.android = verifyAndroid();
  else {
    console.error(`Unknown platform "${platform}". Use ios, android, or omit.`);
    process.exit(2);
  }
}

console.log("Native config verification");
for (const [platform, result] of Object.entries(results)) {
  console.log(`  ${platform.padEnd(8)} ${result}`);
}
for (const note of notes) console.log(`  note: ${note}`);

if (failures.length > 0) {
  console.error("\nFailures:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

const anySkipped = Object.values(results).includes("skipped");
if (anySkipped && requireNative) {
  console.error("\n--require was passed but a native project is missing. Run `npx expo prebuild` first.");
  process.exit(1);
}

console.log("\nAll declared permissions are present.");
