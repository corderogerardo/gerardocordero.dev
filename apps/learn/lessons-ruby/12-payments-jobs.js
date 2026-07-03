// Module 12 — Payments & Background Jobs. See FORMAT.md + FORMAT-RUBY.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "pawwalk-payments",
  title: "Payments & Background Jobs",
  emoji: "💳",
  lang: "ruby",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "how-card-payments-work",
      title: "How Card Payments Work",
      steps: [
        {
          type: "text",
          md: [
            "## Three actors, not two",
            "Every booking so far has been free of money — module 11 computed a `price_cents`, but nothing actually charged anyone. This module wires up the real thing, and the first surprise is that it's never just \"your app talks to Stripe.\" There are three actors: the **mobile app** on the owner's phone, **PawWalk's server** (the Rails app you've been building), and **Stripe** itself. All three talk to each other, but not in the pattern you'd guess.",
            "The card number ITSELF only ever travels between the mobile app and Stripe, directly — never through your server. That's not a design choice you get to make casually; it's closer to a hard rule of the industry.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why your server never sees a card number",
            "Storing or even transmitting raw card numbers puts you under **PCI DSS** — a strict, expensive compliance standard for anyone who touches card data directly. Stripe solves this for you with a client-side SDK: the mobile app collects the card details and sends them straight to Stripe's servers, never to `apps/pawwalk-api`. Your server's job shrinks to something much narrower and much safer to get wrong less catastrophically: create a **PaymentIntent** (Stripe's object for \"we intend to charge this amount, eventually\"), hand the mobile app a `client_secret`, and let the mobile app finish the confirmation directly with Stripe using that secret. Your database ends up storing a Stripe payment intent ID and a status — never a card number, an expiry date, or a CVV.",
          ],
        },
        {
          type: "text",
          md: [
            "## The PaymentIntent lifecycle",
            "Four steps, in order, and no step skips ahead of the one before it:",
            "1. Your server calls `Stripe::PaymentIntent.create(amount:, currency:, metadata:)` — Stripe creates the intent and hands back a `client_secret`.\n2. Your server returns that `client_secret` to the mobile app.\n3. The mobile app's Stripe SDK uses the `client_secret` to confirm the payment with a real card — this step never touches your server at all.\n4. Stripe processes the card, and tells YOUR server the outcome asynchronously, by calling a **webhook** — an HTTP endpoint Stripe `POST`s to whenever something happens. Lesson 3 is entirely about that last step.",
            "Notice the async gap between step 1 and step 4: your server's `pay` request finishes (with a `client_secret`, not a final answer) long before the card actually clears. \"Did it work?\" isn't a question your `create` action can answer — only the webhook can.",
          ],
        },
        {
          type: "text",
          md: [
            "## Test mode: fake cards, real API",
            "Stripe has a **test mode** with its own fake API keys and a set of well-known fake card numbers (`4242 4242 4242 4242` always succeeds, others are built to always decline). Everything you call — `PaymentIntent.create`, webhooks, signatures — is the exact same real API surface production uses; only the money is fake. That matters for this module specifically: **there's no Stripe API key configured on this machine**, so every exercise and checklist item below is built to work with zero Stripe account. Lesson 5's OPTIONAL item is the one place you can plug in a free test-mode account if you want to see a real `client_secret` come back.",
          ],
        },
        {
          type: "code",
          title: "app/models/payment.rb",
          source: String.raw`class Payment < ApplicationRecord
  belongs_to :booking

  enum :status, { processing: "processing", succeeded: "succeeded", failed: "failed" }

  validates :amount_cents, numericality: { only_integer: true, greater_than: 0 }
end`,
          caption: "The whole real file. One association, one string-backed enum (same pattern as `Booking#status` from module 11), one validation. A `Payment` is deliberately thin — Stripe holds the complicated state, this row just tracks where PawWalk's copy of it stands.",
        },
        {
          type: "code",
          title: "db/migrate/20260703160738_create_payments.rb",
          source: String.raw`class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_table :payments do |t|
      t.references :booking, null: false, foreign_key: true, index: { unique: true }
      t.integer :amount_cents, null: false
      t.string :stripe_payment_intent_id
      t.string :status, default: "processing"

      t.timestamps
    end

    add_index :payments, :stripe_payment_intent_id
  end
end`,
          caption: "`index: { unique: true }` on the `booking` reference is the whole \"one payment per booking\" rule, enforced at the database — the same layer-that-can't-be-bypassed idea module 11 taught with `dog_belongs_to_booker`, just expressed as a unique index instead of a validation. `status` defaults to `\"processing\"` right in the schema, so a freshly created Payment is never in an ambiguous state even before your Ruby code sets anything.",
        },
        {
          type: "quiz",
          q: "Why does the mobile app's Stripe SDK talk to Stripe directly, instead of sending the card number to PawWalk's server first?",
          choices: [
            "So PawWalk's server never touches raw card data — handling it directly would put the app under strict, expensive PCI compliance requirements",
            "Because Rails API-only apps are technically incapable of accepting file uploads or long strings",
            "It's purely a speed optimization — talking to Stripe directly is faster than routing through your own server first",
            "Because `Stripe::PaymentIntent.create` requires the card number as an argument, so it must come from the client SDK",
          ],
          answer: 0,
          explain: "The card number never has a reason to visit your server at all. Stripe's client SDK collects it and confirms directly with Stripe; your server only ever handles an intent and a status, which keeps you out of PCI DSS's strictest requirements.",
          nudge: "Think about what compliance burden you'd take on the moment your own server code so much as reads a card number, even without storing it.",
        },
        {
          type: "exercise",
          title: "Retype the Payment model",
          prompt: [
            "Retype `Payment`'s real body: `belongs_to :booking`, the string-backed `enum :status` with exactly three states (`processing`, `succeeded`, `failed`), and the `amount_cents` validation (must be an integer greater than 0).",
          ],
          starter: String.raw`class Payment < ApplicationRecord
  # your code here
end`,
          solution: String.raw`class Payment < ApplicationRecord
  belongs_to :booking

  enum :status, { processing: "processing", succeeded: "succeeded", failed: "failed" }

  validates :amount_cents, numericality: { only_integer: true, greater_than: 0 }
end`,
          checks: [
            { re: /belongs_to:booking/, hint: "Start with the association: `belongs_to :booking`." },
            { re: /enum:status,\{processing:"processing",succeeded:"succeeded",failed:"failed"\}/, hint: "The enum has exactly three string-backed states, in order: `processing`, `succeeded`, `failed`." },
            { re: /validates:amount_cents,numericality:\{only_integer:true,greater_than:0\}/, hint: "Validate `amount_cents` with `numericality: { only_integer: true, greater_than: 0 }`." },
          ],
          mustNot: [
            { re: /enum:status,\{processing:0/, hint: "This enum is string-backed, not integer-backed — every value is a quoted string." },
          ],
          success: "That's the real Payment model — thin on purpose, because Stripe owns the complicated state and this row just mirrors it.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "the-pay-endpoint",
      title: "The Pay Endpoint",
      steps: [
        {
          type: "text",
          md: [
            "## Config lives in ENV, not in code",
            "Before the endpoint itself, one line decides where the Stripe secret key comes from:",
          ],
        },
        {
          type: "code",
          title: "config/initializers/stripe.rb",
          source: String.raw`Stripe.api_key = ENV["STRIPE_SECRET_KEY"] if ENV["STRIPE_SECRET_KEY"].present?`,
          caption: "One line, guarded. If `STRIPE_SECRET_KEY` isn't set — true for this machine right now — `Stripe.api_key` is simply never assigned, and the app boots fine either way.",
        },
        {
          type: "text",
          md: [
            "Notice what's absent: no key is hardcoded anywhere, and there's no fallback default string. Secrets that live in code get committed to git, shipped to every environment identically, and rotated by editing source and redeploying. Secrets that live in `ENV` can differ between your laptop, CI, and production, and rotate by changing a value in your hosting provider's dashboard — no code change, no deploy. This is one line of the **12-factor app** philosophy (config lives in the environment, not the codebase) — you'll meet it again properly in module 15, where the rest of PawWalk's secrets get the same treatment.",
            "The `if ENV[\"STRIPE_SECRET_KEY\"].present?` guard is what makes this file safe to boot on a machine with no key at all — exactly the machine this course runs on.",
          ],
        },
        {
          type: "text",
          md: [
            "## The route: nested under a booking",
            "Paying isn't a standalone resource — a payment only ever exists FOR a booking, so the route nests under it, same shape as `location_pings` from module 10:",
            "```\nresource :pay, only: :create, controller: :payments\n```",
            "That line (inside `resources :bookings do ... end` from module 11's `routes.rb`) generates exactly one route: `POST /bookings/:booking_id/pay`, handled by `PaymentsController#create`. Singular `resource` (no `s`) because there's exactly one \"pay\" action per booking, not a list of them.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/payments_controller.rb",
          source: String.raw`class PaymentsController < ApplicationController
  def create
    booking = current_user.bookings.find(params[:booking_id])

    if !booking.pending? || booking.payment.present?
      render json: { error: "only pending bookings can be paid" }, status: :unprocessable_content
      return
    end

    intent = Stripe::PaymentIntent.create(
      amount: booking.price_cents,
      currency: "usd",
      metadata: { booking_id: booking.id }
    )

    # amount is the booking's price, never client input — same money rule as Booking#compute_price!
    payment = booking.create_payment!(amount_cents: booking.price_cents, stripe_payment_intent_id: intent.id)

    render json: {
      payment: { id: payment.id, status: payment.status, amount_cents: payment.amount_cents },
      client_secret: intent.client_secret
    }, status: :created
  end
end`,
          caption: "The full, real file. `current_user.bookings.find` is module 11's scoping rule again — a stranger's booking 404s here too, not 403.",
        },
        {
          type: "text",
          md: [
            "## The guards: pending-only, no double-pay",
            "`if !booking.pending? || booking.payment.present?` packs two separate rules into one guard: a booking can only be paid while it's still `pending` (not already `confirmed`, not `cancelled`), AND it can't already have a `payment` row — that unique index from lesson 1 backs this check up at the database layer too, so even a race condition can't slip two payments onto one booking. Either condition renders the same 422 with the same message; the caller doesn't need to know which rule tripped, just that paying isn't allowed right now.",
            "## The intent: amount from the BOOKING, never params",
            "Look at `amount: booking.price_cents` — not `params[:amount]`, not anything the client's JSON body could influence. This is module 11's money rule again, word for word: the server computes the price once (`Booking#compute_price!`), and every place downstream that needs a dollar amount — including the Stripe API call — reads it back off the model, never off client input. If a client's request body included `{\"amount\": 1}`, `Stripe::PaymentIntent.create` would never see it; there's no code path that even looks at that key.",
            "`metadata: { booking_id: booking.id }` is what makes the webhook (lesson 3) able to find its way back to this exact booking later — Stripe stores whatever metadata you attach and echoes it back on every event about that intent.",
            "## `client_secret` — the handoff to the mobile client",
            "The response includes `intent.client_secret` alongside the `Payment` row's own fields. That secret is the ONE thing the mobile app needs to finish the confirmation directly with Stripe — the async step 3 from lesson 1's lifecycle. Your server's job ends the moment this response goes out; the actual charge happens somewhere your Rails process never sees.",
          ],
        },
        {
          type: "quiz",
          q: "A client sends `POST /bookings/42/pay` with a JSON body of `{\"amount\": 1}`. What amount does the resulting Stripe PaymentIntent actually get created for?",
          choices: [
            "`booking.price_cents` — the server-computed price already stored on the booking; the request body's `amount` key is never read",
            "1 cent — the client's `amount` overrides the booking's stored price",
            "The request fails with a 422 because `amount` isn't a permitted param",
            "The sum of the client's `amount` and the booking's `price_cents`",
          ],
          answer: 0,
          explain: "`Stripe::PaymentIntent.create(amount: booking.price_cents, ...)` reads the amount straight off the booking model — there's no `params[:amount]` anywhere in the action, so a client-supplied amount has nothing to override.",
          nudge: "Find the line that builds the Stripe PaymentIntent. Whose value does `amount:` come from — the request, or the booking?",
        },
        {
          type: "exercise",
          title: "The guards and the intent",
          prompt: [
            "Inside `create`, write the guard: unless `booking.pending?` and there's no existing `booking.payment`, render `{ error: \"only pending bookings can be paid\" }` with `status: :unprocessable_content` and `return`. Then call `Stripe::PaymentIntent.create` with `amount: booking.price_cents`, `currency: \"usd\"`, and `metadata: { booking_id: booking.id }`.",
          ],
          starter: String.raw`def create
  booking = current_user.bookings.find(params[:booking_id])

  # your code here
end`,
          solution: String.raw`def create
  booking = current_user.bookings.find(params[:booking_id])

  if !booking.pending? || booking.payment.present?
    render json: { error: "only pending bookings can be paid" }, status: :unprocessable_content
    return
  end

  intent = Stripe::PaymentIntent.create(
    amount: booking.price_cents,
    currency: "usd",
    metadata: { booking_id: booking.id }
  )
end`,
          checks: [
            { re: /if!booking\.pending\?\|\|booking\.payment\.present\?/, hint: "Guard with `if !booking.pending? || booking.payment.present?`." },
            { re: /status::unprocessable_content/, hint: "Render the rejection with `status: :unprocessable_content`." },
            { re: /Stripe::PaymentIntent\.create\(/, hint: "Call `Stripe::PaymentIntent.create(...)`." },
            { re: /amount:booking\.price_cents/, hint: "Pass `amount: booking.price_cents` — never a client-supplied amount." },
            { re: /metadata:\{booking_id:booking\.id\}/, hint: "Attach `metadata: { booking_id: booking.id }` so the webhook can find this booking later." },
          ],
          mustNot: [
            { re: /amount:params/, hint: "Never take the amount from params — it must come from `booking.price_cents`." },
          ],
          success: "That's the real guard and intent-create call — the exact lines that make it impossible for a client to pick its own price or pay twice.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "webhooks-stripe-calls-you-back",
      title: "Webhooks: Stripe Calls You Back",
      steps: [
        {
          type: "text",
          md: [
            "## The async gap, made concrete",
            "Lesson 1 named it: your `pay` request finishes with a `client_secret`, long before the card actually clears. The mobile app confirms the charge with Stripe directly — an exchange your Rails server has zero visibility into. So how does PawWalk ever learn the charge succeeded? Stripe tells you, by calling YOUR server back: a plain `POST` to an endpoint you expose, whenever a PaymentIntent's state changes. That's a **webhook**, and it's the only way your server finds out what happened outside its own request cycle.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/stripe_webhooks_controller.rb",
          source: String.raw`class StripeWebhooksController < ApplicationController
  skip_before_action :authenticate_request

  def create
    event = Stripe::Webhook.construct_event(
      request.body.read, request.env["HTTP_STRIPE_SIGNATURE"], ENV["STRIPE_WEBHOOK_SECRET"]
    )

    case event.type
    when "payment_intent.succeeded"
      handle_succeeded(event.data.object)
    when "payment_intent.payment_failed"
      handle_failed(event.data.object)
    end

    render json: { received: true }, status: :ok
  rescue JSON::ParserError, Stripe::SignatureVerificationError
    render json: { error: "invalid payload" }, status: :bad_request
  end

  private

  def handle_succeeded(intent)
    payment = Payment.find_by(stripe_payment_intent_id: intent.id)
    return unless payment

    payment.update!(status: :succeeded)
    payment.booking.update!(status: :confirmed)
    BookingConfirmationJob.perform_later(payment.booking_id)
  end

  def handle_failed(intent)
    Payment.find_by(stripe_payment_intent_id: intent.id)&.update!(status: :failed)
  end
end`,
          caption: "The full, real file. `skip_before_action :authenticate_request` sits right at the top — that's not a mistake, it's the whole point of the next section.",
        },
        {
          type: "text",
          md: [
            "## Stripe isn't a JWT user — so signature verification replaces it",
            "Every controller since module 10 has relied on `ApplicationController`'s `before_action :authenticate_request` to guarantee `current_user` is a real, logged-in person. Stripe has no login, no JWT, no user account on PawWalk at all — it's a server calling your server. `skip_before_action :authenticate_request` turns that guard OFF for this one controller. On its own, that sounds alarming: doesn't that mean ANYONE can `POST` to `/stripe/webhooks` and claim a payment succeeded?",
            "That's exactly the gap `Stripe::Webhook.construct_event` closes. Every real webhook Stripe sends carries a `Stripe-Signature` header — a cryptographic signature computed from the raw request body and a shared secret (`STRIPE_WEBHOOK_SECRET`) only Stripe and your server know. `construct_event(payload, signature, secret)` recomputes that signature itself and raises `Stripe::SignatureVerificationError` the instant it doesn't match. An attacker can `POST` any JSON they want to this endpoint, but without the secret, they can't produce a signature that passes — so `construct_event` raises before `event.type` is ever read, and the `rescue` clause turns that straight into a 400. **The signature check IS the authentication here — just a different kind than a JWT.**",
          ],
        },
        {
          type: "text",
          md: [
            "## Three branches: succeeded, failed, and everything else",
            "`case event.type` handles exactly two named events. `payment_intent.succeeded` marks the `Payment` succeeded, flips the `Booking` to `confirmed`, and enqueues `BookingConfirmationJob` (lesson 4's whole subject) — three separate writes, in that order, because the booking shouldn't read as confirmed before its payment does. `payment_intent.payment_failed` only updates the `Payment` to `failed`; nothing about the booking changes, since a failed charge means the owner still needs to pay some other way.",
            "Every OTHER event type — and Stripe sends dozens (`charge.refunded`, `customer.created`, and so on) — falls through the `case` with no `when` branch matched, does nothing, and still returns `render json: { received: true }, status: :ok`. That's deliberate, not an oversight: Stripe RETRIES a webhook delivery if your endpoint doesn't return a 2xx, so acknowledging an event type you don't care about with a 200 tells Stripe \"got it, stop retrying\" — where a 4xx or 5xx would make Stripe hammer the same unhandled event forever.",
            "`&.update!` in `handle_failed` — the safe-navigation operator — means \"do nothing if `find_by` returned `nil`\" instead of crashing with `NoMethodError` on a payment Stripe knows about but this database doesn't (a stale test event, for instance). `handle_succeeded` spells the same idea out with an explicit `return unless payment`.",
          ],
        },
        {
          type: "quiz",
          q: "`StripeWebhooksController` calls `skip_before_action :authenticate_request`. Doesn't that mean anyone can POST a fake `payment_intent.succeeded` event and mark a random booking confirmed?",
          choices: [
            "No — `Stripe::Webhook.construct_event` verifies the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`, and raises before `event.type` is ever read if the signature doesn't match",
            "Yes — this is a real security hole in the controller",
            "No — Rails automatically blocks any request that didn't originate from an authenticated session, regardless of `skip_before_action`",
            "No — the route itself is IP-restricted to Stripe's servers only",
          ],
          answer: 0,
          explain: "Skipping JWT auth is safe here only because signature verification replaces it. Only someone holding the shared `STRIPE_WEBHOOK_SECRET` (that's Stripe, and only Stripe) can produce a signature `construct_event` accepts — anything else raises `Stripe::SignatureVerificationError` before a single line of event-handling code runs.",
          nudge: "JWT auth and webhook signature verification are both 'prove you're allowed to be here' checks — just different mechanisms for two different kinds of caller. Which one replaces the other here?",
        },
        {
          type: "exercise",
          title: "Retype the succeeded branch",
          prompt: [
            "Define `handle_succeeded(intent)`: look up the `Payment` by `stripe_payment_intent_id: intent.id`, return early if it's `nil`, then mark it `succeeded`, mark its `booking` `confirmed`, and enqueue `BookingConfirmationJob` with the booking's id.",
          ],
          starter: String.raw`private

# your code here
`,
          solution: String.raw`private

def handle_succeeded(intent)
  payment = Payment.find_by(stripe_payment_intent_id: intent.id)
  return unless payment

  payment.update!(status: :succeeded)
  payment.booking.update!(status: :confirmed)
  BookingConfirmationJob.perform_later(payment.booking_id)
end`,
          checks: [
            { re: /def handle_succeeded\(intent\)/, hint: "Match the signature exactly: `def handle_succeeded(intent)`." },
            { re: /Payment\.find_by\(stripe_payment_intent_id:intent\.id\)/, hint: "Look it up with `Payment.find_by(stripe_payment_intent_id: intent.id)`." },
            { re: /return unless payment/, hint: "Bail out early if no matching payment: `return unless payment`." },
            { re: /payment\.update!\(status::succeeded\)/, hint: "Mark the payment succeeded: `payment.update!(status: :succeeded)`." },
            { re: /payment\.booking\.update!\(status::confirmed\)/, hint: "Mark the booking confirmed: `payment.booking.update!(status: :confirmed)`." },
            { re: /BookingConfirmationJob\.perform_later\(payment\.booking_id\)/, hint: "Enqueue the job: `BookingConfirmationJob.perform_later(payment.booking_id)`." },
          ],
          success: "That's the real succeeded branch — the only path in this whole app that ever flips a booking to confirmed.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "background-jobs-with-solid-queue",
      title: "Background Jobs with Solid Queue",
      steps: [
        {
          type: "text",
          md: [
            "## Why the webhook handler doesn't send the email itself",
            "`handle_succeeded` could, in theory, just call a mailer directly and send the confirmation email right there, inline, before returning `{ received: true }`. Nothing stops you syntactically. But Stripe expects your webhook endpoint to respond FAST — if it doesn't hear back quickly, it assumes the request failed and retries. Sending an email is slow and unreliable compared to a database write: an SMTP connection can hang, a mail provider can rate-limit you, a DNS lookup can time out. Block the webhook response on any of that, and a slow mail server starts making Stripe retry a webhook that actually succeeded, which risks double-processing.",
            "The fix is to do the slow part **later, off the request entirely**: enqueue a background job, respond to Stripe immediately, and let something else pick up the job whenever it's convenient. That's exactly what `BookingConfirmationJob.perform_later(payment.booking_id)` did in lesson 3 — `perform_later` doesn't run the job now, it hands it to a queue and returns instantly.",
          ],
        },
        {
          type: "text",
          md: [
            "## Active Job: one interface, three adapters",
            "**Active Job** is Rails' abstraction over \"run this later, on some background worker.\" You write one job class and call `.perform_later`; which system actually executes it is a config setting, not something the job class itself decides. Three different adapters run in three different places in this app:",
          ],
        },
        {
          type: "code",
          title: "config/environments/production.rb",
          source: String.raw`  # Replace the default in-process and non-durable queuing backend for Active Job.
  config.active_job.queue_adapter = :solid_queue
  config.solid_queue.connects_to = { database: { writing: :queue } }`,
          caption: "Production is the only environment that sets `queue_adapter` explicitly — because it's the only one where \"durable, survives a restart\" actually matters. `development.rb` and `test.rb` set nothing at all, which means Rails falls back to its own per-environment defaults: `:async` (an in-process thread pool — jobs run for real, but vanish if the process restarts) in development, and `:test` (jobs are recorded, not executed, so `assert_enqueued_with` can inspect them) in the test environment. That's the exact adapter `stripe_webhooks_test.rb`'s `assert_enqueued_with(job: BookingConfirmationJob, ...)` relies on in lesson 3 — it CHECKS that a job was enqueued rather than watching an email actually send.",
        },
        {
          type: "code",
          title: "app/jobs/booking_confirmation_job.rb",
          source: String.raw`class BookingConfirmationJob < ApplicationJob
  queue_as :default

  def perform(booking_id)
    booking = Booking.find(booking_id)
    BookingMailer.confirmation(booking).deliver_now
  end
end`,
          caption: "The full, real file. Four lines, and one of them is a trap for anyone who's read Rails guides that show `deliver_later` everywhere.",
        },
        {
          type: "text",
          md: [
            "## `deliver_now`, INSIDE a job — not a typo",
            "Most Rails tutorials teach `SomeMailer.something(x).deliver_later` as the default, because sending mail from a web request is exactly the slow-inline-work problem lesson 3 just described. But `BookingConfirmationJob#perform` calls `.deliver_now`, not `.deliver_later`. That's correct, on purpose: this code is ALREADY running inside a background job, off the original request. Calling `.deliver_later` here would enqueue a SECOND job (a mailer job) from inside the first job, for no benefit — you'd be queueing work that's already safely off the request path. `deliver_now` inside a job means \"do the actual send work right here, in this job's execution\" — which is exactly where slow work belongs. The rule in one line: **`deliver_later` when you're in a request; `deliver_now` when you're already in a job.**",
          ],
        },
        {
          type: "code",
          title: "app/mailers/application_mailer.rb",
          source: String.raw`class ApplicationMailer < ActionMailer::Base
  default from: "bookings@pawwalk.dev"
  layout "mailer"
end`,
          caption: "Every mailer in the app inherits this. `default from:` sets the sender address once; `layout \"mailer\"` wraps every mail body in a shared template — same idea as a shared view layout for HTML pages.",
        },
        {
          type: "code",
          title: "app/mailers/booking_mailer.rb",
          source: String.raw`class BookingMailer < ApplicationMailer
  def confirmation(booking)
    @booking = booking

    mail to: booking.user.email, subject: "Your PawWalk booking is confirmed \u{1F43E}"
  end
end`,
          caption: "A mailer method looks almost exactly like a controller action: set an instance variable (`@booking`), call `mail` with a `to:` and `subject:`, and Rails renders a VIEW for the body — `confirmation.text.erb` below — the same render-a-template-from-an-instance-variable pattern you've used for JSON, just aimed at an email body instead.",
        },
        {
          type: "code",
          title: "app/views/booking_mailer/confirmation.text.erb",
          source: String.raw`Your walk is confirmed!

Walker: <%= @booking.walker.name %>
Dog: <%= @booking.dog.name %>
Starts at: <%= @booking.starts_at %>
Price: <%= @booking.walker.price_label %>

Thanks for booking with PawWalk.`,
          caption: "Plain ERB, same `<%= %>` syntax you'd use in an HTML view — mailer views work fine in an API-only app even though nothing else in `apps/pawwalk-api` renders HTML. `@booking` is the exact instance variable `confirmation` set in the mailer above it.",
        },
        {
          type: "text",
          md: [
            "## Solid Queue: jobs live in your database, no Redis",
            "Older Rails background-job systems (Sidekiq, Resque) need Redis running as a separate service — one more thing to install, monitor, and keep alive. Rails 8 ships **Solid Queue**, which stores queued jobs as rows in your existing database instead — the same SQLite file (or Postgres, in a bigger deploy) everything else already uses. One less moving part, one less service to run. In production, `bin/jobs` is the command that starts the actual worker process — a small program that polls the `solid_queue` tables for pending jobs and calls `.perform` on each one as it comes due. Development doesn't need `bin/jobs` running at all, because the `:async` adapter executes jobs in-process, right inside the Rails server itself.",
          ],
        },
        {
          type: "quiz",
          q: "`BookingConfirmationJob#perform` calls `BookingMailer.confirmation(booking).deliver_now`. Why `deliver_now` and not `deliver_later`, given that `deliver_later` is the usual Rails advice for sending email?",
          choices: [
            "Because this code is already running inside a background job — calling `deliver_later` here would needlessly enqueue a second job from inside the first one",
            "Because `deliver_later` doesn't exist in Rails 8 — it was renamed to `deliver_now`",
            "Because `deliver_now` is faster to type and behaves identically to `deliver_later` in every case",
            "Because Solid Queue can only process jobs synchronously, never asynchronously",
          ],
          answer: 0,
          explain: "`deliver_later` exists to get slow mail-sending work OFF the request cycle. `BookingConfirmationJob` is already off the request cycle — it's a job, enqueued from the webhook precisely so the webhook can respond fast. Calling `deliver_later` from inside it would just queue a second, redundant job for no benefit.",
          nudge: "Ask what problem `deliver_later` solves, and whether that problem still exists once you're already executing inside a background job.",
        },
        {
          type: "exercise",
          title: "Retype the job class",
          prompt: [
            "Define `BookingConfirmationJob < ApplicationJob`, queued as `:default`, with a `perform(booking_id)` that finds the `Booking` and delivers `BookingMailer.confirmation(booking)` with `deliver_now` (not `deliver_later`).",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`class BookingConfirmationJob < ApplicationJob
  queue_as :default

  def perform(booking_id)
    booking = Booking.find(booking_id)
    BookingMailer.confirmation(booking).deliver_now
  end
end`,
          checks: [
            { re: /class BookingConfirmationJob<ApplicationJob/, hint: "Inherit from `ApplicationJob`: `class BookingConfirmationJob < ApplicationJob`." },
            { re: /queue_as:default/, hint: "Set the queue: `queue_as :default`." },
            { re: /def perform\(booking_id\)/, hint: "Match the method signature: `def perform(booking_id)`." },
            { re: /Booking\.find\(booking_id\)/, hint: "Look up the booking: `Booking.find(booking_id)`." },
            { re: /BookingMailer\.confirmation\(booking\)\.deliver_now/, hint: "Deliver with `deliver_now`, not `deliver_later` — this code is already inside a job." },
          ],
          mustNot: [
            { re: /deliver_later/, hint: "Don't use `deliver_later` here — you're already inside a background job, so `deliver_now` is correct." },
          ],
          success: "That's the real job, word for word — the one line every webhook-succeeded call eventually triggers.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "prove-it-without-a-stripe-account",
      title: "Prove It Without a Stripe Account",
      label: "Over to the terminal",
      steps: [
        {
          type: "text",
          md: [
            "## Faking Stripe with plain Minitest — no extra gem",
            "There's no Stripe account configured on this machine, and this module never asked you to make one. So how does `payments_test.rb` prove `PaymentsController#create` actually calls `Stripe::PaymentIntent.create` correctly, without a real network call to Stripe's API? Minitest ships a **stubbing** helper on every `Object` — no extra gem, no `webmock`, no VCR-style cassette recording. `SomeClass.stub(:method_name, return_value) { ... }` temporarily replaces `method_name` with something that just returns `return_value`, for the duration of the block only, then restores the real method automatically.",
          ],
        },
        {
          type: "code",
          title: "test/integration/payments_test.rb",
          source: String.raw`  test "pay a pending booking creates a Stripe PaymentIntent and a Payment row" do
    booking = bookings(:pending_cancel)
    intent = OpenStruct.new(id: "pi_123", client_secret: "pi_123_secret_abc")

    Stripe::PaymentIntent.stub :create, intent do
      post "/bookings/#{booking.id}/pay", headers: auth_headers(users(:demo))
    end

    assert_response :created
    body = JSON.parse(response.body)

    assert_equal "processing", body["payment"]["status"]
    assert_equal booking.price_cents, body["payment"]["amount_cents"]
    assert_equal "pi_123_secret_abc", body["client_secret"]

    payment = booking.reload.payment
    assert_equal booking.price_cents, payment.amount_cents
    assert_equal "pi_123", payment.stripe_payment_intent_id
  end`,
          caption: "A real, trimmed excerpt. `OpenStruct.new(id: ..., client_secret: ...)` builds a fake object with just the two methods `PaymentsController#create` actually calls on the real Stripe response — good enough to stand in for a whole PaymentIntent, because the controller never checks its class, only its interface.",
        },
        {
          type: "text",
          md: [
            "`Stripe::PaymentIntent.stub :create, intent do ... end` means: for the duration of this block ONLY, calling `Stripe::PaymentIntent.create(...)` (with any arguments at all) returns `intent` instead of making a real HTTPS request to Stripe. The `post \"/bookings/.../pay\"` line inside the block runs the real controller action, unmodified — every guard, every `render`, every `create_payment!` call is the real code path. Only the one line that would otherwise hit Stripe's network is swapped out. That's the whole trick: test the REAL app logic, fake only the one external boundary you don't control in a test run.",
          ],
        },
        {
          type: "text",
          md: [
            "## The real build gotcha: Minitest 6 split `stub` out",
            "This isn't hypothetical trivia — it's a real thing that had to be fixed to get this exact test suite running. Minitest 6 moved `Object#stub` (the method the test above relies on) out of Minitest core and into a separate `minitest-mock` gem. Bundle the newest Minitest without noticing, and every `.stub` call in this codebase would raise `NoMethodError` — a working test suite breaking from nothing more than an unpinned transitive dependency bump.",
          ],
        },
        {
          type: "code",
          title: "Gemfile",
          source: String.raw`group :test do
  # Minitest 6 split Object#stub out into the separate minitest-mock gem; pin to the last
  # 5.x so Object#stub (used to stub Stripe's class methods in tests) stays built in.
  gem "minitest", "~> 5.25"
end`,
          caption: "A version pin with a comment explaining WHY — not decoration, but a real engineering decision that keeps `Stripe::PaymentIntent.stub` and `Stripe::Webhook.stub` working across future `bundle update`s.",
        },
        {
          type: "text",
          md: [
            "`~> 5.25` is Ruby's \"pessimistic\" version constraint: allow any `5.x` release `>= 5.25`, but never jump to `6.0`. That one line is the entire fix — no code change, no workaround, just telling Bundler exactly which major version boundary not to cross. Version pins like this ARE engineering, not superstition: they encode a decision someone made after hitting a real failure, so nobody hits it again by accident.",
          ],
        },
        {
          type: "xcode",
          title: "Run the real test suite, then simulate the flow",
          label: "Over to the terminal",
          intro: [
            "Prove the whole module works, against the actual app, with zero Stripe account:",
          ],
          items: [
            "`cd apps/pawwalk-api && bin/rails test test/integration/payments_test.rb test/integration/stripe_webhooks_test.rb` — expect all tests green (9 runs, 0 failures).",
            "Open `bin/rails runner` (or `bin/rails console`) and simulate the confirmed flow end to end: find a pending booking, create its `Payment` the way `PaymentsController#create` would, then simulate the webhook's succeeded branch by hand — `payment.update!(status: :succeeded)`, `booking.update!(status: :confirmed)`, `BookingConfirmationJob.perform_now(booking.id)` — and confirm `ActionMailer::Base.deliveries.size` grew by one.",
            "OPTIONAL — only if you want to see a real Stripe response: create a free account at https://dashboard.stripe.com/register, copy your test-mode secret key, run `STRIPE_SECRET_KEY=sk_test_... bin/rails server`, and `POST /bookings/:id/pay` with a real auth token — the response's `client_secret` will be a real Stripe value instead of anything faked in a test.",
          ],
        },
        {
          type: "text",
          md: [
            "## What a real run just showed",
            "That's a real, verified transcript against the actual app: both integration test files pass (9 runs, 23 assertions, 0 failures), and a `rails runner` simulation moves a booking from `pending` all the way to `confirmed` with a `Payment` row flipping to `succeeded` and exactly one email landing in `ActionMailer::Base.deliveries` — the entire module's flow, proven without a single real network call to Stripe.",
          ],
        },
        {
          type: "quiz",
          q: "Capstone: put the whole module in order. Trace one PaymentIntent from creation to a confirmed booking — which four things happen, and in what order?",
          choices: [
            "POST /bookings/:id/pay creates a PaymentIntent + Payment row (status processing) → Stripe confirms the card client-side → Stripe POSTs a signed webhook event → the webhook marks the Payment succeeded, the Booking confirmed, and enqueues BookingConfirmationJob, which delivers the email",
            "POST /bookings/:id/pay immediately marks the booking confirmed and sends the email in the same request",
            "The mobile app sends the card number to PawWalk's server, which forwards it to Stripe",
            "BookingConfirmationJob runs first, then the webhook creates the Payment row afterward",
          ],
          answer: 0,
          explain: "The order matters because of the async gap this whole module is built around: your server's `pay` response can only ever report 'a PaymentIntent exists' — it cannot know the outcome yet. Only the signed webhook, arriving later, learns the real result and drives the booking to `confirmed` plus the background job that sends the email.",
          nudge: "Which step in this chain is the ONLY one that ever learns whether the card actually succeeded?",
        },
      ],
    },
  ],
});
