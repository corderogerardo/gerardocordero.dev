require "test_helper"

class PaymentsTest < ActionDispatch::IntegrationTest
  test "pay a pending booking creates a Stripe PaymentIntent and a Payment row" do
    booking = bookings(:pending_cancel)
    intent = OpenStruct.new(id: "pi_123", client_secret: "pi_123_secret_abc")

    Stripe::PaymentIntent.stub :create, intent do
      post "/bookings/#{booking.id}/pay", headers: auth_headers(users(:demo))
    end

    assert_response :created
    body = JSON.parse(response.body)

    assert_equal "processing", body["payment"]["status"]
    assert_equal booking.price_cents, body["payment"]["amount_cents"]
    assert_equal "pi_123_secret_abc", body["client_secret"]

    payment = booking.reload.payment
    assert_equal booking.price_cents, payment.amount_cents
    assert_equal "pi_123", payment.stripe_payment_intent_id
  end

  test "pay a non-pending booking is rejected" do
    booking = bookings(:upcoming) # status: confirmed

    post "/bookings/#{booking.id}/pay", headers: auth_headers(users(:demo))

    assert_response :unprocessable_content
    assert_equal "only pending bookings can be paid", JSON.parse(response.body)["error"]
  end

  test "paying a booking twice is rejected" do
    booking = bookings(:pending_cancel)
    intent = OpenStruct.new(id: "pi_123", client_secret: "pi_123_secret_abc")

    Stripe::PaymentIntent.stub :create, intent do
      post "/bookings/#{booking.id}/pay", headers: auth_headers(users(:demo))
    end
    assert_response :created

    post "/bookings/#{booking.id}/pay", headers: auth_headers(users(:demo))

    assert_response :unprocessable_content
    assert_equal "only pending bookings can be paid", JSON.parse(response.body)["error"]
  end

  test "pay someone else's booking returns 404" do
    booking = bookings(:past) # belongs to jane

    post "/bookings/#{booking.id}/pay", headers: auth_headers(users(:demo))

    assert_response :not_found
  end

  test "pay without a token is rejected" do
    post "/bookings/#{bookings(:pending_cancel).id}/pay"

    assert_response :unauthorized
  end
end
