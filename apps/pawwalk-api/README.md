# PawWalk API

PawWalk Academy's reference backend — a small dog-walking marketplace API
(walkers, bookings, Stripe payments, live walk tracking over Action Cable).
It's built lesson-by-lesson by the Ruby/Rails course at
[`apps/learn`](../learn), and is meant to be read: every file a lesson
touches should stay textbook-clean.

Rails 8.1, API-only, SQLite (via the multi-database `primary`/`cache`/`queue`/`cable`
split), Solid Cache/Queue/Cable — no Redis, no Postgres, nothing to stand up
beyond the app itself.

## Quickstart

Ruby is pinned in `.ruby-version` and managed with [mise](https://mise.jdx.dev);
prefix Ruby/Rails commands with `mise x --` if mise isn't shimmed onto your `PATH`.

```bash
bundle install
bin/rails db:prepare   # creates + migrates all four SQLite databases
bin/rails db:seed      # 4 walkers + a demo user with a booking
bin/rails s             # http://localhost:3000
```

**Demo login** (seeded by `db/seeds.rb`):

```bash
curl -s http://localhost:3000/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"demo@pawwalk.dev","password":"walkies123"}'
```

Returns a JWT in `token` — send it back as `Authorization: Bearer <token>` on
every route below except `/signup`, `/login`, `GET /walkers`, and the Stripe
webhook.

## API surface

| Route | What it does |
|---|---|
| `POST /signup` | Create a user, return a JWT. |
| `POST /login` | Authenticate, return a JWT. |
| `GET /me` | Current user from the JWT. |
| `GET /walkers` | List walkers (optional `?city=`), no auth required. |
| `GET /walkers/:id` | One walker's public profile. |
| `GET /bookings` | Current user's bookings, paginated, optional `?status=`. |
| `GET /bookings/:id` | One booking (404s, not 403s, on someone else's — doesn't confirm it exists). |
| `POST /bookings` | Create a booking; price is always computed server-side, never trusted from the client. |
| `PATCH /bookings/:id/cancel` | Cancel a pending/confirmed booking. |
| `POST /bookings/:id/pay` | Create a Stripe PaymentIntent for a pending booking. |
| `POST /bookings/:id/walk_session` | Start the walk (confirmed booking -> in_progress). |
| `PATCH /bookings/:id/walk_session` | End the walk (-> completed). |
| `GET /bookings/:id/location_pings` | Location history for an active walk. |
| `POST /bookings/:id/location_pings` | Record a GPS ping; fans out over `WalkChannel` (Action Cable) to live subscribers. |
| `POST /stripe/webhooks` | Stripe's async payment confirmation/failure callback. |
| `GET /up` | Rails' built-in health check (200 if the app booted clean). |
| `/cable` | Action Cable mount point (`WalkChannel` streams a booking's location pings live). |

## The loop

```bash
bin/rails test    # 66 tests (Minitest, run in parallel)
bin/rubocop       # Omakase style, zero offenses expected
```

Run both after any change; they're what CI (and a lesson's "does this still
work" check) will run.

## Deploy (Kamal 2)

The app ships a complete `config/deploy.yml` with placeholders — swap in your
own values and it's a real deploy, not a toy one:

1. Point a domain's DNS A record at your server, and put the server's IP in
   `config/deploy.yml` (`servers.web`) and your Docker Hub username in
   `image:` / `registry.username`.
2. Export the three deploy secrets Kamal reads from `.kamal/secrets`
   (that file is git-tracked but holds no values, only references):
   ```bash
   export KAMAL_REGISTRY_PASSWORD=...   # Docker Hub access token
   export RAILS_MASTER_KEY=$(cat config/master.key)
   export STRIPE_SECRET_KEY=...
   export STRIPE_WEBHOOK_SECRET=...
   ```
3. `kamal setup` — first-time provisioning (installs Docker on the server,
   builds+pushes the image, boots the container, gets a Let's Encrypt cert).
4. `kamal deploy` — every deploy after that.
5. `kamal app logs -f` — tail production logs.

Full docs: [kamal-deploy.org](https://kamal-deploy.org).

### Local Docker production-boot proof

Before trusting any of the above, the exact prod image was built and booted
locally (no server needed) to prove the config is real:

```bash
docker build -t pawwalk-api .

docker run -d --name pawwalk-smoke -p 3080:80 \
  -e RAILS_MASTER_KEY=$(cat config/master.key) \
  -e SOLID_QUEUE_IN_PUMA=true \
  pawwalk-api

curl -s http://localhost:3080/up          # 200 — app booted clean
curl -s http://localhost:3080/walkers     # {"walkers":[]} — fresh volume, no seed yet

docker exec pawwalk-smoke bin/rails db:seed
curl -s http://localhost:3080/walkers     # now returns the 4 seeded walkers

docker logs pawwalk-smoke | tail -20
docker rm -f pawwalk-smoke
```

`-p 3080:80` maps to `80` because the Dockerfile `EXPOSE`s `80` — the app
runs behind [Thruster](https://github.com/basecamp/thruster) (`bin/thrust`),
which terminates HTTP on `80` and proxies to Puma on `3000` internally.
`bin/docker-entrypoint` runs `bin/rails db:prepare` on every boot, which
creates/migrates all four SQLite databases (primary, cache, queue, cable)
before the server starts — see the boot log for `Preparing database:` lines
covering all four.
