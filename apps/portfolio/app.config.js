// Dynamic Expo config: extends app.json and injects build metadata into `extra`
// so the app can display exactly what is running (see src/version.ts).
//
// EAS sets EAS_BUILD_GIT_COMMIT_HASH + EAS_BUILD_PROFILE during cloud builds;
// for local builds we shell out to git. app.json stays the source of truth for
// everything else (incl. the marketing `version` and extra.eas.projectId).
const { execSync } = require("node:child_process");

function gitCommitHash() {
  const fromEas = process.env.EAS_BUILD_GIT_COMMIT_HASH;
  if (fromEas) return fromEas.slice(0, 7);
  try {
    return execSync("git rev-parse --short=7 HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra ?? {}),
    gitCommitHash: gitCommitHash(),
    buildProfile: process.env.EAS_BUILD_PROFILE ?? "local",
  },
});
