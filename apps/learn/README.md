# PawWalk Academy

An interactive, step-by-step course that teaches app and backend development from absolute
zero by rebuilding the PawWalk app, typing the real code, lesson by lesson, with
in-browser checking. Four courses share one engine:

- **iOS** (`index.html`) — Swift & SwiftUI, building the PawWalk iOS app
- **Android** (`android.html`) — Kotlin & Jetpack Compose, building the PawWalk Android app
- **Ruby** (`ruby.html`) — Ruby & Rails, rebuilding `apps/pawwalk-api`
- **Python** (`python.html`) — Python → Flask → Django → FastAPI → LLM agents → RAG

Each course's header links to the others so you can hop between them. Build plans and per-module tasks:
[`docs/learning/python-academy-plan.md`](../../docs/learning/python-academy-plan.md),
[`docs/learning/ruby-academy-plan.md`](../../docs/learning/ruby-academy-plan.md).

## Run it

No build step, no dependencies:

```sh
cd apps/learn
python3 -m http.server 4173
```

Open http://localhost:4173 for the iOS course, http://localhost:4173/android.html for the
Android course, http://localhost:4173/ruby.html for the Ruby course, or http://localhost:4173/python.html
for the Python course. Progress (including code you type) is saved in the browser's localStorage — the four
courses use separate store keys (`pawwalk-academy-ios-v1` for iOS, `pawwalk-academy-android-v1` for Android,
`pawwalk-academy-ruby-v1` for Ruby, `pawwalk-academy-python-v1` for Python), so progress in one never
touches the other. Progress from before the Python split (stored under the old shared
`pawwalk-academy-v1` key) is migrated automatically the first time you open a course.

## Layout

- `index.html` — iOS course shell; the `lessons/*.js` script-tag order is the course order
- `android.html` — Android course shell; same engine, loads `lessons-android/*.js` and
  sets `window.STORE_KEY` before the lesson scripts so progress is stored separately
- `ruby.html` — Ruby course shell; same engine, loads `lessons-ruby/*.js` and
  sets `window.STORE_KEY` before the lesson scripts so progress is stored separately
- `python.html` — Python course shell; same engine, loads `lessons-python/*.js` and
  sets `window.STORE_KEY` before the lesson scripts so progress is stored separately
- `app.js` — the course engine (routing, step reveal, quiz/exercise/checklist logic),
  shared by all four courses
- `lessons/` — one JS file per iOS module (00–12); format documented in `lessons/FORMAT.md`
- `lessons-android/` — one JS file per Android module; same format, plus the
  Kotlin-specific traps in `lessons-android/FORMAT-KOTLIN.md`
- `lessons-ruby/` — one JS file per Ruby module; same format, plus the
  Rails-specific syntax in `lessons-ruby/FORMAT-RUBY.md`
- `lessons-python/` — one JS file per Python module; same format, plus the
  Python-specific rules in `lessons-python/FORMAT-PYTHON.md`
- `tools/validate.mjs` — schema + solvability checks; run `node tools/validate.mjs`
  with no argument to validate all four lesson dirs (iOS/Android/Ruby/Python), or
  pass a directory name (`lessons | lessons-android | lessons-ruby | lessons-python`)
  to validate only that one
