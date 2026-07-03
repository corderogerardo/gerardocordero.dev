# PawWalk Academy

An interactive, step-by-step course that teaches native app development from absolute
zero by rebuilding the PawWalk app, typing the real code, lesson by lesson, with
in-browser checking. Three courses share one engine:

- **iOS** (`index.html`) — Swift & SwiftUI, rebuilding `apps/ios`
- **Android** (`android.html`) — Kotlin & Jetpack Compose, rebuilding `apps/android`
- **Ruby** (`ruby.html`) — Ruby & Rails, rebuilding `apps/pawwalk-api`

Each course's header links to the other so you can hop between them.

**Part II (modules 13–31, complete)** teaches the Python backend the same way: Python → Flask →
Django → FastAPI (the real `apps/backend`) → LLM agents → RAG. The full academy spans iOS, Android,
Ruby/Rails, and Python. Build plans and per-module tasks:
[`docs/learning/python-academy-plan.md`](../../docs/learning/python-academy-plan.md),
[`docs/learning/ruby-academy-plan.md`](../../docs/learning/ruby-academy-plan.md).

## Run it

No build step, no dependencies:

```sh
cd apps/learn
python3 -m http.server 4173
```

Open http://localhost:4173 for the iOS course, http://localhost:4173/android.html for the
Android course, or http://localhost:4173/ruby.html for the Ruby course. Progress (including
code you type) is saved in the browser's localStorage — the three courses use separate store
keys (`pawwalk-academy-v1` for iOS, `pawwalk-academy-android-v1` for Android,
`pawwalk-academy-ruby-v1` for Ruby), so progress in one never touches the other.

## Layout

- `index.html` — iOS course shell; the `lessons/*.js` script-tag order is the course order
- `android.html` — Android course shell; same engine, loads `lessons-android/*.js` and
  sets `window.STORE_KEY` before the lesson scripts so progress is stored separately
- `ruby.html` — Ruby course shell; same engine, loads `lessons-ruby/*.js` and
  sets `window.STORE_KEY` before the lesson scripts so progress is stored separately
- `app.js` — the course engine (routing, step reveal, quiz/exercise/checklist logic),
  shared by all three courses
- `lessons/` — one JS file per iOS module; format documented in `lessons/FORMAT.md`
- `lessons-android/` — one JS file per Android module; same format, plus the
  Kotlin-specific traps in `lessons-android/FORMAT-KOTLIN.md`
- `lessons-ruby/` — one JS file per Ruby module; same format, plus the
  Rails-specific syntax in `lessons-ruby/FORMAT-RUBY.md`
- `tools/validate.mjs` — schema + solvability checks; run `node tools/validate.mjs`
  after editing any iOS lesson (it asserts every exercise's solution passes its own
  checks), `node tools/validate.mjs lessons-android` after editing an Android lesson,
  or `node tools/validate.mjs lessons-ruby` after editing a Ruby lesson
  (the directory is an optional argument, defaulting to `lessons`)
