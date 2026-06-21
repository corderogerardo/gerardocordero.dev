// The NativeWind/Tailwind global stylesheet is imported for its side effects
// (`import "./global.css"` in app/_layout.tsx). Metro + Babel compile the CSS;
// TypeScript only needs to know the module exists.
//
// Expo normally supplies this via `expo/types` (referenced from the generated,
// git-ignored expo-env.d.ts), but that file isn't present on a clean `tsc` run
// (local hook or CI). Since SDK 56 ships TypeScript 6 — which enforces
// `noUncheckedSideEffectImports` — the bare side-effect import would otherwise
// fail with TS2882. Declaring it here keeps the check on everywhere else.
declare module "*.css";
