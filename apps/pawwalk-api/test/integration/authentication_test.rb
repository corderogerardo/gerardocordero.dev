require "test_helper"

class AuthenticationTest < ActionDispatch::IntegrationTest
  test "signup creates a user and returns a token" do
    post "/signup", params: { name: "Cur L", email: "curl@example.com", password: "secret123" }

    assert_response :created
    body = JSON.parse(response.body)

    assert_equal "curl@example.com", body["user"]["email"]
    assert_nil body["user"]["password"]

    decoded = JsonWebToken.decode(body["token"])
    assert_equal body["user"]["id"], decoded[:user_id]
  end

  test "signup with a duplicate email is rejected" do
    post "/signup", params: { name: "Dupe", email: users(:demo).email, password: "secret123" }

    assert_response :unprocessable_content
    body = JSON.parse(response.body)

    assert_includes body["errors"].join, "Email has already been taken"
  end

  test "login with correct credentials returns a token" do
    post "/login", params: { email: users(:demo).email, password: "walkies123" }

    assert_response :success
    body = JSON.parse(response.body)

    assert_equal users(:demo).id, body["user"]["id"]
    assert JsonWebToken.decode(body["token"])
  end

  test "login with the wrong password is rejected" do
    post "/login", params: { email: users(:demo).email, password: "wrong-password" }

    assert_response :unauthorized
    assert_equal "invalid email or password", JSON.parse(response.body)["error"]
  end

  test "me returns the current user for a valid token" do
    token = JsonWebToken.encode({ user_id: users(:demo).id })

    get "/me", headers: { "Authorization" => "Bearer #{token}" }

    assert_response :success
    assert_equal users(:demo).email, JSON.parse(response.body)["user"]["email"]
  end

  test "me is rejected with no token" do
    get "/me"

    assert_response :unauthorized
  end

  test "me is rejected with a garbage token" do
    get "/me", headers: { "Authorization" => "Bearer garbage" }

    assert_response :unauthorized
  end

  test "me is rejected with an expired token" do
    token = JsonWebToken.encode({ user_id: users(:demo).id }, exp: 1.hour.ago)

    get "/me", headers: { "Authorization" => "Bearer #{token}" }

    assert_response :unauthorized
  end
end
