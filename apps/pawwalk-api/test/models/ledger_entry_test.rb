require "test_helper"

class LedgerEntryTest < ActiveSupport::TestCase
  test "balance_for sums entries for one account only" do
    walker = walkers(:luna)
    Payout.pay_out!(walker: walker, amount_cents: 4000, idempotency_key: "booking-1")
    Payout.pay_out!(walker: walker, amount_cents: 2500, idempotency_key: "booking-2")

    assert_equal 6500, LedgerEntry.balance_for("walker_#{walker.id}")
    assert_equal(-6500, LedgerEntry.balance_for("platform"))
  end
end
