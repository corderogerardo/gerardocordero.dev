require "test_helper"

class PayoutTest < ActiveSupport::TestCase
  setup { @walker = walkers(:luna) }

  test "pay_out! records two balanced ledger entries summing to zero" do
    payout = Payout.pay_out!(walker: @walker, amount_cents: 4000, idempotency_key: "booking-1")

    entries = payout.ledger_entries
    assert_equal 2, entries.count
    assert_equal 0, entries.sum(:amount_cents)
    assert_equal(-4000, entries.find_by(account: "platform").amount_cents)
    assert_equal(4000, entries.find_by(account: "walker_#{@walker.id}").amount_cents)
  end

  test "a duplicate idempotency_key does not create a second payout" do
    first = Payout.pay_out!(walker: @walker, amount_cents: 4000, idempotency_key: "booking-1")

    assert_no_difference -> { Payout.count } do
      assert_no_difference -> { LedgerEntry.count } do
        second = Payout.pay_out!(walker: @walker, amount_cents: 4000, idempotency_key: "booking-1")
        assert_equal first.id, second.id
      end
    end
  end
end
