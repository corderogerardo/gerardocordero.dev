require "test_helper"

class WalkSessionsTest < ActionDispatch::IntegrationTest
  test "starting a walk on a confirmed booking creates a session and flips the booking to in_progress" do
    booking = bookings(:upcoming) # status: confirmed, no session yet

    post "/bookings/#{booking.id}/walk_session", headers: auth_headers(users(:demo))

    assert_response :created
    body = JSON.parse(response.body)
    assert_not_nil body["walk_session"]["started_at"]

    booking.reload
    assert booking.in_progress?
    assert_not_nil booking.walk_session
  end

  test "starting a walk on a pending booking is rejected" do
    booking = bookings(:pending_cancel) # status: pending

    post "/bookings/#{booking.id}/walk_session", headers: auth_headers(users(:demo))

    assert_response :unprocessable_content
    assert_equal "walk can only start on a confirmed booking", JSON.parse(response.body)["error"]
  end

  test "starting a walk twice is rejected" do
    booking = bookings(:upcoming)

    post "/bookings/#{booking.id}/walk_session", headers: auth_headers(users(:demo))
    assert_response :created

    post "/bookings/#{booking.id}/walk_session", headers: auth_headers(users(:demo))
    assert_response :unprocessable_content
    assert_equal "walk can only start on a confirmed booking", JSON.parse(response.body)["error"]
  end

  test "ending an active walk sets ended_at and completes the booking" do
    booking = bookings(:walking_now)

    patch "/bookings/#{booking.id}/walk_session", headers: auth_headers(users(:demo))

    assert_response :success
    body = JSON.parse(response.body)
    assert_not_nil body["walk_session"]["ended_at"]

    booking.reload
    assert booking.completed?
    assert_not_nil booking.walk_session.ended_at
  end

  test "ending a walk that never started is rejected" do
    booking = bookings(:upcoming) # confirmed, no session

    patch "/bookings/#{booking.id}/walk_session", headers: auth_headers(users(:demo))

    assert_response :unprocessable_content
    assert_equal "walk session is not active", JSON.parse(response.body)["error"]
  end

  test "ending an already-ended walk is rejected" do
    booking = bookings(:past) # completed, session already ended

    patch "/bookings/#{booking.id}/walk_session", headers: auth_headers(users(:jane))

    assert_response :unprocessable_content
    assert_equal "walk session is not active", JSON.parse(response.body)["error"]
  end

  test "starting a walk on someone else's booking returns 404" do
    booking = bookings(:upcoming) # belongs to demo

    post "/bookings/#{booking.id}/walk_session", headers: auth_headers(users(:jane))

    assert_response :not_found
  end
end
