class PaymentsController < ApplicationController
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
end
