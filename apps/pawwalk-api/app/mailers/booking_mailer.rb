class BookingMailer < ApplicationMailer
  def confirmation(booking)
    @booking = booking

    mail to: booking.user.email, subject: "Your PawWalk booking is confirmed \u{1F43E}"
  end
end
