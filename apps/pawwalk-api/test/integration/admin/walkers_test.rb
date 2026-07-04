require "test_helper"

class Admin::WalkersTest < ActionDispatch::IntegrationTest
  test "index renders the admin walkers dashboard as HTML" do
    get "/admin/walkers"

    assert_response :success
    assert_equal "text/html; charset=utf-8", response.content_type
    assert_includes response.body, walkers(:luna).name
  end
end
