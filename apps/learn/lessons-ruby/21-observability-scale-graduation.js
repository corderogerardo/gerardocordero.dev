// Module 21 — Observability, Scale & Graduation (SENIOR graduation, capping modules 0-20).
// See FORMAT.md + FORMAT-RUBY.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "observability-scale-graduation",
  title: "Observability, Scale & Graduation",
  emoji: "🎓",
  lang: "ruby",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "instrumenting-rails",
      title: "Instrumenting Rails",
      steps: [
        {
          type: "text",
          md: [
            "## Rails is already telling you everything — you just aren't listening",
            "Every SQL query, every controller action, every cache hit or miss inside a running Rails app fires an event through **`ActiveSupport::Notifications`** — Rails' built-in pub/sub bus. You don't have to add anything to get these events; Rails emits them whether you're watching or not. `subscribe` is how you start watching: give it an event name and a block, and that block runs every time the event fires, anywhere in the app.",
            "This is the same idea as the Python course's observability module (three pillars: logs, metrics, traces) — this lesson is that same idea, one layer down, using the instrumentation Rails ships with instead of a Python library.",
            "The event names follow a `action.library` pattern: `sql.active_record` fires for every query, and `process_action.action_controller` fires once per controller action (with the render time, DB time, and status baked in). Each `sql.active_record` payload carries the query and how long it took, so subscribing and checking the duration is exactly how you'd catch a slow query in production without ever attaching a profiler.",
          ],
        },
        {
          type: "code",
          title: "config/initializers/slow_query_logger.rb",
          source: String.raw`ActiveSupport::Notifications.subscribe("sql.active_record") do |*args|
  event = ActiveSupport::Notifications::Event.new(*args)
  Rails.logger.warn("slow query (#{event.duration.round}ms): #{event.payload[:sql]}") if event.duration > 100
end`,
          caption: "`subscribe(\"sql.active_record\") do |*args| ... end` runs this block for EVERY query, app-wide — no query call site has to opt in. `ActiveSupport::Notifications::Event.new(*args)` turns the raw arguments into an object with `.duration` (milliseconds) and `.payload` (a hash with `:sql`, `:name`, `:binds`). The `if event.duration > 100` guard means normal fast queries never touch the logger at all — only the slow ones get written.",
        },
        {
          type: "text",
          md: [
            "## `lograge` — one line per request, not five",
            "Rails' DEFAULT log for a single request is multiple lines: a `Started GET` line, a `Processing by` line, one line per query, a `Rendered` line, then a `Completed` line — scattered across five-plus log lines for ONE request. That's fine to read by eye on your laptop; it's miserable to aggregate. A log aggregator (Datadog, CloudWatch, or just `grep`) wants **one line per request** with a consistent set of fields, because that's a shape it can query and filter on.",
            "`lograge` collapses that whole multi-line story into a single structured line — `method=GET path=/walkers status=200 duration=12.4 db=3.1` — by subscribing to the SAME `process_action.action_controller` notification Rails already emits. It's not a rewrite of your logging; it's a formatter that intercepts the one event that already carries everything a request's log line needs (status, duration, controller, action) and prints it once, in one shape, instead of five.",
          ],
        },
        {
          type: "quiz",
          q: "What does `ActiveSupport::Notifications` give you for free, before you write a single subscriber?",
          choices: [
            "Rails already emits events for SQL queries, controller actions, and cache hits during every request — `subscribe` just lets you listen to events that are firing whether or not anyone's watching",
            "It automatically ships your logs to a third-party service like Datadog with no configuration",
            "It only works if you add a gem first — Rails itself emits nothing on its own",
            "It replaces `Rails.logger` entirely, so you can no longer call `.info`/`.warn` directly",
          ],
          answer: 0,
          explain: "The instrumentation is already running inside every Rails app — `sql.active_record`, `process_action.action_controller`, and more fire on every request whether or not you ever call `.subscribe`. Subscribing doesn't create the events, it just taps into a stream that was already there.",
          nudge: "Does a query need to know it's being watched for `sql.active_record` to fire?",
        },
        {
          type: "exercise",
          title: "Subscribe to the slow-query event",
          prompt: [
            "Write an `ActiveSupport::Notifications.subscribe` call for the `\"sql.active_record\"` event, whose block takes `*args` (do nothing else inside it for this exercise).",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`ActiveSupport::Notifications.subscribe("sql.active_record") do |*args|
end`,
          checks: [
            { re: /ActiveSupport::Notifications\.subscribe\("sql\.active_record"\)/, hint: "Call `ActiveSupport::Notifications.subscribe(\"sql.active_record\")` — the event name is a string, in quotes." },
            { re: /do\|\*args\|/, hint: "The block takes a splat: `do |*args|` — `Event.new(*args)` (seen in the lesson) is how you'd unpack it later." },
          ],
          mustNot: [],
          success: "That's a real subscriber — Rails will call this block for every single SQL query the app runs, from now until the process exits.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "scaling-the-database",
      title: "Scaling the database",
      steps: [
        {
          type: "text",
          md: [
            "## One connection per request adds up fast",
            "Every Rails request checks a database connection out of a pool, uses it, and checks it back in. That pool is capped (`database.yml`'s `max_connections`, from module 09) — fine at low traffic, but at real scale, hundreds of Puma threads across multiple servers can each want a connection at once, and Postgres itself has a hard ceiling on how many connections it will accept. **`PgBouncer`** sits in front of Postgres as a lightweight connection pooler: your app connects to PgBouncer, which multiplexes many app-side connections onto a much smaller number of real Postgres connections. The database sees far fewer connections; your app doesn't have to change a line of Ruby to get that.",
            "The other lever is **read replicas** — one or more read-only copies of the primary database, kept in sync automatically. A read-heavy API (and PawWalk's `GET /walkers`, `GET /bookings` far outnumber writes) can send SELECTs to a replica, leaving the primary free to handle writes and anything that needs the absolute latest data.",
            "Rails' own **multi-database support** makes this a config change, not a rewrite: `connects_to database: { writing: :primary, reading: :replica }` tells a model (or `ApplicationRecord` itself) which named connection in `database.yml` to use for writes vs. reads. Pair it with `ActiveRecord::Base.connected_to(role: :reading) { ... }` around a block, or Rails' automatic role-switching middleware, and GET requests transparently route to the replica while POST/PATCH/DELETE stay on the primary — no controller code has to know which database it's talking to.",
            "This builds directly on modules 16-17: N+1 fixes and caching reduce HOW MANY queries you run; replicas and pooling change WHERE those queries land once you can't reduce the count any further.",
          ],
        },
        {
          type: "code",
          title: "config/database.yml — a production replica entry",
          source: String.raw`production:
  primary:
    adapter: postgresql
    database: pawwalk_production
    host: <%= ENV["PRIMARY_DB_HOST"] %>
  primary_replica:
    adapter: postgresql
    database: pawwalk_production
    host: <%= ENV["REPLICA_DB_HOST"] %>
    replica: true`,
          caption: "`replica: true` is the flag that tells Rails this entry is read-only — it refuses to run a write against it, so a mistake never lands on the replica. Two named connections, one database, two hosts.",
        },
        {
          type: "code",
          title: "app/models/application_record.rb — routing writes and reads",
          source: String.raw`class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  connects_to database: { writing: :primary, reading: :primary_replica }
end`,
          caption: "Every model inherits this unless it overrides `connects_to` itself. `writing: :primary` and `reading: :primary_replica` name the two `database.yml` entries above — from here, Rails' automatic role switching (built into the Rails 8 API-only middleware stack) sends GET/HEAD requests through the `reading` connection and everything else through `writing`.",
        },
        {
          type: "exercise",
          title: "Write a connects_to database block",
          prompt: [
            "Inside a model, write `connects_to database: { writing: :primary, reading: :replica }` — a hash with exactly those two keys and symbol values.",
          ],
          starter: String.raw`class ApplicationRecord < ActiveRecord::Base
  # your code here
end`,
          solution: String.raw`class ApplicationRecord < ActiveRecord::Base
  connects_to database: { writing: :primary, reading: :replica }
end`,
          checks: [
            { re: /connects_to database:\{/, hint: "Start with `connects_to database: { ... }` — `database:` takes a hash." },
            { re: /writing::primary/, hint: "The hash needs a `writing: :primary` entry — writes go to the primary database." },
            { re: /reading::replica/, hint: "And a `reading: :replica` entry — reads route to the replica." },
          ],
          mustNot: [],
          success: "That's the exact Rails 8 pattern for automatic read/write splitting — no controller ever has to pick a connection by hand.",
        },
        {
          type: "quiz",
          q: "Why does adding a read replica help a read-heavy API like PawWalk's?",
          choices: [
            "It gives GET-heavy traffic (walkers, bookings listings) a separate database to query, so those reads don't compete with writes for the primary's connections and resources — the primary stays free for the smaller volume of writes",
            "A replica makes every write instantly faster because there are now two databases sharing the work",
            "Replicas remove the need for indexes, since queries are automatically faster on a second machine",
            "A replica lets you skip database migrations on the primary — you can migrate the replica instead",
          ],
          answer: 0,
          explain: "A replica doesn't speed up any single query — it adds CAPACITY by giving read traffic somewhere else to go. For an API where reads vastly outnumber writes, that means the primary isn't constantly contended between serving GETs and handling the writes that actually need to be there.",
          nudge: "A replica is read-only — so what kind of traffic can it take off the primary's plate, and what kind can it never help with?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "scaling-background-work",
      title: "Scaling background work",
      steps: [
        {
          type: "text",
          md: [
            "## One big queue becomes one big bottleneck",
            "Module 12 introduced Solid Queue for background jobs — email confirmations, webhook handling. At real volume, dumping every job into ONE queue means a burst of low-priority work (say, a batch of confirmation emails) can sit ahead of something time-critical (a payout), just because it got enqueued first. The fix is **separate named queues**: `queue_as :payments`, `queue_as :mailers`, `queue_as :default`, each with its own **priority** and its own **concurrency limit** — a cap on how many jobs from that queue run at once, so one noisy queue can't starve the workers every other queue needs.",
            "Failures are a fact of background work — a network blip, a momentary database lock. `retry_on` tells a job how to react to a specific error instead of just dying: `retry_on ActiveRecord::Deadlocked, wait: :polynomially_longer, attempts: 5` retries automatically, waiting longer between each attempt (**exponential backoff**) instead of hammering the same failure five times in a row.",
            "Here's the rule that makes retries safe at all: every job MUST be **idempotent** — running it twice (or five times) has to produce the SAME result as running it once. Ties directly back to module 19's payout job: if a payout job isn't idempotent and Solid Queue retries it after a timeout that actually succeeded, a walker gets paid twice for the same booking. The unique idempotency key from module 19 is exactly what makes a retried payout safe — the second attempt recognizes the first one already happened and does nothing.",
            "Once queues are split by priority, the next question is whether they're keeping up — **monitoring queue depth** (how many jobs are waiting, per queue) tells you that. A `payments` queue with a growing backlog is a signal to add workers or investigate a stuck job, long before a user notices anything's wrong.",
          ],
        },
        {
          type: "code",
          title: "app/jobs/payout_job.rb — priority queue + safe retry",
          source: String.raw`class PayoutJob < ApplicationJob
  queue_as :payments

  retry_on ActiveRecord::Deadlocked, wait: :polynomially_longer, attempts: 5

  def perform(booking_id)
    booking = Booking.find(booking_id)
    LedgerEntry.record_payout!(booking) # module 19's idempotency key makes this safe to retry
  end
end`,
          caption: "`queue_as :payments` puts this job in its own named queue — `config/queue.yml` can then give `payments` a higher priority and its own worker concurrency, separate from `mailers` or `default`. `retry_on ActiveRecord::Deadlocked` only catches THAT error class; anything else still raises and needs its own handling. `wait: :polynomially_longer` spaces the five attempts out instead of retrying instantly five times in a row.",
        },
        {
          type: "exercise",
          title: "Configure a payments job",
          prompt: [
            "Inside a job class, write `queue_as :payments` on its own line, then `retry_on ActiveRecord::Deadlocked` on the next.",
          ],
          starter: String.raw`class PayoutJob < ApplicationJob
  # your code here
end`,
          solution: String.raw`class PayoutJob < ApplicationJob
  queue_as :payments
  retry_on ActiveRecord::Deadlocked
end`,
          checks: [
            { re: /queue_as:payments/, hint: "First line: `queue_as :payments` — routes this job into its own named queue." },
            { re: /retry_on ActiveRecord::Deadlocked/, hint: "Second line: `retry_on ActiveRecord::Deadlocked` — automatically retries on that specific error." },
          ],
          mustNot: [],
          success: "That's a job set up the way a real payout job should be: its own priority queue, and a retry rule scoped to exactly the failure it's meant to survive.",
        },
        {
          type: "quiz",
          q: "Why split jobs into separate named queues by priority instead of dumping everything into one big queue?",
          choices: [
            "One queue means a burst of low-priority jobs (bulk emails) can sit ahead of urgent ones (payouts) just by arriving first; separate queues each get their own priority and concurrency limit, so a noisy queue can't starve the workers a time-critical queue needs",
            "Solid Queue technically only supports one job running at a time, so queues are just a labeling convenience with no real effect",
            "Named queues make jobs run faster individually — each job itself executes quicker in a named queue",
            "It's purely for readability in the admin dashboard; it has no effect on execution order or worker allocation",
          ],
          answer: 0,
          explain: "Queue name is what lets you assign different priority and concurrency to different KINDS of work. Without that split, a flood of one low-priority job type can occupy every available worker, and there's no way to say \"payments jobs matter more\" — everything is first-come-first-served in the one queue.",
          nudge: "If every job type shares one queue with one concurrency limit, what happens to an urgent job that gets enqueued right after a thousand low-priority ones?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "ship-it-graduation",
      title: "Ship it & graduation",
      steps: [
        {
          type: "text",
          md: [
            "## The deploy story, one more time",
            "Module 15 walked the whole Kamal 2 story: a `Dockerfile` that builds a slim production image, `config/deploy.yml` naming the server/registry/proxy, and `kamal deploy` swapping the running container for a new one with zero downtime. Nothing about THAT story changes as the app scales — the same `kamal deploy` that shipped day one still ships today. What changes is everything ABOVE it in this module: more queues, a replica, structured logs — all running inside the exact same deploy pipeline module 15 already proved works.",
          ],
        },
        {
          type: "code",
          title: "Terminal — the same command, a much bigger app behind it",
          source: String.raw`$ kamal deploy
Acquiring the deploy lock...
Ensuring Docker is installed...
Building image...
Pushing image...
Running docker::registry_login...
Pulling image...
Starting new container...
Health check successful, deploying...
Stopping old container...
Releasing the deploy lock...
  Finished all in 42.1s`,
          caption: "Same command, module 15 through today. Kamal never cares how many models, queues, or replicas are behind the container — it only cares that the new one passes its health check before the old one stops.",
        },
        {
          type: "text",
          md: [
            "## What you built, start to finish",
            "Module 0 was `puts \"hello\"` with no `let` in front of anything. Here's the arc that got from there to here:",
            "- **Ruby itself** — objects, blocks, symbols, classes, modules, idioms and error handling (modules 01-04)\n- **The web, one layer down** — Rack, then Rails' MVC anatomy (modules 05-06)\n- **ActiveRecord and REST** — migrations, associations, validations, a real controller's actions (modules 07-08)\n- **The real PawWalk API** — JWT auth, bookings, Stripe payments, background jobs, live GPS over Action Cable, a full test suite (modules 09-14)\n- **Deploy** — a real Dockerfile, a real Kamal config, a verified local production boot (module 15)\n- **Senior-level depth** — N+1 fixes and indexes, caching layers, a Hotwire admin surface, a double-entry money ledger, versioning/pagination/rate limiting/security scanning (modules 16-20)\n- **And today** — instrumentation that watches the app run, a database that can scale past one box, background jobs that survive retries without double-charging anyone, and graduation",
            "That's a hardened, observable, horizontally-scalable JSON API with auth, payments, a reconciled ledger, real-time tracking, and rate limiting — read and retyped from the real, running repo, not a toy copy.",
          ],
        },
        {
          type: "text",
          md: [
            "## Where to go from here",
            "This course showed you Rails' own answers: `ActiveSupport::Notifications` and `lograge` instead of a third-party APM, `connects_to` instead of a bespoke sharding library, Solid Queue's named queues instead of Sidekiq+Redis. Real production systems often layer a paid APM (Datadog, Honeycomb, New Relic) on top of exactly the events this module showed you how to subscribe to — the concepts transfer, only the dashboard changes. Congratulations, graduate. 🎓🐾",
          ],
        },
        {
          type: "quiz",
          q: "Capstone. A payout job fails halfway through (a deadlock) and Solid Queue retries it automatically five minutes later. What actually prevents the walker from being paid twice?",
          choices: [
            "The job's underlying operation is idempotent — module 19's unique idempotency key on the ledger entry means the retried attempt recognizes the payout already happened and does nothing, regardless of how many times the job runs",
            "`retry_on` automatically detects duplicate payouts and blocks them itself, with no help needed from the job's own code",
            "Solid Queue guarantees every job runs exactly once, so a retry after a deadlock can never actually happen twice",
            "Kamal's zero-downtime deploy is what prevents the duplicate — it ensures only one container is ever running",
          ],
          answer: 0,
          explain: "`retry_on` only controls WHEN a job runs again — it says nothing about whether running it twice is safe. That safety has to come from the job's own logic: module 19's idempotency key on the ledger entry is what makes a second attempt a no-op instead of a second payout. Retries and idempotency are two different concerns that both have to be right.",
          nudge: "`retry_on` decides whether to run the job again. What decides whether running it again is actually safe?",
        },
      ],
    },
  ],
});
