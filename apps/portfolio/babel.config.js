/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Reanimated 4 moved its Babel plugin into react-native-worklets, and
    // babel-preset-expo auto-adds `react-native-worklets/plugin` when that
    // package is installed. Registering it here too would apply it twice.
  };
};
