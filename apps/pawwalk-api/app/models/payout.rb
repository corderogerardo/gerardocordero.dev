class Payout < ApplicationRecord
  belongs_to :walker
  has_many :ledger_entries

  enum :status, { pending: "pending", paid: "paid" }

  validates :amount_cents, numericality: { only_integer: true, greater_than: 0 }
  validates :idempotency_key, presence: true
  # No app-level uniqueness validation on purpose: check-then-insert has a race
  # (two concurrent retries can both pass the check before either inserts). The
  # real guard is the UNIQUE database index from the migration — create_once!
  # rescues the error Rails raises when that index rejects the insert.

  # Idempotent create: a retried job passing the SAME idempotency_key gets back
  # the original payout instead of creating a duplicate.
  def self.create_once!(walker:, amount_cents:, idempotency_key:)
    create!(walker: walker, amount_cents: amount_cents, idempotency_key: idempotency_key)
  rescue ActiveRecord::RecordNotUnique
    find_by!(idempotency_key: idempotency_key)
  end

  # Records a payout as a balanced double-entry transfer: money leaves the
  # platform account and arrives in the walker's account, both in one
  # transaction so the pair can never exist half-written.
  def self.pay_out!(walker:, amount_cents:, idempotency_key:)
    transaction do
      payout = create_once!(walker: walker, amount_cents: amount_cents, idempotency_key: idempotency_key)
      next payout if payout.ledger_entries.exists?

      payout.ledger_entries.create!(account: "platform", amount_cents: -amount_cents)
      payout.ledger_entries.create!(account: "walker_#{walker.id}", amount_cents: amount_cents)
      payout.update!(status: :paid)
      payout
    end
  end
end
