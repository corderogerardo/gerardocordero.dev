import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules/**", "coverage/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // The package must stay framework-free. Anything importing react,
      // react-native, expo, or @supabase here is a design regression.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "sync-core must stay framework-free." },
            { name: "react-native", message: "sync-core must stay framework-free." },
          ],
          patterns: ["expo", "expo-*", "@supabase/*", "react-native-*"],
        },
      ],
    },
  },
);
