import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // CommonJS build configs — `require()` is the only form they accept.
    "tailwind.config.js",
    "postcss.config.js",
    "next.config.js",
  ]),
]);

export default eslintConfig;
