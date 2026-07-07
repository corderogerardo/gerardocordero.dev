import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy no-build course engine — not part of the Next app:
    "app.js",
    "*.test.mjs",
    "lessons*/**",
    "playground/**",
    "tools/**",
    "scripts/**",
    "public/**",
  ]),
]);

export default eslintConfig;
