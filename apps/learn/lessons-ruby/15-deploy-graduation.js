// Module 16 — Deploy & Graduation. See FORMAT.md + FORMAT-RUBY.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "pawwalk-deploy",
  title: "Deploy & Graduation",
  emoji: "🚀",
  lang: "ruby",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "laptop-to-server",
      title: "From Laptop to Server",
      steps: [
        {
          type: "text",
          md: [
            "## What \"deploying\" actually means",
            "Every module so far ended with `bin/rails s` on your own machine — you, `localhost:3000`, done. Deploying means something more specific: a Linux box somewhere else runs your app **as a container**, sits behind a proxy that terminates TLS (the `https://` padlock), restarts the app if it crashes, and can update it to a new version with zero downtime. Nobody SSHes in and hand-edits files at 2am. That whole story is what the rest of this module unpacks, piece by piece.",
          ],
        },
        {
          type: "text",
          md: [
            "## Four pieces, four tools",
            "Strip away the buzzwords and a deploy is four concrete things, each with one tool doing the job:",
            "1. **A container image** — your app, its exact Ruby version, and every gem, frozen into one artifact. Built by **Docker**, from a `Dockerfile`.\n2. **A registry** — somewhere the image lives so a server can pull it. **Docker Hub** (or any registry) — you push once, the server pulls.\n3. **A server** — a real Linux box that runs the container. Any $5-a-month **VPS** (Hetzner, DigitalOcean, whoever) works; it just needs Docker installed.\n4. **An orchestrator** — the thing that pulls the image, starts the container, wires up TLS, and swaps in a new version without downtime on every future deploy. That's **Kamal**, Rails' own deploy tool.",
            "Each piece solves one problem. Skip the registry and the server has no way to get your code. Skip the orchestrator and you're manually SSHing in to run `docker run` by hand, every single deploy, forever.",
          ],
        },
        {
          type: "text",
          md: [
            "## The Rails 8 punchline",
            "Here's the twist: you already have all four pieces' configuration. Back in module 09, `rails new pawwalk-api --api` scaffolded the models, controllers, and folder structure you've spent seven modules filling in. But that same command **also** generated a `Dockerfile` and a `config/deploy.yml` — a full Kamal config — on day one. You just never opened them, because there was nothing to deploy yet.",
            "That's a deliberate Rails 8 decision: deployment isn't a separate concern you bolt on in month six, it's part of what `rails new` hands you on minute one. The files were sitting there the whole time, unexplained — this module is where you finally open them.",
          ],
        },
        {
          type: "code",
          title: "Terminal — the files that were always there",
          source: String.raw`$ cd apps/pawwalk-api
$ ls Dockerfile config/deploy.yml .kamal/secrets bin/docker-entrypoint
Dockerfile
config/deploy.yml
.kamal/secrets
bin/docker-entrypoint`,
          caption: "All four exist right now, untouched since `rails new pawwalk-api --api` wrote them in module 09. Every deploy lesson from here is just reading files that have been sitting in the repo the whole time.",
        },
        {
          type: "quiz",
          q: "Which command originally generated BOTH `Dockerfile` and `config/deploy.yml` for `apps/pawwalk-api`?",
          choices: [
            "`rails new pawwalk-api --api` — Rails 8 bakes in deploy config from the very first commit",
            "A separate `kamal init` command run much later, after the models were built",
            "`docker init`, run manually once the app was feature-complete",
            "They don't come from a generator — a human wrote them by hand in module 15",
          ],
          answer: 0,
          explain: "Rails 8 made deployment part of `rails new` itself. The same one-line generator that scaffolded `--api` mode back in module 09 also wrote a production-ready `Dockerfile` and a Kamal `config/deploy.yml` — deploy-ready with placeholders, waiting for a real server and domain.",
          nudge: "Think back to module 09's `rails new pawwalk-api --api` — how many separate generators would you need to run if deploy config weren't already part of it?",
        },
        {
          type: "quiz",
          q: "Put the four deploy pieces in order for a first-time deploy: which has to exist before the next can do its job?",
          choices: [
            "Build the image (Docker) → push it somewhere reachable (registry) → have a server to pull it (VPS) → have something that tells the server to pull-and-run it (Kamal)",
            "Buy the server first, then Kamal builds the Dockerfile for you automatically",
            "The registry doesn't matter — Kamal copies your source code over SSH and builds it there every time",
            "Order doesn't matter, all four happen simultaneously with one command",
          ],
          answer: 0,
          explain: "Each piece is a dependency of the next: there's nothing to push until the image is built, nothing for the server to pull until it's pushed somewhere, and nothing for Kamal to orchestrate until there's a server to reach. `kamal setup` (lesson 5) runs all four in that order, once.",
          nudge: "Can you push an image that hasn't been built? Can a server pull an image from nowhere?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "the-dockerfile",
      title: "The Dockerfile",
      steps: [
        {
          type: "text",
          md: [
            "## Multi-stage: a fat build, a slim ship",
            "Open the real `Dockerfile`. The first thing to notice is it has three `FROM` lines, not one — that's a **multi-stage build**. Stage one (`base`) sets shared config. Stage two (`build`) installs everything needed to COMPILE gems — a C compiler, git, dev headers — and runs `bundle install`. Stage three (final) starts fresh `FROM base` again and copies over only the *compiled result*, never the compiler toolchain. The image you actually ship never contains `build-essential` at all.",
          ],
        },
        {
          type: "code",
          title: "Dockerfile",
          source: String.raw`# syntax=docker/dockerfile:1
# check=error=true

# This Dockerfile is designed for production, not development. Use with Kamal or build'n'run by hand:
# docker build -t pawwalk_api .
# docker run -d -p 80:80 -e RAILS_MASTER_KEY=<value from config/master.key> --name pawwalk_api pawwalk_api

# For a containerized dev environment, see Dev Containers: https://guides.rubyonrails.org/getting_started_with_devcontainer.html

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version
ARG RUBY_VERSION=3.4.10
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

# Rails app lives here
WORKDIR /rails

# Install base packages
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 libvips sqlite3 && \
    ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Set production environment variables and enable jemalloc for reduced memory usage and latency.
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development" \
    LD_PRELOAD="/usr/local/lib/libjemalloc.so"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build gems
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libvips libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install application gems
COPY vendor/* ./vendor/
COPY Gemfile Gemfile.lock ./

RUN bundle install && \
    rm -rf ~/.bundle/ "` + "${BUNDLE_PATH}" + String.raw`"/ruby/*/cache "` + "${BUNDLE_PATH}" + String.raw`"/ruby/*/bundler/gems/*/.git && \
    # -j 1 disable parallel compilation to avoid a QEMU bug: https://github.com/rails/bootsnap/issues/495
    bundle exec bootsnap precompile -j 1 --gemfile

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times.
# -j 1 disable parallel compilation to avoid a QEMU bug: https://github.com/rails/bootsnap/issues/495
RUN bundle exec bootsnap precompile -j 1 app/ lib/




# Final stage for app image
FROM base

# Run and own only the runtime files as a non-root user for security
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash
USER 1000:1000

# Copy built artifacts: gems, application
COPY --chown=rails:rails --from=build "` + "${BUNDLE_PATH}" + String.raw`" "` + "${BUNDLE_PATH}" + String.raw`"
COPY --chown=rails:rails --from=build /rails /rails

# Entrypoint prepares the database.
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start server via Thruster by default, this can be overwritten at runtime
EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]`,
          caption: "The real file, every stage, every line, verbatim. Three `FROM`s: `base` (shared setup), `build` (throwaway, has the compiler), and the final stage (slim, ships) — which `COPY --from=build`s only the compiled gems and app code, never the compiler.",
        },
        {
          type: "text",
          md: [
            "## `USER 1000:1000` — don't run as root",
            "`RUN groupadd ... && useradd rails ...` then `USER 1000:1000` switches the container to a non-root user for everything that happens after — including the running server. If an attacker ever found a way to execute code inside the container, they'd be `rails`, a user with no special privileges, not `root` with the run of the whole filesystem. This costs one `RUN` line and a `USER` line; skipping it costs you the single most basic container-security habit there is.",
          ],
        },
        {
          type: "text",
          md: [
            "## `bin/docker-entrypoint` — why the DB exists on first boot",
            "`ENTRYPOINT [\"/rails/bin/docker-entrypoint\"]` means this script runs before anything else, every single time the container starts — and it's the reason you never had to manually create a database on the server:",
          ],
        },
        {
          type: "code",
          title: "bin/docker-entrypoint",
          source: String.raw`#!/bin/bash -e

# If running the rails server then create or migrate existing database
if [ "` + "${@: -2:1}" + String.raw`" == "./bin/rails" ] && [ "` + "${@: -1:1}" + String.raw`" == "server" ]; then
  ./bin/rails db:prepare
fi

exec "` + "${@}" + String.raw`"`,
          caption: "`\"${@: -2:1}\"` and `\"${@: -1:1}\"` are bash parameter expansion — the second-to-last and last words of the command Docker is about to run. If they're literally `./bin/rails server`, it runs `db:prepare` FIRST. That one `if` is why your very first boot on a brand-new server creates and migrates all four SQLite databases with no manual step.",
        },
        {
          type: "text",
          md: [
            "## Thruster — the thing wrapping Puma",
            "`EXPOSE 80` and `CMD [\"./bin/thrust\", \"./bin/rails\", \"server\"]` are the last two lines. `bin/thrust` is **Thruster**, a small Rails-team proxy that sits in front of Puma inside the SAME container: it terminates plain HTTP on port 80, adds HTTP/2, compresses and caches static assets, and can serve files via X-Sendfile — then hands the actual request to Puma, which listens on port 3000 internally. You never talk to Puma directly in production; Thruster is always the first thing that answers.",
          ],
        },
        {
          type: "text",
          md: [
            "## `production.rb` — trusting the proxy in front of you",
            "One more piece has to agree with this picture. In a real deploy, Kamal's OWN proxy sits in front of Thruster and terminates the actual public TLS (`https://`) connection, forwarding plain HTTP to the container. Rails needs to be told that's happening, or it will think every request arrived unencrypted and refuse to set secure cookies:",
          ],
        },
        {
          type: "code",
          title: "config/environments/production.rb (the two TLS lines)",
          source: String.raw`  # Assume all access to the app is happening through a SSL-terminating reverse proxy.
  # Required because Kamal's proxy (config/deploy.yml -> proxy.ssl) terminates TLS in front of
  # this container and forwards plain HTTP to it.
  config.assume_ssl = true

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = true`,
          caption: "`assume_ssl` tells Rails \"trust me, this plain-HTTP request really did arrive over HTTPS\" — without it, Rails sees an unencrypted connection from its own point of view and can misbehave (redirect loops, insecure cookies). `force_ssl` is the other half: it makes Rails itself refuse/redirect any request that ever DOES arrive unencrypted, and marks cookies secure.",
        },
        {
          type: "quiz",
          q: "Why does `production.rb` need BOTH `config.assume_ssl = true` and `config.force_ssl = true` for a Kamal deploy, instead of just one?",
          choices: [
            "`assume_ssl` tells Rails to trust that the proxy in front of it already terminated TLS (so the plain-HTTP hop to the container is fine); `force_ssl` makes Rails itself enforce HTTPS and secure cookies for any request that reaches it — they solve two different halves of the same trust problem",
            "They're redundant — either one alone would do exactly the same thing",
            "`assume_ssl` is for development and `force_ssl` is for production; only one is ever active at a time",
            "Both lines only affect logging, not actual request handling",
          ],
          answer: 0,
          explain: "Kamal's proxy terminates the public HTTPS connection and forwards plain HTTP into the container. Without `assume_ssl`, Rails would see that internal plain-HTTP hop and think the whole request was insecure. `force_ssl` is Rails' own enforcement layer — redirects, HSTS, secure cookies — for whatever traffic reaches it. One tells Rails what already happened upstream; the other tells Rails what to require going forward.",
          nudge: "One line is about trusting the proxy's work. The other is about what Rails itself refuses to allow. Are those the same job?",
        },
        {
          type: "exercise",
          title: "Retype the entrypoint's guard",
          prompt: [
            "Retype the `if` guard from `bin/docker-entrypoint`: it checks bash's special `$@` array for `./bin/rails` as the second-to-last argument and `server` as the last, using `${@: -2:1}` and `${@: -1:1}`. If both match, run `./bin/rails db:prepare`. Close with `fi`.",
          ],
          starter: String.raw`#!/bin/bash -e

# your code here
`,
          solution: String.raw`#!/bin/bash -e

if [ "` + "${@: -2:1}" + String.raw`" == "./bin/rails" ] && [ "` + "${@: -1:1}" + String.raw`" == "server" ]; then
  ./bin/rails db:prepare
fi`,
          checks: [
            { re: /if\[/, hint: "Start the guard with `if [ ... ]` — a bash test." },
            { re: /=="\.\/bin\/rails"/, hint: "Compare the second-to-last argument against the literal string `\"./bin/rails\"`." },
            { re: /=="server"/, hint: "Compare the last argument against the literal string `\"server\"`." },
            { re: /\.\/bin\/rails db:prepare/, hint: "Inside the `if`, run `./bin/rails db:prepare` — this is what creates and migrates every database on first boot." },
          ],
          mustNot: [
            { re: /bin\/rails db:migrate/, hint: "The real entrypoint calls `db:prepare`, not `db:migrate` — `db:prepare` also creates the databases if they don't exist yet, which `db:migrate` alone would not." },
          ],
          success: "That's the exact guard shipping in bin/docker-entrypoint — the one line responsible for a brand-new server having a fully migrated, seeded-on-first-request SQLite setup with zero manual steps.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "kamal-deploy-yml",
      title: "Kamal: deploy.yml",
      steps: [
        {
          type: "text",
          md: [
            "## One YAML file, one server, one app",
            "`config/deploy.yml` is the whole deploy description Kamal reads. Read it top to bottom — every section maps to one of the four pieces from lesson 1.",
          ],
        },
        {
          type: "code",
          title: "config/deploy.yml (service, servers, proxy)",
          source: String.raw`# Kamal 2 config for a single-server deploy of PawWalk Academy's reference API.
# Docs: https://kamal-deploy.org — "5 commands" version is in the app README.

# Name of your application. Used to uniquely configure containers.
service: pawwalk-api

# Name of the container image on Docker Hub (or any registry) — set to your own repo.
image: YOUR_DOCKERHUB_USER/pawwalk-api

# Deploy to these servers. One entry = one $5 VPS (Hetzner, DigitalOcean, etc.) — put its IP here.
servers:
  web:
    - YOUR_SERVER_IP

# Enable SSL auto-certification via Let's Encrypt through Kamal's built-in proxy (kamal-proxy).
# Point your domain's DNS A record at YOUR_SERVER_IP first; the proxy requests and renews the
# cert automatically on first boot. Requires config.assume_ssl + config.force_ssl in production.rb
# (already set below for this single-server setup).
proxy:
  ssl: true
  host: api.pawwalk.example`,
          caption: "`service` + `image` name the artifact; `servers.web` is a list — one entry here, but a busier app could list several boxes. `proxy.ssl: true` is the ENTIRE Let's Encrypt integration: point DNS at the IP, and Kamal's proxy requests and renews the cert for you, automatically.",
        },
        {
          type: "text",
          md: [
            "## `registry` — where the image goes to be pulled",
            "`YOUR_SERVER_IP`, `YOUR_DOCKERHUB_USER`, and `api.pawwalk.example` are placeholders, deliberately — swap in a real IP, username, and domain and this file deploys for real. The registry section is next:",
          ],
        },
        {
          type: "code",
          title: "config/deploy.yml (registry)",
          source: String.raw`# Where you keep your container images. Docker Hub is the free default; swap ` + "`server:`" + String.raw` for
# ghcr.io or registry.digitalocean.com if you prefer another registry.
registry:
  username: YOUR_DOCKERHUB_USER

  # Always use an access token rather than your real password.
  password:
    - KAMAL_REGISTRY_PASSWORD`,
          caption: "`password:` is a list with ONE item — but that item isn't a password, it's the NAME of an environment variable Kamal reads at deploy time. `KAMAL_REGISTRY_PASSWORD` never appears as a literal value anywhere in this git-tracked file.",
        },
        {
          type: "text",
          md: [
            "## `env.secret` vs `env.clear` — the line that matters most",
            "This is the section worth slowing down for. Both `secret` and `clear` inject environment variables into the running container, but they come from opposite places:",
          ],
        },
        {
          type: "code",
          title: "config/deploy.yml (env)",
          source: String.raw`# Inject ENV variables into the container. ` + "`secret`" + String.raw` values are read from .kamal/secrets at
# deploy time and never stored in this file; ` + "`clear`" + String.raw` values are plain config, safe to commit.
env:
  secret:
    - RAILS_MASTER_KEY
    - STRIPE_SECRET_KEY
    - STRIPE_WEBHOOK_SECRET
  clear:
    # Single-server setup: run the Solid Queue supervisor inside Puma instead of a separate
    # job container. Split this out (see the "job" server block below) once you outgrow one box.
    SOLID_QUEUE_IN_PUMA: true`,
          caption: "Three secrets, one clear var. `RAILS_MASTER_KEY` decrypts `config/credentials.yml.enc`; `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` are module 12's payment story. `SOLID_QUEUE_IN_PUMA: true` is the same flag `config/puma.rb` checks — jobs run INSIDE the one Puma process, no second container, perfect for a single $5 VPS.",
        },
        {
          type: "text",
          md: [
            "`env.secret` doesn't hold values — it holds the NAMES of three environment variables Kamal expects to already exist in YOUR shell (or a password manager) at deploy time. `env.clear` is the opposite: `SOLID_QUEUE_IN_PUMA: true` is a plain, harmless boolean, safe to read by anyone who clones this repo, so it's committed directly, no secret machinery needed. The rule of thumb: if leaking it would let a stranger impersonate your app or spend your Stripe balance, it's `secret`. If it's just a config toggle, it's `clear`.",
            "```\n# committed, plain\nclear:\n  SOLID_QUEUE_IN_PUMA: true\n\n# committed as a NAME only — the value lives in your shell/password manager\nsecret:\n  - RAILS_MASTER_KEY\n```",
          ],
        },
        {
          type: "code",
          title: "config/deploy.yml (volumes, builder)",
          source: String.raw`# SQLite lives on disk, not in a separate DB server, so it must survive container recreation.
# This volume is mounted at the same path on every deploy — back it up off-server (e.g. litestream,
# a nightly ` + "`kamal app exec \"bin/rails db:dump\"`" + String.raw` + rsync, whatever fits your budget).
volumes:
  - "pawwalk_api_storage:/rails/storage"

# Configure the image builder.
builder:
  # Almost every $5 VPS is x86 (amd64). Building here on Apple Silicon (arm64) still produces
  # an amd64 image — Docker cross-builds via QEMU — it's just slower than a native build.
  arch: amd64`,
          caption: "Every Kamal deploy destroys the old container and starts a fresh one — SQLite files living INSIDE that container would vanish on every deploy. A named volume (`pawwalk_api_storage`) lives outside the container's lifecycle, so `db/production.sqlite3` and its siblings survive every redeploy untouched. `builder.arch: amd64` exists purely because most cheap VPS hosts sell x86 boxes, not the arm64 chip in your Mac.",
        },
        {
          type: "code",
          title: ".kamal/secrets",
          source: String.raw`# Secrets defined here are available for reference under registry/password, env/secret, builder/secrets,
# and accessories/*/env/secret in config/deploy.yml. All secrets should be pulled from either
# password manager, ENV, or a file. DO NOT ENTER RAW CREDENTIALS HERE! This file needs to be safe for git.

# Example of extracting secrets from 1password (or another compatible pw manager)
# SECRETS=$(kamal secrets fetch --adapter 1password --account your-account --from Vault/Item KAMAL_REGISTRY_PASSWORD RAILS_MASTER_KEY)
# KAMAL_REGISTRY_PASSWORD=$(kamal secrets extract KAMAL_REGISTRY_PASSWORD ` + "${SECRETS}" + String.raw`)
# RAILS_MASTER_KEY=$(kamal secrets extract RAILS_MASTER_KEY ` + "${SECRETS}" + String.raw`)

# Example of extracting secrets from Rails credentials
# KAMAL_REGISTRY_PASSWORD=$(rails credentials:fetch kamal.registry_password)

# Use a GITHUB_TOKEN if private repositories are needed for the image
# GITHUB_TOKEN=$(gh config get -h github.com oauth_token)

# Grab the registry password from ENV
# KAMAL_REGISTRY_PASSWORD=$KAMAL_REGISTRY_PASSWORD

# Improve security by using a password manager. Never check config/master.key into git!
RAILS_MASTER_KEY=$(cat config/master.key)

# This file is git-tracked but holds NO values — only references to a password manager, a file
# on disk, or the deploying shell's own ENV. Export these two in your shell (or wire them through
# a password manager like the 1Password example above) before running ` + "`kamal deploy`" + String.raw`.
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET`,
          caption: "This whole file is tracked in git — safe, because it's a PATTERN, not a payload. `RAILS_MASTER_KEY=$(cat config/master.key)` reads the actual key from a local, gitignored file at deploy time. `STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY` just forwards whatever's already in your shell's environment — the real value is never typed into this file, ever.",
        },
        {
          type: "quiz",
          q: "`.kamal/secrets` is committed to git and PawWalk's real repo history shows it. Why is that safe?",
          choices: [
            "The file only contains variable NAMES and references (`$(cat config/master.key)`, `$STRIPE_SECRET_KEY`) — the actual secret values live in a gitignored file or the deploying shell's environment, never in the committed file itself",
            "It's not actually safe — this is a mistake that should be fixed",
            "GitHub automatically encrypts any file named `secrets`",
            "Kamal scrubs the file's contents before every commit",
          ],
          answer: 0,
          explain: "Every line is a reference, not a value: `RAILS_MASTER_KEY=$(cat config/master.key)` shells out to read a local file that's gitignored separately (`config/master.key` itself never gets committed); `STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY` just forwards an existing shell variable. The pattern is safe to share; only the referenced values are sensitive, and those live elsewhere.",
          nudge: "Read every line again — is there a single raw credential typed anywhere in that file, or only ways of FINDING one?",
        },
        {
          type: "exercise",
          title: "Retype the env section",
          prompt: [
            "Retype `deploy.yml`'s `env` block: a `secret` list with `RAILS_MASTER_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`, then a `clear` map setting `SOLID_QUEUE_IN_PUMA` to `true`. (Comment-free — YAML indentation matters even though the checks below can't see it, so match the file's 2-space nesting by eye.)",
          ],
          starter: String.raw`env:
  # your code here
`,
          solution: String.raw`env:
  secret:
    - RAILS_MASTER_KEY
    - STRIPE_SECRET_KEY
    - STRIPE_WEBHOOK_SECRET
  clear:
    SOLID_QUEUE_IN_PUMA: true`,
          checks: [
            { re: /secret:/, hint: "Start the first list with `secret:`." },
            { re: /-RAILS_MASTER_KEY/, hint: "First secret: `- RAILS_MASTER_KEY`." },
            { re: /-STRIPE_SECRET_KEY/, hint: "Second secret: `- STRIPE_SECRET_KEY`." },
            { re: /-STRIPE_WEBHOOK_SECRET/, hint: "Third secret: `- STRIPE_WEBHOOK_SECRET`." },
            { re: /clear:/, hint: "Then a second key, `clear:`, for the plain config." },
            { re: /SOLID_QUEUE_IN_PUMA:true/, hint: "Under `clear`, set `SOLID_QUEUE_IN_PUMA: true` — no quotes needed, it's a YAML boolean." },
          ],
          success: "That's the real env block — three names Kamal reads from your shell at deploy time, and one plain boolean safe to commit as-is.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "prove-it-locally",
      title: "Prove It on Your Machine",
      label: "Over to the terminal",
      steps: [
        {
          type: "text",
          md: [
            "## You don't need a server to prove the deploy story",
            "Here's the whole point of this lesson: everything Kamal would do on a real VPS — build the image, boot the container, run `db:prepare`, serve traffic through Thruster — can be proven on YOUR laptop first, with plain `docker build` and `docker run`. No server, no domain, no waiting. This is exactly what was verified against this repo before a single Kamal command was ever written.",
          ],
        },
        {
          type: "xcode",
          title: "Run the real local production boot",
          label: "Over to the terminal",
          intro: [
            "From `apps/pawwalk-api`, build the exact image Kamal would ship, then boot it exactly like a real server would:",
          ],
          items: [
            "`docker build -t pawwalk-api .` — builds the full multi-stage image (about 90 seconds on a cold cache).",
            "`docker run -d --name pawwalk-smoke -p 3080:80 -e RAILS_MASTER_KEY=$(cat config/master.key) -e SOLID_QUEUE_IN_PUMA=true pawwalk-api` — boots it detached, mapping host port 3080 to the container's port 80 (Thruster).",
            "`curl localhost:3080/up` — expect `200`. That's the entrypoint's `db:prepare` having already created all four databases before Puma ever accepted a request.",
            "`curl localhost:3080/walkers` — expect the 4 seeded walkers (Luna Martinez, Sam Okafor, Priya Shah, Jonah Lee), auto-seeded on first boot.",
            "`docker logs pawwalk-smoke | tail -20` — read the boot log; the next section walks through exactly what you'll see.",
            "`docker rm -f pawwalk-smoke` — tear the smoke-test container down; you're done proving it.",
          ],
        },
        {
          type: "text",
          md: [
            "## Reading the real boot log, line by line",
            "This is a real, verified transcript from this exact repo — not a hypothetical. Four things happen, in order:",
          ],
        },
        {
          type: "code",
          title: "docker logs pawwalk-smoke (real, verified output)",
          source: String.raw`{"time":"2026-07-03T16:46:53Z","level":"INFO","msg":"Server started","http":":80"}
=> Booting Puma
=> Rails 8.1.3 application starting in production
Puma starting in single mode...
* Puma version: 8.0.2 ("Into the Arena")
*  Environment: production
* Listening on http://0.0.0.0:3000
Use Ctrl-C to stop
SolidQueue-1.4.0 Started Supervisor(fork) (22.8ms)  pid: 34, ...
SolidQueue-1.4.0 Started Dispatcher (7.1ms)  pid: 40, ...
SolidQueue-1.4.0 Started Worker (5.5ms)  pid: 44, ...
SolidQueue-1.4.0 Started Scheduler (25.0ms)  pid: 48, ...`,
          caption: "1) Thruster's JSON log line: `\"Server started\",\"http\":\":80\"` — it's listening FIRST, on the public port. 2) Puma boots underneath it, in `production`, on port 3000 (internal only — Thruster is the only thing the outside world ever touches). 3) Because `SOLID_QUEUE_IN_PUMA=true` was set, Solid Queue's Supervisor/Dispatcher/Worker/Scheduler all start INSIDE this same process — no second container.",
        },
        {
          type: "text",
          md: [
            "## What `db:prepare` actually did",
            "You never ran a migration command yourself — `bin/docker-entrypoint` did it automatically before Puma started. Proof is on disk, inside the container's mounted volume:",
            "```\n$ docker exec pawwalk-smoke ls storage/\nproduction.sqlite3\nproduction_cache.sqlite3\nproduction_queue.sqlite3\nproduction_cable.sqlite3\n```",
            "Four files, matching the four databases `database.yml`'s multi-database split declares: `primary` (your models), `cache` (Solid Cache), `queue` (Solid Queue), `cable` (Solid Cable/Action Cable). `db:prepare` created and migrated every one of them on a container that had NEVER seen this app before — that's the entire promise of a fresh-server first boot, proven without a server.",
          ],
        },
        {
          type: "quiz",
          q: "The boot log shows Thruster's `\"Server started\",\"http\":\":80\"` line BEFORE Puma's `Listening on http://0.0.0.0:3000` line. Why does Thruster start first, and why does it listen on 80 while Puma listens on 3000?",
          choices: [
            "Thruster is the process that owns the container's exposed port (80, from `EXPOSE 80` in the Dockerfile) and starts Puma as a child process listening internally on 3000 — Thruster is always the first and only thing the outside world (or `docker run -p`) can reach",
            "It's a random race condition with no significance — either could start first",
            "Puma refuses to start until Thruster confirms port 80 is free",
            "3000 is the public port and 80 is only for internal health checks",
          ],
          answer: 0,
          explain: "`CMD [\"./bin/thrust\", \"./bin/rails\", \"server\"]` runs Thruster as the entrypoint's actual process; Thruster binds the exposed port 80 and launches `bin/rails server` (Puma) as a subprocess on 3000. Every request from the outside — `curl localhost:3080/up` included — hits Thruster first, which proxies to Puma internally.",
          nudge: "Look at the Dockerfile's `CMD` line again — which binary is listed first, and what does it do with the other two arguments?",
        },
        {
          type: "exercise",
          title: "Retype the verified smoke-test commands",
          prompt: [
            "Retype, in order: the `docker run` command that boots `pawwalk-api` detached, named `pawwalk-smoke`, mapping host `3080` to container `80`, passing `RAILS_MASTER_KEY` from `config/master.key` and `SOLID_QUEUE_IN_PUMA=true`. Then the `curl` that checks the health endpoint on port 3080.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`docker run -d --name pawwalk-smoke -p 3080:80 -e RAILS_MASTER_KEY=$(cat config/master.key) -e SOLID_QUEUE_IN_PUMA=true pawwalk-api
curl localhost:3080/up`,
          checks: [
            { re: /docker run-d/, hint: "Start with `docker run -d` — detached, so your terminal isn't blocked." },
            { re: /--name pawwalk-smoke/, hint: "Name the container: `--name pawwalk-smoke`." },
            { re: /-p 3080:80/, hint: "Map host port 3080 to the container's exposed port 80: `-p 3080:80`." },
            { re: /-e RAILS_MASTER_KEY=\$\(cat config\/master\.key\)/, hint: "Pass the master key by reading the local file: `-e RAILS_MASTER_KEY=$(cat config/master.key)`." },
            { re: /curl localhost:3080\/up/, hint: "Check the health endpoint on the mapped port: `curl localhost:3080/up`." },
          ],
          mustNot: [
            { re: /-p 3000:3000/, hint: "Don't map port 3000 — the container exposes 80 (Thruster), not 3000 (the internal Puma port)." },
          ],
          success: "That's the exact verified command pair — the same one that proved this whole deploy story works before any real server existed.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "ship-it-graduation",
      title: "Ship It & Graduation",
      steps: [
        {
          type: "text",
          md: [
            "## When you actually have a server (optional — no VPS exists yet)",
            "Everything below is the real path for the day you rent a $5 VPS. It's not simulated in this course — there's no live PawWalk server anywhere — but every command is exactly what you'd run, in order, against `apps/pawwalk-api` as it stands right now.",
          ],
        },
        {
          type: "text",
          md: [
            "## The five-command path",
            "1. **Buy a VPS** (Hetzner, DigitalOcean, anywhere) and **point a domain's DNS A record** at its IP. Put the IP in `config/deploy.yml`'s `servers.web`, the domain in `proxy.host`.\n2. **Create a Docker Hub account** (or any registry) and put your username in `image:` / `registry.username`.\n3. **Export four values** in your deploy shell: `KAMAL_REGISTRY_PASSWORD` (a Docker Hub access token), plus the three `.kamal/secrets` need — `RAILS_MASTER_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.\n4. **`kamal setup`** — first time only. Installs Docker on the server if it's missing, builds and pushes the image, boots the proxy AND the app container, and gets a Let's Encrypt cert for `proxy.host`.\n5. **`kamal deploy`** — every deploy after that. Builds the new image, pushes it, and swaps the running container for the new one with zero downtime — the old container keeps serving until the new one is healthy.",
            "Day-to-day after that: `kamal app logs -f` tails production logs, `kamal console` opens a live `bin/rails console` on the server — both are the `logs`/`console` aliases already defined in `deploy.yml`.",
          ],
        },
        {
          type: "quiz",
          q: "You already ran `kamal setup` once, weeks ago. You just fixed a bug and want it live. Which command do you run — and why not `kamal setup` again?",
          choices: [
            "`kamal deploy` — it builds and pushes the new image and swaps the running container with zero downtime; `kamal setup` is a one-time first-boot step (installs Docker, gets the first cert) that you don't need to repeat",
            "`kamal setup`, every single time — it's the only command that pushes new code",
            "`kamal app logs`, since that's what redeploys the app",
            "You'd have to SSH in and manually `git pull` and restart Puma",
          ],
          answer: 0,
          explain: "`kamal setup` provisions a server from scratch — installing Docker, booting the proxy, requesting the first TLS cert. Running it repeatedly is harmless but wasteful. `kamal deploy` is the repeatable, day-to-day command: build, push, swap containers, zero downtime. Every deploy after the first one is `kamal deploy`.",
          nudge: "Which of the two commands sounds like a first-time provisioning step, and which sounds like something you'd do every time you fix a bug?",
        },
        {
          type: "text",
          md: [
            "## Graduation Day",
            "Sixteen modules ago, `walker_name = \"Priya\"` with no `let` in front of it was the whole lesson. Now look at what you can read — and write:",
            "- **Ruby itself** — objects, blocks, symbols, `nil`, conditionals, methods with implicit returns, classes and modules, idioms and error handling (modules 01–04)\n- **The web, one layer down** — Rack, then Rails' MVC anatomy on top of it (modules 05–06)\n- **ActiveRecord and REST** — migrations, associations, validations, a real controller's seven actions (modules 07–08)\n- **The real PawWalk API** — auth with JWTs, a `Booking` model that enforces money and ownership rules the controller can't bypass, Stripe payments and background jobs, live GPS tracking over Action Cable, and 66 passing tests (modules 09–14)\n- **And today** — a production container, built and booted by YOUR OWN hands, proven with real `curl` output before any server existed",
          ],
        },
        {
          type: "text",
          md: [
            "## The repo, right now, green",
            "This isn't a claim — it's what running the loop against `apps/pawwalk-api` prints today:",
            "```\n$ bin/rails test\n66 runs, 171 assertions, 0 failures, 0 errors, 0 skips\n\n$ bin/rubocop\n70 files inspected, no offenses detected\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## What to build next",
            "PawWalk's owner-side is complete, but a real product keeps growing. Three honest next steps: **walker-side auth** (right now only owners sign up — a walker needs their own login and a dashboard of their own bookings), **reviews** (owners rate walkers after a walk completes — a natural `has_many :reviews` off both `User` and `Walker`), and a **real frontend** — this course only ever spoke to the API with `curl`. The PawWalk iOS course builds exactly that: a SwiftUI client that talks to THIS backend, the same JSON you've been reading all along.",
            "Where to keep learning: the [Rails Guides](https://guides.rubyonrails.org) for anything this course didn't cover, the [Solid stack](https://github.com/rails/solid_queue) docs (Solid Queue/Cache/Cable — the whole reason this app needs no Redis or Postgres), and [kamal-deploy.org](https://kamal-deploy.org) for everything Kamal can do beyond a single server.",
          ],
        },
        {
          type: "text",
          md: [
            "## You built the whole thing",
            "Sixteen modules ago you didn't know Ruby had no `let`. Now you've read and retyped the real auth, the real money-handling model validation, the real Stripe webhook, the real GPS broadcast, and the real Dockerfile and Kamal config that ship it — every one straight from `apps/pawwalk-api`, not a toy copy. That's a complete, tested, deployable Rails API, and you understand every file it touches.",
            "Congratulations, graduate. 🎓🐾",
          ],
        },
        {
          type: "quiz",
          q: "Capstone. Trace a real request end to end: `curl https://api.pawwalk.example/bookings` arrives with a valid `Authorization: Bearer` header. Put every layer it passes through in order, up to the JSON response.",
          choices: [
            "Kamal's proxy (terminates TLS) → Thruster (HTTP/2, caching, proxies to Puma) → Puma → Rails router (`config/routes.rb`) → the `Authentication` concern (verifies the JWT, sets `current_user`) → `BookingsController#index` → `current_user.bookings.includes(...).order(...)` → SQLite → `booking_payload` JSON → back out the same chain",
            "The request goes straight from the internet to SQLite, and Rails formats the response afterward",
            "Thruster checks the JWT itself, before Rails ever sees the request",
            "Kamal's proxy runs the ActiveRecord query directly, bypassing the Rails app entirely",
          ],
          answer: 0,
          explain: "Every hop matters and none can be skipped: Kamal's proxy is the only thing that ever sees the real TLS handshake; it hands plain HTTP to Thruster, which hands it to Puma, which is where Rails' router, the `Authentication` concern (module 10), and `BookingsController` (module 11) all live. `current_user.bookings` — never bare `Booking` — scopes the SQLite query to the JWT's own user, and `booking_payload` shapes the JSON that travels all the way back out through the same chain in reverse.",
          nudge: "Work backward from the response: what has to be true before `BookingsController#index` can even run — who checked the JWT, and who terminated the TLS in the first place?",
        },
      ],
    },
  ],
});
