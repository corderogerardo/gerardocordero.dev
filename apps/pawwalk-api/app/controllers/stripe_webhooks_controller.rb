class StripeWebhooksController < ApplicationController
  skip_before_action :authenticate_request

  def create
    event = Stripe::Webhook.construct_event(
      request.body.read, request.env["HTTP_STRIPE_SIGNATURE"], ENV["STRIPE_WEBHOOK_SECRET"]
    )

    case event.type
    when "payment_intent.succeeded"
      handle_succeeded(event.data.object)
    when "payment_intent.payment_failed"
      handle_failed(event.data.object)
    end

    render json: { received: true }, status: :ok
  rescue JSON::ParserError, Stripe::SignatureVerificationError
    render json: { error: "invalid payload" }, status: :bad_request
  end

  private

  def handle_succeeded(intent)
    payment = Payment.find_by(stripe_payment_intent_id: intent.id)
    return unless payment

    payment.update!(status: :succeeded)
    payment.booking.update!(status: :confirmed)
    BookingConfirmationJob.perform_later(payment.booking_id)
  end

  def handle_failed(intent)
    Payment.find_by(stripe_payment_intent_id: intent.id)&.update!(status: :failed)
  end
end
