require "test_helper"

class WalkersTest < ActionDispatch::IntegrationTest
  test "index is public and lists walkers ordered by rating desc" do
    get "/walkers"

    assert_response :success
    body = JSON.parse(response.body)

    ratings = body["walkers"].map { |w| w["rating"].to_f }
    assert_equal ratings.sort.reverse, ratings
    assert_includes body["walkers"].map { |w| w["name"] }, walkers(:luna).name
  end

  test "index filters by city case-insensitively" do
    get "/walkers", params: { city: "austin" }

    assert_response :success
    body = JSON.parse(response.body)

    assert_equal [ walkers(:luna).id ], body["walkers"].map { |w| w["id"] }
  end

  test "show returns a single walker" do
    get "/walkers/#{walkers(:luna).id}"

    assert_response :success
    body = JSON.parse(response.body)

    assert_equal walkers(:luna).name, body["walker"]["name"]
    assert_equal walkers(:luna).price_label, body["walker"]["price_label"]
  end

  test "show with an unknown id returns 404" do
    get "/walkers/999999"

    assert_response :not_found
    assert_equal "not found", JSON.parse(response.body)["error"]
  end
end
