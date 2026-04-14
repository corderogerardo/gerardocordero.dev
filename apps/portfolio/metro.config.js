// Learn more: https://docs.expo.dev/guides/monorepos/
const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");
const { withNativeWind } = require("nativewind/metro");

const config = withTurborepoManagedCache(
  withMonorepoPaths(
    withNativeWind(getDefaultConfig(__dirname), {
      input: "./global.css",
      inlineRem: 16,
    })
  )
);

// Inject a SharedArrayBuffer shim into the bundle prelude. Hermes on
// RN 0.81 does not expose SharedArrayBuffer as a global, and modules
// like webidl-conversions (pulled in via expo/winter -> whatwg-url)
// reference it at top-level evaluation time. Polyfills are bundled
// before InitializeCore and before any __r() call, so this runs in
// time to save us. See apps/portfolio/polyfills/shared-array-buffer.js
// for the full explanation.
const upstreamGetPolyfills = config.serializer.getPolyfills;
config.serializer.getPolyfills = (options) => [
  ...upstreamGetPolyfills(options),
  require.resolve("./polyfills/shared-array-buffer.js"),
];

module.exports = config;

function withMonorepoPaths(config) {
  const projectRoot = __dirname;
  const workspaceRoot = path.resolve(projectRoot, "../..");

  config.watchFolders = [workspaceRoot];

  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ];

  config.resolver.disableHierarchicalLookup = true;

  return config;
}

function withTurborepoManagedCache(config) {
  config.cacheStores = [
    new FileStore({
      root: path.join(__dirname, "node_modules/.cache/metro"),
    }),
  ];
  return config;
}
