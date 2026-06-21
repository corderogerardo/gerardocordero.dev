import * as Application from "expo-application";
import Constants from "expo-constants";

/**
 * Human-readable identity of the running build, e.g. "v1.0.0 (7) · a1b2c3d".
 *
 * - version: marketing version (app.json `expo.version`) via expo-constants.
 * - build:   native build number — iOS buildNumber / Android versionCode —
 *            via expo-application. Only present in a real native build (EAS or
 *            `expo run:*`); undefined in Expo Go / web, where it's omitted.
 * - sha:     short git commit injected at build time by app.config.js into
 *            `extra.gitCommitHash` (EAS_BUILD_GIT_COMMIT_HASH on EAS, local git
 *            otherwise). Omitted when it resolves to "dev".
 */
export function versionInfo(): {
  version: string;
  build: string | null;
  sha: string | null;
} {
  const extra = Constants.expoConfig?.extra as
    | { gitCommitHash?: string }
    | undefined;
  // expo-application reads native modules absent in Expo Go / web (or a build
  // made before it was added) — guard so the version line never crashes.
  const safe = <T>(fn: () => T): T | null => {
    try {
      return fn();
    } catch {
      return null;
    }
  };
  return {
    version:
      Constants.expoConfig?.version ??
      safe(() => Application.nativeApplicationVersion) ??
      "0.0.0",
    build: safe(() => Application.nativeBuildVersion),
    sha:
      extra?.gitCommitHash && extra.gitCommitHash !== "dev"
        ? extra.gitCommitHash
        : null,
  };
}

export function versionLabel(): string {
  const { version, build, sha } = versionInfo();
  let label = `v${version}`;
  if (build) label += ` (${build})`;
  if (sha) label += ` · ${sha}`;
  return label;
}
