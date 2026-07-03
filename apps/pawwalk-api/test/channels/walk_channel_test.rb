require "test_helper"

class WalkChannelTest < ActionCable::Channel::TestCase
  test "the booking owner can subscribe to their walk session" do
    stub_connection current_user: users(:demo)

    subscribe(id: walk_sessions(:in_progress).id)

    assert subscription.confirmed?
    assert_has_stream_for walk_sessions(:in_progress)
  end

  test "a stranger is rejected" do
    stub_connection current_user: users(:jane)

    subscribe(id: walk_sessions(:in_progress).id)

    assert subscription.rejected?
  end
end
