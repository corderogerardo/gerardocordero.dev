require "test_helper"

module ApplicationCable
  class ConnectionTest < ActionCable::Connection::TestCase
    test "connects with a valid token" do
      connect "/cable?token=#{JsonWebToken.encode({ user_id: users(:demo).id })}"

      assert_equal users(:demo), connection.current_user
    end

    test "rejects connection with a garbage token" do
      assert_reject_connection do
        connect "/cable?token=garbage"
      end
    end

    test "rejects connection with no token" do
      assert_reject_connection do
        connect "/cable"
      end
    end
  end
end
