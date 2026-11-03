// Monorepo-aware Metro config. Mirrors apps/portfolio: without watchFolders and
// `disableHierarchicalLookup`, Metro can resolve a second copy of React from the
// hoisted tree and the bundle fails at runtime rather than at build time.
const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");

const config = withTurborepoManagedCache(withMonorepoPaths(getDefaultConfig(__dirname)));

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
