require "test_helper"

class BookingMailerTest < ActionMailer::TestCase
  test "confirmation" do
    booking = bookings(:upcoming)
    mail = BookingMailer.confirmation(booking)

    assert_equal "Your PawWalk booking is confirmed \u{1F43E}", mail.subject
    assert_equal [ booking.user.email ], mail.to
    assert_equal [ "bookings@pawwalk.dev" ], mail.from
    assert_match booking.walker.name, mail.body.encoded
    assert_match booking.dog.name, mail.body.encoded
  end
end
