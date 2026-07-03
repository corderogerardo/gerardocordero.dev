// Module 19 — Money: Payouts & a Ledger. See FORMAT.md + FORMAT-RUBY.md for the schema.
// Modules 0-18 built the JSON API, auth, bookings, Stripe charges, Solid Queue/Cable, caching,
// and a Hotwire admin surface. This module is about the OTHER side of the money: paying walkers
// out, safely, and keeping a record precise enough to survive an audit.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "money-ledger",
  title: "Money: Payouts & a Ledger",
  emoji: "💰",
  lang: "ruby",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "never-store-money-as-a-float",
      title: "Never store money as a float",
      steps: [
        {
          type: "text",
          md: [
            "## 0.1 + 0.2 is not 0.3",
            "Open any Ruby console and try it:",
            "```\nirb> 0.1 + 0.2\n=> 0.30000000000000004\n```",
            "That's not a Ruby bug — it's how every language stores `Float`s (IEEE 754 binary floating point). Most fractions that look clean in base 10, like 0.1, can't be represented exactly in binary, the same way 1/3 can't be written exactly in decimal. The error is tiny, a few quadrillionths — until you're summing thousands of payouts, and the rounding drift adds up to real cents that don't reconcile.",
            "PawWalk never has this problem, because it never stored money as a float in the first place. Every price on this app — `walkers.price_per_30_min_cents`, `bookings.price_cents`, `payments.amount_cents` — is an **integer number of cents**. `$12.50` is stored as `1250`. Integers add, subtract, and compare exactly, every time. No rounding, no drift.",
          ],
        },
        {
          type: "code",
          title: "app/models/walker.rb — the pattern you've already been using",
          source: String.raw`class Walker < ApplicationRecord
  validates :price_per_30_min_cents, presence: true,
                                      numericality: { only_integer: true, greater_than: 0 }

  def price_label
    "$#{price_per_30_min_cents / 100} / 30 min"
  end
end`,
          caption: "This has been the rule since module 9 — the column name says `_cents` and the validation pins it to `only_integer: true`. You only convert to dollars-and-cents for DISPLAY, in `price_label`, at the very last step before a human reads it. The stored value and every calculation on it stay integer cents.",
        },
        {
          type: "text",
          md: [
            "## What about amounts that need a fraction of a cent?",
            "Cents-as-integers covers everything PawWalk charges or pays — but some finance code (currency conversion, tax rates, interest) needs more precision than a whole cent. For that, Ruby has `BigDecimal`, an exact decimal type that doesn't have the binary-fraction problem `Float` has:",
            "```\nirb> require \"bigdecimal\"\nirb> BigDecimal(\"0.1\") + BigDecimal(\"0.2\")\n=> 0.3\n```",
            "`BigDecimal` is exact because it stores digits in base 10 internally, the same base your decimal amount is written in — there's no lossy conversion. The golden rule underneath both fixes is the same: **never use `Float` for a value where being off by a fraction of a cent is a bug, not a rounding footnote.** Integer cents for anything whole-cent (which is almost everything in PawWalk); `BigDecimal` only if you genuinely need sub-cent precision.",
          ],
        },
        {
          type: "quiz",
          q: "Why is `0.1 + 0.2 == 0.3` false in Ruby (and in nearly every language)?",
          choices: [
            "`Float` stores numbers in binary, and most base-10 fractions like 0.1 can't be represented exactly in binary — the same way 1/3 has no exact ending decimal",
            "Ruby's `+` operator is buggy for small numbers",
            "It's only false the first time you run it; Ruby caches the correct result after that",
            "`0.1` and `0.2` are strings until you call `.to_f` on them",
          ],
          answer: 0,
          explain: "It's a base-conversion problem, not a bug: binary floating point can exactly represent fractions like 1/2 or 1/4, but not 1/10 — so 0.1 is already a tiny approximation before you even add anything. That's why money code stores integer cents (or `BigDecimal`) instead of `Float`.",
          nudge: "Think about how 1/3 looks in decimal — it never exactly ends. Binary has its own set of fractions it can't finish either, and 0.1 is one of them.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "idempotent-payouts",
      title: "Idempotent payouts",
      steps: [
        {
          type: "text",
          md: [
            "## The same lesson as the task queue, applied to money",
            "You've seen this shape before: a Solid Queue job can run **at least once** — a worker can crash right after finishing the work but before marking the job done, and the job gets retried. For most jobs (like `BookingConfirmationJob` sending an email) an extra retry is a harmless duplicate email at worst.",
            "A payout job retrying is not harmless. If `PayoutJob` pays a walker $40 and then crashes before recording that it succeeded, a naive retry pays them ANOTHER $40. Nobody notices until the walker gets a $2,000 payout for a week of $40 walks — and by then the money is gone.",
            "The fix is the same shape as before: an **idempotency key**. Give every payout attempt a unique key (one per real-world payout event — say, one per booking being paid out). Make that key a column with a UNIQUE database index. Before creating a payout, try to insert with that key; if the insert fails because the key already exists, the payout already happened — return the existing row instead of paying again.",
          ],
        },
        {
          type: "code",
          title: "db/schema.rb — the payouts table",
          source: String.raw`create_table "payouts", force: :cascade do |t|
  t.integer "walker_id", null: false
  t.integer "amount_cents", null: false
  t.string "idempotency_key", null: false
  t.string "status", default: "pending"
  t.datetime "created_at", null: false
  t.datetime "updated_at", null: false
  t.index ["idempotency_key"], name: "index_payouts_on_idempotency_key", unique: true
end`,
          caption: "`unique: true` on the index is what actually makes this safe — not application code remembering to check first. A UNIQUE index is enforced by the database itself, so even two requests racing each other at the exact same millisecond can't both insert the same key.",
        },
        {
          type: "code",
          title: "app/models/payout.rb — the guarded create",
          source: String.raw`class Payout < ApplicationRecord
  belongs_to :walker

  validates :amount_cents, numericality: { only_integer: true, greater_than: 0 }
  validates :idempotency_key, presence: true, uniqueness: true

  def self.create_once!(walker:, amount_cents:, idempotency_key:)
    create!(walker: walker, amount_cents: amount_cents, idempotency_key: idempotency_key)
  rescue ActiveRecord::RecordNotUnique
    find_by!(idempotency_key: idempotency_key)
  end
end`,
          caption: "`create!` tries the insert. If the UNIQUE index rejects it, Rails raises `ActiveRecord::RecordNotUnique` — we rescue it and look up the payout that already exists with that key, instead of letting the error bubble up. A retried job calling `create_once!` with the SAME key gets back the original payout, never a second one.",
        },
        {
          type: "exercise",
          title: "Add the unique index migration",
          prompt: [
            "Write an `add_index` migration statement for a `:payouts` table's `:idempotency_key` column, making it `unique: true` — the guard that makes retried payouts safe.",
          ],
          starter: String.raw`class AddUniqueIndexToPayoutsOnIdempotencyKey < ActiveRecord::Migration[8.1]
  def change
    # your code here
  end
end`,
          solution: String.raw`class AddUniqueIndexToPayoutsOnIdempotencyKey < ActiveRecord::Migration[8.1]
  def change
    add_index :payouts, :idempotency_key, unique: true
  end
end`,
          checks: [
            { re: /add_index:payouts,:idempotency_key/, hint: "`add_index :payouts, :idempotency_key` — name the table first, then the column." },
            { re: /unique:true/, hint: "Pass `unique: true` — without it, the database would happily store the same key twice, and the whole guard falls apart." },
          ],
          mustNot: [],
          success: "That's the exact guard a retried payout job leans on — the database itself refuses a duplicate key, no matter how many times the job runs.",
        },
        {
          type: "quiz",
          q: "A `PayoutJob` crashes right after paying a walker but before Solid Queue marks it done, so it retries. What happens WITH vs WITHOUT the unique idempotency key?",
          choices: [
            "With the key: the retry's insert fails on the duplicate key, so `create_once!` returns the existing payout — no second payment. Without the key: the retry inserts a brand-new payout row, and the walker gets paid twice",
            "With or without the key, Solid Queue itself guarantees a job body only ever runs once, so this scenario can't happen",
            "With the key: the job simply doesn't retry at all. Without the key: the job retries but ActiveRecord silently ignores the duplicate insert either way",
            "The key only matters for the ADMIN dashboard's display — the actual payout behavior is identical with or without it",
          ],
          answer: 0,
          explain: "This is exactly the at-least-once problem from the task-queue lesson, applied to money: retries are a fact of life for background jobs, so the safety has to live in the data layer (a UNIQUE index), not in hoping a job never re-runs.",
          nudge: "Without any unique constraint, what stops two `create!` calls with the same walker and amount from both succeeding as two separate rows?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "a-double-entry-ledger",
      title: "A double-entry ledger",
      steps: [
        {
          type: "text",
          md: [
            "## Every movement of money is two entries, not one",
            "So far a `Payout` row says \"$40 went to walker #7\" — but says nothing about WHERE that $40 came from. A **double-entry ledger** fixes that by recording money movement as pairs: every entry that takes money OUT of one account (a debit) is matched by an entry that puts it INTO another account (a credit), and the two always sum to zero.",
            "Paying out a walker for a completed booking is really two entries: `-4000` cents on PawWalk's own operating account (money leaving the platform), and `+4000` cents on that walker's account (money arriving). Add them together and you get `0` — money didn't appear or disappear, it moved.",
            "Why bother, when a single \"balance\" number would be simpler? **Auditability.** With a ledger, a walker's balance isn't a number you trust and hope stays correct — it's the SUM of every entry ever posted to their account. You can always reconstruct it from scratch, prove it to an auditor, and spot exactly which entry caused a discrepancy. A mutable `balance_cents` column, by contrast, can drift from reality after one missed update, and there's no history left to find out why.",
          ],
        },
        {
          type: "code",
          title: "db/schema.rb — ledger_entries",
          source: String.raw`create_table "ledger_entries", force: :cascade do |t|
  t.string "account", null: false
  t.integer "amount_cents", null: false
  t.integer "payout_id"
  t.datetime "created_at", null: false
  t.datetime "updated_at", null: false
  t.index ["account"], name: "index_ledger_entries_on_account"
  t.index ["payout_id"], name: "index_ledger_entries_on_payout_id"
end`,
          caption: "`account` is just a string label (`\"platform\"`, or `\"walker_7\"`) — no separate accounts table needed for this minimal version. `amount_cents` is SIGNED: negative for a debit, positive for a credit. `payout_id` ties both entries in a pair back to the payout that caused them.",
        },
        {
          type: "code",
          title: "app/models/payout.rb — a transfer writes two balanced rows",
          source: String.raw`class Payout < ApplicationRecord
  belongs_to :walker
  has_many :ledger_entries

  def self.pay_out!(walker:, amount_cents:, idempotency_key:)
    transaction do
      payout = create_once!(walker: walker, amount_cents: amount_cents, idempotency_key: idempotency_key)
      next payout if payout.ledger_entries.exists?

      payout.ledger_entries.create!(account: "platform", amount_cents: -amount_cents)
      payout.ledger_entries.create!(account: "walker_#{walker.id}", amount_cents: amount_cents)
      payout
    end
  end
end`,
          caption: "`transaction do ... end` is the piece that makes this safe: either BOTH ledger entries get written, or (if anything raises inside the block) NEITHER does. Without the transaction, a crash between the two `create!` calls would leave one lonely entry that doesn't sum to zero with anything — money the ledger can't account for.",
        },
        {
          type: "exercise",
          title: "Post a balanced transfer inside a transaction",
          prompt: [
            "Inside a `transaction do ... end` block, create two `LedgerEntry` rows for a `payout_amount` (in cents): one on `\"platform\"` for the NEGATIVE amount, one on `walker_account` for the POSITIVE amount.",
          ],
          starter: String.raw`def post_transfer!(payout_amount, walker_account)
  # your code here
end`,
          solution: String.raw`def post_transfer!(payout_amount, walker_account)
  transaction do
    LedgerEntry.create!(account: "platform", amount_cents: -payout_amount)
    LedgerEntry.create!(account: walker_account, amount_cents: payout_amount)
  end
end`,
          checks: [
            { re: /transaction do LedgerEntry\.create!\(account:"platform",amount_cents:-payout_amount\)/, hint: "The first `LedgerEntry.create!` goes INSIDE the block — `transaction do` immediately followed by the platform entry (the NEGATED `payout_amount`, a debit). A create outside the block isn't protected by it." },
            { re: /LedgerEntry\.create!\(account:walker_account,amount_cents:payout_amount\)/, hint: "The walker entry's `amount_cents` is the plain, positive `payout_amount` — a credit, money arriving." },
          ],
          mustNot: [
            { re: /end LedgerEntry\.create/, hint: "Both `create!` calls must be INSIDE `transaction do ... end` — a create after the block's `end` defeats the atomicity the transaction exists to give you." },
          ],
          success: "That's a real double-entry transfer — the two rows always sum to zero, and the transaction means they can never exist one without the other.",
        },
        {
          type: "quiz",
          q: "Why must the two ledger entries in a transfer be written inside a single database transaction?",
          choices: [
            "So that if anything fails partway through, EITHER both entries are saved OR neither is — a crash can never leave one entry on its own, which would break the \"every transfer sums to zero\" guarantee the whole ledger depends on",
            "Transactions make the two `INSERT`s run faster by batching them",
            "It's required so Rails will let you create two rows of the same model back to back",
            "It's only there to satisfy rubocop's style rules, not for correctness",
          ],
          answer: 0,
          explain: "A ledger's core promise is that every transfer nets to zero, and that only holds if the two entries are all-or-nothing. A transaction is exactly Rails' tool for \"these statements succeed together or fail together\" — without it, a crash between the two creates would leave an unmatched entry with no way to explain where its other half went.",
          nudge: "What would the ledger look like if the process crashed right after the FIRST `create!` but before the second one ran?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "reconciliation",
      title: "Reconciliation",
      steps: [
        {
          type: "text",
          md: [
            "## A balance is a SUM, never a stored number",
            "Once you have a ledger, a walker's balance is never something you store and update — it's whatever `ledger_entries.where(account: \"walker_7\").sum(:amount_cents)` comes out to, computed fresh, every time. A cached `balance_cents` column on the `Walker` model is tempting for speed, but it's a second source of truth that can silently drift from the entries: a bug, a missed callback, a manual `update_column` in a Rails console — any of those corrupt a mutable counter forever, with no way to tell it happened.",
            "The ledger itself can't drift, because it's append-only: nothing ever updates or deletes a `LedgerEntry` (append-only isn't a technical restriction here, it's a discipline — treat every row as permanent). If a payout needs correcting, you post a NEW pair of entries reversing it, you don't edit the old ones. The full history stays honest, forever.",
            "A **reconciliation job** is the safety net that watches the ledger stay honest: periodically sum every debit and every credit across the WHOLE ledger and confirm they cancel out to zero (every transfer is balanced, so the grand total always should be). If they ever don't, something posted an unbalanced entry — a bug got through — and the job should flag it loudly rather than let it slide. Wire this up as a scheduled Solid Queue job (the same recurring-job pattern you'd use for any periodic task) so it runs on its own, say nightly, without anyone remembering to trigger it.",
          ],
        },
        {
          type: "code",
          title: "app/models/ledger_entry.rb + app/jobs/reconciliation_job.rb",
          source: String.raw`class LedgerEntry < ApplicationRecord
  belongs_to :payout, optional: true

  scope :for_account, ->(account) { where(account: account) }

  def self.balance_for(account)
    for_account(account).sum(:amount_cents)
  end
end

class ReconciliationJob < ApplicationJob
  queue_as :default

  def perform
    total = LedgerEntry.sum(:amount_cents)
    return if total.zero?

    Rails.logger.error("[ReconciliationJob] ledger out of balance by #{total} cents")
  end
end`,
          caption: "`balance_for` never touches a stored counter — it filters to one account's rows and sums them, every time it's called. `ReconciliationJob` sums the ENTIRE ledger (every account together): since every transfer's two entries cancel out, a healthy ledger always sums to exactly zero. Any non-zero total means an unbalanced entry slipped in somewhere, and it's logged instead of silently ignored.",
        },
        {
          type: "exercise",
          title: "Write the sum-based balance method",
          prompt: [
            "Write a class method `balance_for(account)` on `LedgerEntry` that filters entries to that `account` and returns the `sum` of `amount_cents` — no stored counter, computed fresh.",
          ],
          starter: String.raw`class LedgerEntry < ApplicationRecord
  # your code here
end`,
          solution: String.raw`class LedgerEntry < ApplicationRecord
  def self.balance_for(account)
    where(account: account).sum(:amount_cents)
  end
end`,
          checks: [
            { re: /def self\.balance_for\(account\)/, hint: "Define it as a class method: `def self.balance_for(account)`." },
            { re: /where\(account:account\)\.sum\(:amount_cents\)end/, hint: "The `where(account: account).sum(:amount_cents)` chain must be the method's last line — its return value. Computing it and then returning something else gives the caller a wrong balance." },
          ],
          mustNot: [],
          success: "That's the real rule: a balance is a query over history, never a number you trust to stay in sync on its own.",
        },
        {
          type: "quiz",
          q: "Why is the ledger the source of truth for a balance, instead of a cached `balance_cents` column?",
          choices: [
            "Because the ledger is a SUM over an append-only history of every entry ever posted — it can be recomputed and audited from scratch at any time, while a mutable counter can silently drift from reality with no record of when or why",
            "Because summing rows is always faster than reading one column",
            "Because Rails doesn't allow adding a `balance_cents` column to a model",
            "There's no real difference — both approaches are equally reliable, it's just a style preference",
          ],
          answer: 0,
          explain: "The whole point of double-entry bookkeeping is that the history itself is the proof — a balance derived from summing it can always be independently reconstructed and checked. A cached counter is faster to read but has no such guarantee: one missed update and it's wrong, permanently, with nothing left to reconcile against.",
          nudge: "If a `balance_cents` column got corrupted by a bug, what evidence would be left to figure out the CORRECT number? Now ask the same question about the ledger.",
        },
      ],
    },
  ],
});
