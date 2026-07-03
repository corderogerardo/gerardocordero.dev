# gerardocordero.dev

Personal portfolio monorepo. pnpm workspaces + Turbo.

## The loop (read this first)

The three commands that tell you a change is correct:

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint (eslint-config-expo)
pnpm test        # jest via jest-expo (portfolio unit tests)
```

All three run via Turbo across every workspace that defines the script (cached — re-runs
are instant). A green exit (`0`) on all three is the signal that a change is safe.
**Run them after any code change and before saying a task is done.**

- Scope to the active app:  `pnpm --filter @gerardocordero/portfolio typecheck`
- First time / after pulling: `pnpm install` (deps are not committed)

End-to-end (Maestro) tests are a separate, device-level gate — see
"Mobile testing & deploys" below.

## Workspaces

| Path | What it is | In the loop? |
|---|---|---|
| `apps/portfolio` | **The active app.** Expo / React Native, expo-router, NativeWind. | ✅ typecheck + lint + unit (jest) + e2e (Maestro) |
| `apps/ios-prep` | Static Next.js 16 export → Cloudflare Pages (`ios.gerardocordero.dev`). iOS interview-prep study site. | ✅ typecheck + lint (deploy: path-filtered `deploy-ios-prep` in `ci.yml`) |
| `apps/reactnative-prep` | Static Next.js 16 export → Cloudflare Pages (`reactnative.gerardocordero.dev`). RN interview-prep study site. | ✅ typecheck + lint (deploy: path-filtered `deploy-reactnative-prep` in `ci.yml`) |
| `apps/android-prep` | Static Next.js 16 export → Cloudflare Pages (`android.gerardocordero.dev`). Android/Kotlin interview-prep study site. | ✅ typecheck + lint (deploy: path-filtered `deploy-android-prep` in `ci.yml`) |
| `apps/nest-prep` | Static Next.js 16 export → Cloudflare Pages (`nestjs.gerardocordero.dev`). NestJS / Node-backend interview-prep study site — flashcards, quiz, practice, **study guide, architecture, roadmap, pitches**. Built on `@gerardocordero/prep-kit`. | ✅ typecheck + lint (deploy: path-filtered `deploy-nest-prep` in `ci.yml`) |
| `apps/nextjs-prep` | Static Next.js 16 export → Cloudflare Pages (`nextjs.gerardocordero.dev`). Next.js / React interview-prep study site — flashcards, quiz, practice, **study guide, architecture, roadmap, pitches**. Built on `@gerardocordero/prep-kit`. | ✅ typecheck + lint (deploy: path-filtered `deploy-nextjs-prep` in `ci.yml`) |
| `apps/learn` | PawWalk Academy: interactive courses (iOS/Swift, Android/Kotlin, Ruby/Rails, Python/FastAPI+AI) sharing one no-build engine; validate with `node tools/validate.mjs` (no arg validates all four lesson dirs) or `node tools/validate.mjs [dir]` (dir: lessons \| lessons-android \| lessons-ruby \| lessons-python). Deployed static → Cloudflare Pages (`academy.gerardocordero.dev`) via path-filtered `deploy-learn` in `ci.yml` — no build step, deploys the dir as-is (Pages auto-ignores dotfiles/`node_modules`). | ❌ static site, no build — validator is its gate |
| `apps/pawwalk-api` | Rails 8.1 API (Ruby 3.4 via mise) built by the Ruby course; JWT auth, bookings, Stripe, Solid Queue/Cable, Kamal deploy. | ❌ not in pnpm loop — gate is `cd apps/pawwalk-api && mise x -- bin/rails test && mise x -- bin/rubocop` |
| `apps/ios` | PawWalk: XcodeGen-based SwiftUI reference app extracted from the iOS course (walker list, bookings, auth, live GPS tracking, chat assistant); talks to `apps/pawwalk-api`/`apps/backend`. | ❌ not in pnpm loop — gate is path-filtered `ios-build` in `ci.yml` (`cd apps/ios && xcodegen generate && xcodebuild -scheme PawWalk -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build`) |
| `apps/android` | PawWalk Compose reference app extracted from the Android/Kotlin course (`apps/learn/lessons-android/`); Jetpack Compose, Retrofit/OkHttp + kotlinx.serialization, EncryptedSharedPreferences auth, fused-location live tracking over WebSocket. | ❌ not in pnpm loop — gate is `android-build` (path-filtered) in `ci.yml`: `./gradlew assembleDebug` on ubuntu-latest (no local Android SDK requirement) |
| `apps/old-web` | Legacy portfolio (CRA, React 17). Archived. | ❌ quarantined — has pre-existing JS/TS errors; do not "fix" it as part of unrelated work |
| `packages/ui` | Shared RN UI library (`@gerardocordero/ui`), consumed by portfolio via a tsconfig path alias to its `src`. | covered via portfolio's typecheck |
| `packages/courses` | TypeScript course exercises (vitest). Learning material — tests may be intentionally red. | ❌ |
| `packages/interview-prep` | Algorithm practice. Learning material. | ❌ |
| `packages/server-node-concepts` | Node concept exercises. Learning material. | ❌ |

## Common commands

```bash
pnpm dev:portfolio   # Expo dev client for the portfolio app
pnpm dev             # all dev servers (turbo, persistent)
pnpm build           # build all buildable workspaces (turbo)
pnpm typecheck       # the loop — see above
pnpm lint            # the loop
pnpm test            # the loop — jest (portfolio)

# e2e (needs JDK 17 + a dev build on a booted iOS sim — see below):
cd apps/portfolio && maestro test .maestro/smoke.yml
```

## Conventions & gotchas

- **Package manager:** pnpm@10.11.0, `node-linker=hoisted` (see `.npmrc`). Always `pnpm install` before running anything.
- **`types: []` in `apps/portfolio/tsconfig.json` is load-bearing.** It stops TypeScript from auto-scanning `node_modules/@types`, which under hoisted pnpm pulls in deprecated stub packages (e.g. `@types/minimatch`) that have no `.d.ts` and break `tsc` with `TS2688`. Types still resolve through imports and triple-slash refs (`expo-env.d.ts`, `nativewind-env.d.ts`). Don't remove it. **Corollary:** the test files (`__tests__/**`, `jest-setup.ts`) are `exclude`d from the main `tsconfig.json` and typed via the scoped `tsconfig.test.json` (`types: ["jest","node"]`), so jest globals don't force `@types/jest` into the app's type resolution.
- **ESLint is pinned to `^9`, not 10.** `eslint-config-expo` pulls in `eslint-plugin-react@7`, which supports ESLint only up to `^9.7`. ESLint 10 crashes it (`getFilename is not a function`). Config lives in `apps/portfolio/eslint.config.js` (flat config); test files (`__tests__/**`, `*.test.*`, `jest-setup.ts`) are linted with a jest-globals override (no plugin — RNTL's matchers auto-register on import).
- **Styling:** NativeWind (Tailwind) in the portfolio app; a `postinstall` compiles the global stylesheet.
- **Unit test stack (portfolio):** `jest-expo ~56` (Jest 29) + `@testing-library/react-native ^14` + `test-renderer ^1.2`. Two SDK-56 gotchas: RN 0.85 extracted the Jest preset into `@react-native/jest-preset` (a required peer), and **RNTL v14 is async-by-default** — `await render(...)`, `await fireEvent...`. Do **not** add `react-test-renderer` (jest-expo bundles its own) or `@testing-library/jest-native` (deprecated; matchers are built in). Reanimated 4 is mocked via `react-native-worklets/src/mock` in `jest-setup.ts`.
- **Secrets:** store submission credentials **on EAS**, not in the repo. iOS submit uses an App Store Connect API key and Android uses a Google Play service account, both uploaded once via `eas credentials -p ios|android` — so `eas.json`'s `submit.production` carries no `appleId`/`serviceAccountKeyPath` and CI needs only the `EXPO_TOKEN` GitHub secret. Never commit credentials; the `credentials/` dir stays gitignored for any local key files.

## Study engine (interview prep)

The `Study` tab (`app/(tabs)/study.tsx`) is the app's interactive, repeat-use
feature — flashcards with on-device spaced repetition — added to satisfy App Store
**Guideline 4.2.2** (a portfolio alone reads as "marketing material"). All progress
is local; nothing is uploaded.

- **Engine** (`src/study/`): `srs.ts` (SM-2-lite scheduler, pure), `streak.ts`
  (daily streak, pure), `store.ts` (`usePersistedState` over AsyncStorage — chosen
  over MMKV because the app also exports to **web**), `rich.tsx` (a tiny RN markup
  renderer: `` `code` ``, `**bold**`, blank-line paragraphs, `- ` bullets — content
  is plain data, **never HTML**).
- **Scaling to a new subject** (Android, Python, Go, system design, …): drop a
  `src/study/content/<id>.ts` exporting a `Subject`, then add it to `SUBJECTS` in
  `src/study/registry.ts`. The picker, category filter, SRS, streak, and stats all
  pick it up — no engine changes. Categories are derived from card order.
- **Content** is authored + fact-checked via a workflow and emitted by
  `node scripts/gen-study-content.mjs <workflow-output.json>`; the generated `.ts`
  files are the source of truth thereafter (hand-edits win). Card ids must be
  globally unique (prefix `"<subject>-<category>-N"`).
- **Loop coverage:** `__tests__/study-srs.test.ts` (scheduler/streak),
  `study-content.test.ts` (registry + content integrity, no HTML/entities),
  `study-screen.test.tsx` (reveal → grade flow). E2E: `.maestro/study.yml`.

## Mobile testing & deploys (Maestro + EAS)

**Local prerequisites (one-time, already installed on this machine):** Maestro's CLI needs
**JDK 17** — without it nothing (CLI or MCP) runs. Installed: `openjdk@17` (Homebrew),
`idb-companion` (iOS-sim driving), and **Maestro 2.6.1** (`~/.maestro/bin`, symlinked onto
PATH at `/opt/homebrew/bin/maestro`). Android is **cloud-only** here (no local Android SDK /
JDK-for-Android). Install note: `get.maestro.dev` may not resolve — install from the official
GitHub release (`mobile-dev-inc/Maestro` → `maestro.zip`, checksum-verified) or `get.maestro.mobile.dev`.

**E2E flows** live in `apps/portfolio/.maestro/`:
- `smoke.yml` — the "does the app boot?" gate (`launchApp` + assert `screen-status`).
- `walk-tabs.yml` — taps every tab (`tab-*` ids) asserting each screen root (`screen-*` ids).
- `study.yml` — drives the interactive study loop (open Study, reveal a flashcard, grade it).
- `subflows/launch.yml` — reusable boot step.

`testID`s are the shared contract for unit + e2e: tab buttons are `tab-<route>`
(`app/(tabs)/_layout.tsx`), screen roots are `screen-<name>` (each tab screen's root `ScrollView`).

Maestro can't drive Expo Go — it needs a **dev/standalone build** installed on the device:
```bash
cd apps/portfolio && npx expo run:ios          # build + install the dev build to a booted sim
JAVA_HOME=/opt/homebrew/opt/openjdk@17 maestro test .maestro/smoke.yml
maestro studio                                  # inspect the live hierarchy / author flows
```

**Maestro MCP** is registered in `.mcp.json` (project scope) → `maestro mcp`, with
`JAVA_HOME` pinned. It exposes `list_devices`, `inspect_screen`, `take_screenshot`, `run`,
`cheat_sheet`, `open_maestro_viewer` so an agent can drive a booted sim and author/self-repair
flows. Needs JDK 17 + a booted sim with the app installed.

**CI/CD = EAS Workflows** (`apps/portfolio/.eas/workflows/`), run on Expo infra; they coexist
with the GitHub Actions loop gate:
- `e2e.yml` (`workflow_dispatch` — **manual**) — build the `e2e-test` profile (sim `.app` +
  emulator `.apk`) → `maestro` job runs `smoke.yml` on **iOS + Android**. The cloud "app boots"
  gate. Was `on: pull_request`, but the EAS `maestro` job type needs a **paid EAS subscription**
  the account lacks (it failed PRs with "Subscription to EAS is required"), so it's manual until
  subscribed — restore the `pull_request` trigger then. Meanwhile boot coverage = **local** Maestro
  (`.maestro/`, on a booted sim) and the GitHub Actions `verify` gate.
- `deploy.yml` (`workflow_dispatch`) — production build → `require-approval` → submit to App
  Store / Play (uses the `submit.production.*` profiles in `eas.json`).
- `ota-update.yml` (`on: push main`) — `eas update` (channel `production`) for JS-only changes.

Triggering EAS Workflows needs the **EAS GitHub app** connected (no token) or
`eas workflow:run …` with `EXPO_TOKEN`; `eas login` is required for any local `eas build`. The
`e2e-test` build profile (`withoutCredentials`, sim/apk) is in `eas.json`.

## Versioning & releases

One SemVer marketing version is the source of truth; EAS owns the native build
numbers; a git tag mirrors the version; the app shows exactly what's running.

| Layer | Source of truth | Notes |
|---|---|---|
| Marketing version | `app.json` → `expo.version` | bump with the release script |
| Native build number | **EAS remote** (`appVersionSource: remote` + production `autoIncrement`) | iOS `buildNumber` / Android `versionCode`, monotonic; never hand-edited. Inspect: `eas build:version:get --platform ios\|android` |
| Git tag + GitHub Release | `vX.Y.Z`, mirrors `expo.version` | created by the release script |
| In-app display | `apps/portfolio/src/version.ts` → `versionLabel()` | Status-screen footer, e.g. `v1.0.0 (7) · a1b2c3d` |

- **Git SHA** is injected into `extra.gitCommitHash` by `apps/portfolio/app.config.js`
  (dynamic config extending `app.json`): `EAS_BUILD_GIT_COMMIT_HASH` on EAS, local
  `git` otherwise. The build number comes from `expo-application` at runtime, so it
  only shows in a real native build (dev/EAS); in Expo Go/web it's omitted.

**Cut a release** (from `apps/portfolio/`):
```bash
node scripts/release.mjs <patch|minor|major|X.Y.Z>   # bump app.json, commit, tag vX.Y.Z
git push origin HEAD --follow-tags                    # or pass --push to the script
```
Pushing the `v*` tag runs `.github/workflows/release.yml` (GitHub Actions), which
(1) creates the GitHub Release (auto notes) and (2) runs an EAS **production build
of both platforms and auto-submits** them — iOS → App Store Connect/TestFlight,
Android → Play **internal** track. The same workflow has a manual **Run workflow**
button (`workflow_dispatch`, with an `all|ios|android` platform input). It uses
`eas build … --auto-submit --non-interactive --no-wait`, so the runner just queues
the work and EAS does build→submit on its infra. Auto-submit lands in
TestFlight/internal — it does **not** push to public App Store review by itself.

Requirements (one-time): repo secret `EXPO_TOKEN`
(`https://expo.dev/settings/access-tokens` → `gh secret set EXPO_TOKEN`) **and**
the submit credentials stored on EAS (`eas credentials -p ios|android`) — without
them `--auto-submit --non-interactive` can't prompt and the submit step fails (the
build still runs). The EAS-native `deploy.yml` workflow remains the
approval-gated alternative (build → `require-approval` → submit, triggered from the
EAS dashboard).

## Loop coverage (what's measured vs. not)

- ✅ **Types** — `pnpm typecheck` (portfolio + ui).
- ✅ **Lint** — `pnpm lint` (portfolio, `eslint-config-expo`).
- ✅ **Unit** — `pnpm test` (portfolio, `jest-expo` + RNTL v14). Tests live in `apps/portfolio/__tests__/` (kept out of `app/` so expo-router doesn't route them).
- ✅ **E2E** — Maestro flows in `apps/portfolio/.maestro/`. Local: iOS sim. CI: iOS + Android on EAS Workflows.
- ✅ **CI** — `.github/workflows/ci.yml` runs `pnpm typecheck` + `pnpm lint` + `pnpm test` on push/PR; EAS Workflows handle build + e2e + deploy.

When adding any of the above, wire it through Turbo and document the command here so it
becomes part of the standing loop.
