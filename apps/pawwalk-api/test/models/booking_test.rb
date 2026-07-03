require "test_helper"

class BookingTest < ActiveSupport::TestCase
  test "status enum transitions between pending, confirmed, and completed" do
    booking = bookings(:upcoming)

    assert booking.confirmed?

    booking.pending!
    assert booking.pending?

    booking.completed!
    assert booking.completed?
  end

  test "is invalid when the dog does not belong to the booking's user" do
    booking = Booking.new(
      user: users(:demo),
      walker: walkers(:luna),
      dog: dogs(:biscuit), # belongs to jane, not demo
      starts_at: 1.day.from_now,
      duration_min: 30,
      price_cents: 2500
    )

    assert_not booking.valid?
    assert_includes booking.errors[:dog], "must belong to the user making the booking"
  end

  test "is invalid with a duration other than 30 or 60 minutes" do
    booking = bookings(:upcoming).dup
    booking.duration_min = 45

    assert_not booking.valid?
    assert_includes booking.errors[:duration_min], "is not included in the list"
  end

  test "upcoming scope includes future, non-cancelled bookings only" do
    assert_includes Booking.upcoming, bookings(:upcoming)
    assert_not_includes Booking.upcoming, bookings(:past)
  end

  test "for_walker scope filters bookings by walker" do
    assert_includes Booking.for_walker(walkers(:luna)), bookings(:upcoming)
    assert_not_includes Booking.for_walker(walkers(:luna)), bookings(:past)
  end
end
