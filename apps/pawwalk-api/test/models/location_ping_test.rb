require "test_helper"

class LocationPingTest < ActiveSupport::TestCase
  test "is valid within lat/lng bounds" do
    ping = LocationPing.new(walk_session: walk_sessions(:for_past_booking), lat: 30.0, lng: -97.0, recorded_at: Time.current)

    assert ping.valid?
  end

  test "is invalid when lat is out of range" do
    ping = LocationPing.new(walk_session: walk_sessions(:for_past_booking), lat: 90.1, lng: 0, recorded_at: Time.current)

    assert_not ping.valid?
    assert_includes ping.errors[:lat], "must be less than or equal to 90"
  end

  test "is invalid when lng is out of range" do
    ping = LocationPing.new(walk_session: walk_sessions(:for_past_booking), lat: 0, lng: -180.1, recorded_at: Time.current)

    assert_not ping.valid?
    assert_includes ping.errors[:lng], "must be greater than or equal to -180"
  end
end
