require "test_helper"

class LocationPingsTest < ActionDispatch::IntegrationTest
  include ActionCable::TestHelper

  test "pinging an active walk creates a ping and broadcasts it to the walk channel" do
    booking = bookings(:walking_now)
    walk_session = walk_sessions(:in_progress)

    assert_difference("LocationPing.count", 1) do
      assert_broadcasts(WalkChannel.broadcasting_for(walk_session), 1) do
        post "/bookings/#{booking.id}/location_pings",
             params: { lat: 30.269, lng: -97.741 },
             headers: auth_headers(users(:demo))
      end
    end

    assert_response :created
    body = JSON.parse(response.body)
    assert_equal "30.269", body["location_ping"]["lat"]
  end

  test "pinging before the walk starts is rejected" do
    booking = bookings(:upcoming) # confirmed, no session

    post "/bookings/#{booking.id}/location_pings",
         params: { lat: 30.269, lng: -97.741 },
         headers: auth_headers(users(:demo))

    assert_response :unprocessable_content
    assert_equal "walk session is not active", JSON.parse(response.body)["error"]
  end

  test "pinging after the walk ends is rejected" do
    booking = bookings(:past) # completed, session already ended

    post "/bookings/#{booking.id}/location_pings",
         params: { lat: 30.269, lng: -97.741 },
         headers: auth_headers(users(:jane))

    assert_response :unprocessable_content
    assert_equal "walk session is not active", JSON.parse(response.body)["error"]
  end

  test "the pings index replays the walk in recorded_at order" do
    booking = bookings(:past)

    get "/bookings/#{booking.id}/location_pings", headers: auth_headers(users(:jane))

    assert_response :success
    body = JSON.parse(response.body)
    recorded_ats = body["location_pings"].map { |p| p["recorded_at"] }
    assert_equal recorded_ats.sort, recorded_ats
    assert_equal 2, body["location_pings"].size
  end
end
