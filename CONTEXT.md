# Portfolio Monorepo

Personal portfolio monorepo (pnpm workspaces + Turbo) holding the Expo portfolio app, the PawWalk Academy study site, the interview-prep study sites, and the PawWalk reference clients with their Rails backend.

Design prose below uses module, interface, seam, and adapter in the codebase-design sense (a module presents one interface; the seam is where that interface lives; an adapter satisfies it).

## Language

### Study

**Subject**:
A named interview topic owning its cards, registered once in the subject registry.
_Avoid_: topic (`Subject`, `SUBJECTS` in `apps/portfolio/src/study/registry.ts`)

**Deck**:
A subject's authored card set, one content file per subject.
_Avoid_: question bank (`apps/portfolio/src/study/content/*.ts`, each headed "interview deck")

**Card**:
One question/answer pair in RN-renderable markup (inline code, bold, paragraphs, bullets — never HTML).
_Avoid_: flashcard (any single item; the rendered list is the deck) (`Card` in `apps/portfolio/src/study/types.ts`)

**SRS entry**:
Per-card spaced-repetition state (repetitions, interval, ease, due epoch-day) behind the single scheduler interface.
_Avoid_: schedule record (`SrsEntry` in `packages/prep-kit/src/lib/srs.ts`)

**Grade**:
A confidence rating (`again` / `hard` / `good` / `easy`) that reschedules a card through the scheduler interface.
_Avoid_: score, mark (`Grade`, `schedule`, `GRADES` in `packages/prep-kit/src/lib/srs.ts`)

**Streak**:
Consecutive-day completion record (`last`, `count`, `best`) advanced by one call per day.
_Avoid_: run, chain (`Streak`, `bumpStreak` in `packages/prep-kit/src/lib/streak.ts`)

**DayLog**:
Per-day record of card ids reviewed well, backing counters that must keep climbing while the due set refills.
_Avoid_: daily tally (`DayLog`, `logToday` in `packages/prep-kit/src/lib/srs.ts`)

### Academy

**Course**:
A top-level academy track (id, title, emoji, store key) owning its modules, built from a `lessons-*` source directory.
_Avoid_: track, class (`Course` in `apps/learn/src/lib/course-data.ts`; built by `apps/learn/scripts/build-data.mjs`)

**Module**:
An id/title/lessons grouping inside a course.
_Avoid_: chapter, unit (`Module` in `apps/learn/src/lib/course-data.ts`)

**Lesson**:
An id/title/steps sequence inside a module; steps are text, code, quiz, exercise, or Xcode items.
_Avoid_: page, chapter (`Lesson`, `Step` in `apps/learn/src/lib/course-data.ts`)

**Spec deck**:
A per-specialization interview deck generated from markdown under `docs/andersen/<slug>/`, registered in the spec list.
_Avoid_: matrix dump (`AndersenSpec`, `getSpecFlashcards` in `apps/learn/src/lib/andersen-decks.ts`)

**Scene tile**:
A homepage navigation tile carrying its full data (label, destination, icon, hue) with no positional index coupling.
_Avoid_: course card, grid cell (`SceneTile` in `apps/learn/src/components/SceneTiles.tsx`)

### Booking

**Booking**:
A scheduled walk with a status, owned by the booking module on each native client.
_Avoid_: appointment, order (`Booking` in `apps/ios/PawWalk/Models/Models.swift`)

**Walker**:
A dog-walker profile offering and accepting walks.
_Avoid_: sitter, provider (`Walker` in `apps/ios/PawWalk/Models/Models.swift`)

**Transition action**:
A typed status move (`accept` / `decline` / `start` / `complete`) at the booking transition seam, replacing raw strings.
_Avoid_: string action, status name (`BookingAction` in `apps/ios/PawWalk/Services/APIClient.swift` and `apps/android/app/src/main/kotlin/com/pawwalk/android/data/PawWalkApi.kt`)

### Platform

**prep-kit**:
The shared study home: the single SRS + streak module and the canonical flashcard shape, consumed via deep file import (never the barrel, which pulls React).
_Avoid_: shared UI lib (`packages/prep-kit/src/lib/srs.ts`, `packages/prep-kit/src/lib/streak.ts`, `Flashcard` in `packages/prep-kit/src/types.ts`)

**Workspace direction**:
Declared workspace dependencies may point apps toward packages and packages toward packages, never the reverse.
_Avoid_: dependency rule (`docs/adr/0001-workspace-dependency-boundaries.md`)

**Architecture fitness check**:
The deterministic CI gate reporting workspace and edge counts and listing each forbidden edge it finds.
_Avoid_: lint pass, audit script (`scripts/architecture-fitness.mjs`, `pnpm architecture:check`, `Architecture fitness` step in `.github/workflows/ci.yml`)

**PawWalk client contract**:
The shared routes and JSON shapes expected by the iOS and Android clients, implemented independently by the FastAPI and Rails backends.
_Avoid_: FastAPI contract, Rails contract (when referring to the shared behavior)

## Workspaces

- `apps/portfolio` — the Expo portfolio app, including the Study tab that consumes the prep-kit SRS + streak seam.
- `apps/learn` — PawWalk Academy: interactive courses, spec decks, and scene tiles.
- `apps/*-prep` (`ios`, `reactnative`, `android`, `nest`, `nextjs`, plus the `template-prep` template) — static interview-prep study sites built on prep-kit.
- `apps/backend`, `apps/pawwalk-api` — independent FastAPI and Rails backends intended to implement the shared PawWalk client contract for learning and comparative testing.
- `apps/ios`, `apps/android` — the SwiftUI and Compose PawWalk reference clients owning the booking domain.
- `packages/prep-kit` — the shared study home (SRS, streak, content types, study views).
- `packages/ui` — the shared React Native primitive set consumed by the portfolio app.
