require "test_helper"

class WalkSessionTest < ActiveSupport::TestCase
  test "destroying a walk session destroys its location pings" do
    session = walk_sessions(:for_past_booking)

    assert_difference("LocationPing.count", -session.location_pings.count) do
      session.destroy
    end
  end
end
