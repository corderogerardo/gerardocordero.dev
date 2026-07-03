require "test_helper"

class BookingConfirmationJobTest < ActiveJob::TestCase
  test "performing the job delivers the confirmation email" do
    booking = bookings(:upcoming)

    perform_enqueued_jobs do
      BookingConfirmationJob.perform_later(booking.id)
    end

    assert_emails 1
  end
end
