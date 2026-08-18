# Test Harness Patterns — gerardocordero.dev

Standardized test commands and patterns per project type. Every agent must use the project‑specific command rather than `pnpm test` globally.

## Detection Flow (via `/test-detect`)

1. **Start** → `test-detect` auto‑detects framework from config files.
2. **Run** → Executes the project‑specific command.
3. **Report** → Shows passed/failed/skipped + first 3 failure messages.
4. **Optionally** → Run a single file or generate tests.

---

## Project‑Specific Test Commands

| Project Type | Command | Detected Framework | Notes |
|---|---|---|---|
| **Expo / React Native** (`@gerardocordero/portfolio`) | `pnpm --filter @gerardocordero/portfolio test` | **Jest** (via `jest-expo ~56`, Jest 29) | Stack: `jest-expo ~56` + `@testing-library/react-native ^14` + `test-renderer ^1.2`. RNTL v14 **async‑by‑default**: `await render(...)`, `await fireEvent…`. **No** `react-test-renderer` (jest‑expo lo bundla) ni `@testing-library/jest-native` (deprecated). Reanimated 4 mock en `jest-setup.ts`. Test files `__tests__/**` exclude de `tsconfig.json` principal, tipados vía `tsconfig.test.json` (`types: ["jest","node"]`). |
| **Next.js 16 / Next‑prep** (`apps/nextjs-prep`, `apps/nest-prep`) | `pnpm --filter <app> test` | **Jest** (config detection) | TS split: `typescript@~6.0.3` + `typescript7`. `typecheck` usa `typescript7`. Tests via Jest con detección de config. |
| **Backend (pawwalk‑api)** | `cd apps/pawwalk-api && mise x -- bin/rails test` | **Rails minitest** | Gate: `cd apps/pawwalk-api && mise x -- bin/rails test && mise x -- bin/rubocop`. |
| **iOS native** | `xcodebuild` (path‑filtered) | **XCTest** | No pnpm gate. |
| **Android native** | `./gradlew assembleDebug` | **JUnit** | Path‑filtered in CI. |

---

## Recommended Harness (CI‑Ready)

### Command (run from repo root)

```bash
# Types
pnpm typecheck

# Lint
pnpm lint

# Test — portfolio (Expo/RN)
pnpm --filter @gerardocordero/portfolio test

# Test — learn (validator)
pnpm --filter @gerardocordero/learn test

# Test — backend
cd apps/pawwalk-api && mise x -- bin/rails test
```

### E2E (Maestro)

Local prerequisites (already installed):
- JDK 17 (`openjdk@17` Homebrew)
- Maestro 2.6.1 (`~/.maestro/bin`)
- Android SDK (`~/Library/Android/sdk`)

```bash
# Local iOS sim
cd apps/portfolio && JAVA_HOME=/opt/homebrew/opt/openjdk@17 maestro test .maestro/smoke.yml

# Walk all tabs
cd apps/portfolio && maestro test .maestro/walk-tabs.yml

# Study loop
cd apps/portfolio && maestro test .maestro/study.yml
```

### CI gate (`.github/workflows/ci.yml`)

```yaml
# Runs on every push/PR
- name: Loop verification
  run: |
    pnpm typecheck
    pnpm lint
    pnpm --filter @gerardocordero/portfolio test
```

---

## Common Pitfalls & Fixes

| Issue | Root Cause | Fix |
|---|---|---|
| `TS2688: Cannot find type definition for...` | `types: []` removed or mis‑configured | **Never remove** `types: []` from `tsconfig.json`; types resolve via imports + triple‑slash refs. |
| `getFilename is not a function` (ESLint) | ESLint `^10` with `eslint-plugin-react@7` | **Pin** ESLint to `^9`. Upgrade `eslint-config-expo` or migrate plugin. |
| `RNTL v14 async‑by‑default` test failures | `await render(...)` without `await` | Add `await` before all RNTL fireEvent/render calls. Update setup if using older patterns. |
| `TS7015: Falta el archivo de asignación` (TS split) | Usando `typescript@^7` en apps‑prep | Usar el alias `typescript7` y el binary `typescript7/bin/tsc`. |
| `Jest out of memory` | Test files not excluded from tsconfig | Asegurar que `__tests__/`, `jest-setup.ts` estén en `exclude` del tsconfig principal. |
| `Rails test gate fails` | Missing `mise` or wrong Ruby version | `mise install ruby-3.4` y `mise x -- bin/rails test`. |
| TestID contract drift | Internal testIDs deviate from `tab-<route>`/`screen-<name>` contract | Review `AUDIT_REPORT_TESTID.md`; root-level testIDs are 100% compliant. Internal element testIDs (study screen: `study-subject-*`, `study-cat-*`, `flashcard`, `grade-*`, `study-ahead`) follow project-specific patterns but are outside the root contract scope. |

---

## Agent Quick‑Start Checklist

Al iniciar cualquier tarea que incluya tests, verificar:

- [ ] ¿El proyecto es Expo/RN? → `pnpm --filter @gerardocordero/portfolio test`
- [ ] ¿Es Next‑prep? → `pnpm --filter <app> test` (detección automatica)
- [ ] ¿Es backend Rails? → `cd apps/pawwalk-api && mise x -- bin/rails test`
- [ ] ¿Usar `/test-detect` antes de lanzar tests para confirmar framework.
- [ ] ¿Revisar `openspec/specs/test-harness-patterns.md` para el patrón exacto.
- [ ] ¿Guardar memoria (`mem_save`) después de fijar o arreglar test failures.

---

**Actualizaciones futuras**: Cuando se añadan nuevos stacks o cambien versiones (ej. Next.js 17, ESLint 10), actualizar esta tabla y el checklist.