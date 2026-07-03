require "test_helper"

class WalkerTest < ActiveSupport::TestCase
  test "price_label formats cents as dollars per 30 minutes" do
    assert_equal "$25 / 30 min", walkers(:luna).price_label
  end

  test "is invalid without a positive price_per_30_min_cents" do
    walker = Walker.new(name: "No Price", city: "Austin", price_per_30_min_cents: 0)

    assert_not walker.valid?
    assert_includes walker.errors[:price_per_30_min_cents], "must be greater than 0"
  end

  test "is invalid without a name or city" do
    walker = Walker.new(price_per_30_min_cents: 2000)

    assert_not walker.valid?
    assert_includes walker.errors[:name], "can't be blank"
    assert_includes walker.errors[:city], "can't be blank"
  end
end
