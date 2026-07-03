require "test_helper"

class BookingsTest < ActionDispatch::IntegrationTest
  test "index requires auth" do
    get "/bookings"

    assert_response :unauthorized
  end

  test "index returns only the current user's bookings" do
    get "/bookings", headers: auth_headers(users(:demo))

    assert_response :success
    body = JSON.parse(response.body)

    ids = body["bookings"].map { |b| b["id"] }
    assert_includes ids, bookings(:upcoming).id
    assert_includes ids, bookings(:pending_cancel).id
    assert_not_includes ids, bookings(:past).id # belongs to jane
  end

  test "index filters by status" do
    get "/bookings", params: { status: "pending" }, headers: auth_headers(users(:demo))

    assert_response :success
    body = JSON.parse(response.body)

    assert_equal [ bookings(:pending_cancel).id ], body["bookings"].map { |b| b["id"] }
  end

  test "create computes price server-side from the walker's rate" do
    post "/bookings",
      params: {
        walker_id: walkers(:luna).id,
        dog_id: dogs(:mochi).id,
        starts_at: 1.day.from_now.change(hour: 10, min: 0),
        duration_min: 60
      },
      headers: auth_headers(users(:demo))

    assert_response :created
    body = JSON.parse(response.body)

    assert_equal 5000, body["booking"]["price_cents"] # 2500 * (60 / 30)
    assert_equal "pending", body["booking"]["status"]
  end

  test "create is rejected when the dog belongs to another user" do
    post "/bookings",
      params: {
        walker_id: walkers(:luna).id,
        dog_id: dogs(:biscuit).id, # belongs to jane, not demo
        starts_at: 1.day.from_now,
        duration_min: 30
      },
      headers: auth_headers(users(:demo))

    assert_response :unprocessable_content
    body = JSON.parse(response.body)

    assert_includes body["errors"].join, "must belong to the user making the booking"
  end

  test "show for another user's booking returns 404" do
    get "/bookings/#{bookings(:past).id}", headers: auth_headers(users(:demo))

    assert_response :not_found
    assert_equal "not found", JSON.parse(response.body)["error"]
  end

  test "cancel a pending booking" do
    patch "/bookings/#{bookings(:pending_cancel).id}/cancel", headers: auth_headers(users(:demo))

    assert_response :success
    assert_equal "cancelled", JSON.parse(response.body)["booking"]["status"]
  end

  test "cancel a completed booking is rejected" do
    patch "/bookings/#{bookings(:past).id}/cancel", headers: auth_headers(users(:jane))

    assert_response :unprocessable_content
    assert_equal "cannot cancel a completed booking", JSON.parse(response.body)["error"]
  end
end
