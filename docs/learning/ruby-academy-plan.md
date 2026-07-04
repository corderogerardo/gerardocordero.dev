# Ruby & Rails Academy Plan

## Summary

The Ruby & Rails course teaches backend web development from zero by rebuilding PawWalk's production backend (`apps/pawwalk-api`). The 18-module curriculum progresses from pure Ruby (variables, blocks, classes) through HTTP and Rails fundamentals, to building a full-featured dog-walking marketplace API: walkers, bookings, Stripe payments, live GPS tracking via Action Cable, background jobs, deployment, and senior-level query performance and caching (N+1s, indexes, counter caches, HTTP conditional GET, Rails.cache/Solid Cache). The reference backend is a Rails 8.1 API-only app (Ruby 3.4 via mise) with 68 Minitest tests, rubocop-rails-omakase linting, Solid Queue jobs, Solid Cache for the app cache store, Solid Cable for real-time features, and a verified Kamal 2 deployment story (local Docker production boot proven).

## Modules

| # | File | Title | Focus |
|---|---|---|---|
| 00 | `00-ruby-welcome.js` | Welcome to Ruby | Why Ruby & Rails; course map; how the engine works |
| 01 | `01-ruby-basics.js` | Ruby Basics | Variables, strings, numbers, methods, control flow |
| 02 | `02-collections-blocks.js` | Collections & Blocks | Arrays, hashes, iterators, blocks, procs |
| 03 | `03-classes-modules.js` | Classes & Modules | Classes, inheritance, modules, mixins |
| 04 | `04-idioms-errors-gems.js` | Idioms, Errors & Gems | Error handling, Ruby idioms, bundler, gemfiles |
| 05 | `05-rack-http.js` | HTTP & Rack | HTTP verbs, headers, Rack request/response cycle |
| 06 | `06-rails-anatomy.js` | Rails Anatomy | Convention over configuration; routing, models, controllers, views |
| 07 | `07-activerecord.js` | ActiveRecord | Migrations, models, associations, querying the database |
| 08 | `08-rest-controllers.js` | REST & JSON Controllers | Designing RESTful endpoints; rendering JSON responses |
| 09 | `09-pawwalk-kickoff.js` | PawWalk Kickoff | App structure; models (Walker, Dog, Booking); seeds |
| 10 | `10-auth.js` | Auth: Passwords & Tokens | Password hashing, JWT tokens, current_user middleware |
| 11 | `11-bookings.js` | Bookings: The Core API | Booking workflow; availability, confirmation, state machine |
| 12 | `12-payments-jobs.js` | Payments & Background Jobs | Stripe webhooks, Solid Queue async jobs, email delivery |
| 13 | `13-live-tracking.js` | Live Tracking with Action Cable | WebSocket setup, real-time GPS broadcast, Solid Cable |
| 14 | `14-testing.js` | Testing the API | Minitest fixtures, request specs, edge cases, 100% coverage |
| 15 | `15-deploy-graduation.js` | Deploy & Graduation | Dockerfile, Kamal playbooks, VPS deployment, CI/CD |
| 16 | `16-query-performance.js` | Query Performance | N+1 queries, `includes`/`strict_loading`, EXPLAIN & composite indexes, counter caches |
| 17 | `17-caching.js` | Caching Layers | HTTP conditional GET (`fresh_when`/ETag), `Rails.cache` key-based expiry (Solid Cache), `touch: true`, thundering herd, cache-privacy bugs |
| 18 | `18-hotwire-admin.js` | A Hotwire Admin Dashboard | Turbo Drive/Frames/Streams over Solid Cable, Stimulus controllers, adding an HTML admin surface alongside an `api_only` JSON app |
| 19 | `19-money-ledger.js` | Money: Payouts & a Ledger | Integer cents vs `Float`/`BigDecimal`, idempotent payouts (unique idempotency key), a double-entry ledger (`ledger_entries`), reconciliation (balance = sum, never a cached counter) |
| 20 | `20-api-hardening.js` | Hardening the Public API | URL vs Accept-header versioning (`namespace :v1`), capped pagination (offset vs keyset), rate limiting with rack-attack (IP throttle, disabled in test), brakeman static security scanning + strong params recap |

## Reference Backend

### Stack & Loop

The backend at `apps/pawwalk-api` is a **Rails 8.1 API-only application** (Ruby 3.4 via mise) with:
- **JWT authentication** — token-based, stateless
- **REST API** — walkers, dogs, bookings, payments
- **Database** — PostgreSQL with migrations
- **Background jobs** — Solid Queue (Redis-backed async tasks, mailer, webhooks)
- **Real-time features** — Action Cable + Solid Cable (WebSocket live GPS tracking during walks)
- **Payments** — Stripe integration + webhook handlers
- **Testing** — 66 Minitest tests covering models, controllers, jobs
- **Linting** — rubocop-rails-omakase (strict Rails conventions)

**The loop** (run from `apps/pawwalk-api/`):
```bash
# Activate mise environment (Ruby 3.4, Rails 8.1):
mise x -- bin/rails test             # run all 66 Minitest tests
mise x -- bin/rubocop                # lint and auto-fix

# Or activate mise in your shell once:
eval "$(mise activate zsh)"
bin/rails test && bin/rubocop
```

### Deploy Story

**Local Docker production boot (verified):**
```bash
docker build -t pawwalk-api:latest .
docker run \
  -e DATABASE_URL=postgres://... \
  -e REDIS_URL=redis://localhost:6379 \
  -p 3000:3000 \
  pawwalk-api:latest
```
The Dockerfile builds a production-ready image (multi-stage, Ruby 3.4, Bundler caching).

**Kamal 2 deployment (placeholder-ready):**
The Rails app includes `config/deploy.yml` (Kamal 2 configuration) and GitHub Actions workflows ready to deploy. To deploy for real, fill in:
- `YOUR_SERVER_IP` — VPS address
- `YOUR_DOCKERHUB_USER` — Docker Hub username for pushing images
- `api.pawwalk.example` — production domain

**Environment secrets** (must be set on VPS or CI):
```bash
DATABASE_URL=postgres://user:pass@host/pawwalk
REDIS_URL=redis://host:6379
SECRET_KEY_BASE=<rails secret>
STRIPE_SECRET_KEY=sk_live_...
```

## Status

### Completed Items ✅
- [x] Engine: Ruby support (window.COURSE, lesson structure, step types)
- [x] `ruby.html` shell with sidebar, progress bar, store key `pawwalk-academy-ruby-v1`
- [x] `FORMAT-RUBY.md` — Rails/Ruby syntax and validator notes
- [x] Modules 00–15 authored and validated (81 lessons, 590 steps, 67 exercises, 82 quizzes)
- [x] Backend features complete (auth, bookings, payments, jobs, live tracking, 66 tests, rubocop)
- [x] Kamal/Docker verified (local production boot proven, deployment config ready)

### Planned Items ⬜
- [ ] First real VPS deployment (Kamal push to production server)
- [ ] Course-completion feedback loop (server-side progress storage, leaderboard, certificates)

## How Lessons Were Verified

**Exercise solution validation:** The `tools/validate.mjs` script asserts that every exercise in every lesson has a solution and that the solution code, when executed, passes its own embedded checks. Failures block deployment.

**Repository quotes:** All code snippets and file excerpts in lessons are byte-diffed against the actual reference backend (`apps/pawwalk-api`) to ensure no drift.

**Command transcripts:** Every shell command and curl example shown in lessons was captured from a real run against a running Rails server, ensuring sequences work end-to-end.

**Minitest & rubocop:** The backend's own test and lint suite (66 tests, 0 rubocop violations) is the final gate — only a working backend passes both.
