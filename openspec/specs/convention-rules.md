# Convention Rules by Project Type

## Overview
This document defines the mandatory conventions and "gotchas" per project type in the gerardocordero.dev monorepo. Every agent/task must consult the relevant section before starting work.

| Project Type | Key Apps | Primary Language/Framework | Convention Doc |
|---|---|---|---|
| **Expo/React Native** | `apps/portfolio`, `apps/reactnative-prep`, `apps/ios-prep`, `apps/android-prep` | Expo SDK 56, RN 0.85, React 19, NativeWind (Tailwind v4) | See `RN-Convenciones` below |
| **Next.js 16 Static Export** | `apps/nextjs-prep`, `apps/nest-prep` | Next.js 16, React 18 (or 19 via bridge), typescript `~6.0.3` + `typescript7` alias | See `Next-Convenciones` below |
| **Backend API** | `apps/pawwalk-api` | Ruby on Rails 8.1, Ruby 3.4 | See `Rails-Convenciones` below |
| **iOS Native** | `apps/ios` | SwiftUI, XcodeGen | See `iOS-Convenciones` below |
| **Android Native** | `apps/android` | Jetpack Compose, Kotlin | See `Android-Convenciones` below |

---

## 1. Expo/React Native Convenciones

### TypeScript (`tsconfig.json`)
- `"types": []` es **load-bearing**. Evita que TypeScript auto‑scanee `node_modules/@types`, que trae stubs deprecated (ej. `@types/minimatch` sin `.d.ts`) que rompen `tsc` con `TS2688`.
- Types se resuelven por **imports** y **triple‑slash refs** (`expo-env.d.ts`, `nativewind-env.d.ts`).
- **No remover** `types: []`.

### ESLint (`eslint.config.js`)
- ESLint **^9** (no 10). `eslint-config-expo` trae `eslint-plugin-react@7`, que soporta ESLint solo hasta `^9.7`. ESLint 10 crasha (`getFilename is not a function`).
- Config viva en `apps/*/eslint.config.js` (flat config).
- Archivos de test (`__tests__/**`, `*.test.*`, `jest-setup.ts`) se lintan con **jest‑globals override** (no plugin — matchers de RNTL se auto‑registran al importar).
- **No actualizar** a ESLint 10 mientras la dependencia `eslint-plugin-react@7` esté atada.

### Unit tests (`jest-expo` ~56, Jest 29)
- Stack: `jest-expo ~56` + `@testing-library/react-native ^14` + `test-renderer ^1.2`.
- **RNTL v14 es async‑by-default**: `await render(...)`, `await fireEvent...`.
- **No añadir** `react-test-renderer` (jest‑expo lobundla) ni `@testing-library/jest-native` (deprecatado; matchers built‑in).
- Reanimated 4 mocked vía `react-native-worklets/src/mock` en `jest-setup.ts`.
- Los archivos de test (`__tests__/**`) están **excluidos** del `tsconfig.json` principal y tipados vía `tsconfig.test.json` (`types: ["jest","node"]`), así que globals de Jest no fuerzan `@types/jest` en la resolución de tipos del app.

### Post‑install
- El `postinstall` compila los estilos globales: `tailwindcss -i ./global.css -o ./node_modules/.cache/nativewind/global.css`.

### Package‑manager
- `pnpm@10.11.0`, `node-linker=hoisted` (ver `.npmrc`). Siempre `pnpm install` antes de anything.

---

## 2. Next.js 16 Static Export Convenciones

### TypeScript (deliberate split)
- Cada `apps/*‑prep` declara **dos** versiones:
  - `typescript@~6.0.3` (el bridge JS‑based)
  - `typescript7: npm:typescript@7.0.2` (el compilador Go‑nativo)
- `typecheck` corre: `node ../../node_modules/typescript7/bin/tsc --noEmit` (TS 7).
- **Por qué**: `typescript@7` no tiene API de legacy compiler (`require('typescript')` es un stub), así que `next build`'s type‑check y `@typescript-eslint` (peer range `<6.1.0`) crashon. La versión visible al app debe quedarse en 6.x.
- **No simplificar** a un solo `typescript@^7` hasta que Next soporte tsgo (vercel/next.js#81472) **y** typescript-eslint permite 7 — entonces colapsar: `typescript: ^7`, borrar el alias `typescript7`, restaurar `"typecheck": "tsc --noEmit"`.

### ESLint
- `eslint-config-expo` para apps que comparten configuración base.
- `eslint-config-next` para apps Next.js con flat config.
- Igual: ESLint `^9`, no 10.

### Type‑check
- El comando `typecheck` en turbo: `turbo typecheck` → `pnpm --filter <app> typecheck` → `tsc --noEmit`.
- En apps‑prep, el binary real es `node ../../node_modules/typescript7/bin/tsc --noEmit`.

---

## 3. Backend API (Ruby on Rails) Convenciones

### Gemfile & Mise
- Ruby 3.4 vía `mise`.
- Dependencias en `Gemfile` (JWT auth, bookings, Stripe, Solid Queue/Cable, Kamal deploy).
- `mise x -- bin/rails test` y `mise x -- bin/rubocop` son los gates.

### Testing
- `cd apps/pawwalk-api && mise x -- bin/rails test` es el gate de tests.
- `rubocop` para linting.

### Secrets
- **No commitir** credenciales. Almacenar en EAS (`eas credentials -p ios|android`) o en variables de entorno de producción.
- `eas.json`'s `submit.production` lleva `appleId`/`serviceAccountKeyPath` vacíos; CI necesita solo `EXPO_TOKEN` GitHub secret.

### Package manager
- Gem `bundle install` + `mise`. No pnpm.

---

## 4. iOS Native Convenciones

### Build
- `xcodegen generate && xcodebuild -scheme PawWalk -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build`.
- No hay gate pnpm (es proyecto Xcode separado).

### Code
- SwiftUI, XcodeGen.
- Conformar a conventions de Apple (no covered en este doc pero seguir guidelines de la skill `swiftui-expert-skill`).

---

## 5. Android Native Convenciones

### Build
- `./gradlew assembleDebug` en ubuntu-latest (no requiere SDK local).
- Jetpack Compose, Kotlin.

### Code
- Conformar a conventions de Android (no covered aquí pero seguir skill `android-native-dev`).

---

## 6. Hybrid / Mixed Projects

Algunos proyectos combinan stacks (ej. `apps/learn` es Next.js 16 + contenido Ruby/Rails/Go/etc.). Para esos casos:

1. **Aplicar la convención del stack principal** (por defecto Next.js 16 para `apps/learn`).
2. **Revisar scripts específicos** en `tools/` (validate.mjs, i18n-check.mjs).
3. **Usar modo `both`** de artifact store (Engram + OpenSpec) para persistir decisiones.

---

## Aplicación Rápida (Checklist por tarea)

Al iniciar cualquier tarea, verificar:

| Proyecto | `types: []` | ESLint ^9 | RNTL async | TS split | Gate de test |
|---|---|---|---|---|---|
| **Expo/RN** | ✅ Sí | ✅ ^9 | ✅ async‑by‑default | ❌ No | `pnpm --filter @gerardocordero/portfolio test` |
| **Next‑prep** | ✅ Sí (o types según) | ✅ ^9 | ❌ No | ✅ Yes (TS 6.0.3 + TS7) | `pnpm --filter <app> test` |
| **Backend (Rails)** | N/A | N/A | N/A | N/A | `cd apps/pawwalk-api &&mise x -- bin/rails test` |
| **iOS** | N/A | N/A | N/A | N/A | `xcodegen ...` |
| **Android** | N/A | N/A | N/A | N/A | `./gradlew assembleDebug` |

**¿Necesitas añadir una convención nueva o modificar alguna?** Abre un issue o comenta en el hilo activo.