// Learn more: https://docs.expo.dev/guides/monorepos/
const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");
const { withNativeWind } = require("nativewind/metro");

module.exports = withTurborepoManagedCache(
  withMonorepoPaths(
    withNativeWind(getDefaultConfig(__dirname), {
      input: "./global.css",
      inlineRem: 16,
    })
  )
);

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
