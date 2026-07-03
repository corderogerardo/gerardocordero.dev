require "test_helper"

class StripeWebhooksTest < ActionDispatch::IntegrationTest
  test "payment_intent.succeeded marks the payment succeeded, confirms the booking, and enqueues the mailer job" do
    booking = bookings(:pending_cancel)
    payment = booking.create_payment!(amount_cents: booking.price_cents, stripe_payment_intent_id: "pi_123")

    event = OpenStruct.new(
      type: "payment_intent.succeeded",
      data: OpenStruct.new(object: OpenStruct.new(id: "pi_123"))
    )

    assert_enqueued_with(job: BookingConfirmationJob, args: [ booking.id ]) do
      Stripe::Webhook.stub :construct_event, event do
        post "/stripe/webhooks", headers: { "Stripe-Signature" => "sig" }
      end
    end

    assert_response :success
    assert_equal({ "received" => true }, JSON.parse(response.body))
    assert_equal "succeeded", payment.reload.status
    assert_equal "confirmed", booking.reload.status
  end

  test "payment_intent.payment_failed marks the payment failed" do
    booking = bookings(:pending_cancel)
    payment = booking.create_payment!(amount_cents: booking.price_cents, stripe_payment_intent_id: "pi_123")

    event = OpenStruct.new(
      type: "payment_intent.payment_failed",
      data: OpenStruct.new(object: OpenStruct.new(id: "pi_123"))
    )

    Stripe::Webhook.stub :construct_event, event do
      post "/stripe/webhooks", headers: { "Stripe-Signature" => "sig" }
    end

    assert_response :success
    assert_equal "failed", payment.reload.status
  end

  test "an unhandled event type is ignored but still returns 200" do
    event = OpenStruct.new(type: "customer.created", data: OpenStruct.new(object: OpenStruct.new(id: "cus_123")))

    Stripe::Webhook.stub :construct_event, event do
      post "/stripe/webhooks", headers: { "Stripe-Signature" => "sig" }
    end

    assert_response :success
  end

  test "an invalid signature is rejected with 400" do
    Stripe::Webhook.stub :construct_event, ->(*) { raise Stripe::SignatureVerificationError.new("bad sig", "sig") } do
      post "/stripe/webhooks", headers: { "Stripe-Signature" => "bad" }
    end

    assert_response :bad_request
  end
end
