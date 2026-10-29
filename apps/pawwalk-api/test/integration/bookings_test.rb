require "test_helper"

class BookingsTest < ActionDispatch::IntegrationTest
  # Creates a booking for the given owner and walker without touching shared fixtures.
  def new_booking(status:, walker: walkers(:luna), user: users(:demo), dog: dogs(:mochi))
    Booking.create!(
      user: user,
      walker: walker,
      dog: dog,
      starts_at: 2.days.from_now,
      duration_min: 30,
      price_cents: 2500,
      status: status
    )
  end

  def conflict_body
    JSON.parse(response.body)
  end

  # The native Booking model (iOS Models.swift, Android Models.kt) decodes exactly these keys.
  NATIVE_BOOKING_KEYS = %w[created_at dog_name duration_minutes id price_cents start_time status walker_id].freeze

  def assert_native_booking(row, booking)
    assert_equal NATIVE_BOOKING_KEYS, row.keys.sort
    assert_kind_of String, row["id"]
    assert_equal booking.id.to_s, row["id"]
    assert_kind_of String, row["walker_id"]
    assert_equal booking.walker_id.to_s, row["walker_id"]
    assert_equal booking.dog.name, row["dog_name"]
    assert_equal booking.duration_min, row["duration_minutes"]
    assert_equal booking.price_cents, row["price_cents"]
    assert_equal booking.status, row["status"]
    assert_equal booking.starts_at.iso8601, Time.iso8601(row["start_time"]).iso8601
    assert_equal booking.created_at.iso8601, Time.iso8601(row["created_at"]).iso8601
  end

  test "index requires auth" do
    get "/bookings"

    assert_response :unauthorized
  end

  test "index returns only the current user's bookings as a flat array" do
    get "/bookings", headers: auth_headers(users(:demo))

    assert_response :success
    body = JSON.parse(response.body)

    assert_kind_of Array, body
    ids = body.map { |b| b["id"] }
    assert_includes ids, bookings(:upcoming).id.to_s
    assert_includes ids, bookings(:pending_cancel).id.to_s
    assert_not_includes ids, bookings(:past).id.to_s # belongs to jane
  end

  test "index includes created_at on every flat booking" do
    get "/bookings", headers: auth_headers(users(:demo))

    assert_response :success
    row = JSON.parse(response.body).find { |b| b["id"] == bookings(:upcoming).id.to_s }

    assert_equal bookings(:upcoming).created_at.iso8601, Time.iso8601(row["created_at"]).iso8601
  end

  test "index filters by status" do
    get "/bookings", params: { status: "pending" }, headers: auth_headers(users(:demo))

    assert_response :success
    body = JSON.parse(response.body)

    assert_equal [ bookings(:pending_cancel).id.to_s ], body.map { |b| b["id"] }
  end

  test "index respects per_page" do
    # demo has 3 bookings in fixtures (upcoming, pending_cancel, walking_now)
    get "/bookings", params: { per_page: 2 }, headers: auth_headers(users(:demo))

    assert_response :success
    assert_equal 2, JSON.parse(response.body).size
  end

  test "index clamps an oversized per_page to the max of 100" do
    rows = Array.new(101) do
      {
        user_id: users(:demo).id, walker_id: walkers(:luna).id, dog_id: dogs(:mochi).id,
        starts_at: 2.days.from_now, duration_min: 30, price_cents: 2500, status: "pending"
      }
    end
    Booking.insert_all(rows)

    get "/bookings", params: { per_page: 99_999 }, headers: auth_headers(users(:demo))

    assert_response :success
    assert_equal 100, JSON.parse(response.body).size
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

    assert_equal 5000, body["price_cents"] # 2500 * (60 / 30)
    assert_equal "pending", body["status"]
  end

  test "create response includes created_at in the flat booking DTO" do
    post "/bookings",
      params: {
        walker_id: walkers(:luna).id,
        dog_id: dogs(:mochi).id,
        starts_at: 1.day.from_now.change(hour: 10, min: 0),
        duration_min: 30
      },
      headers: auth_headers(users(:demo))

    assert_response :created
    assert_not_nil JSON.parse(response.body)["created_at"]
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

  test "show returns the flat native Booking DTO with string ids and the native keys" do
    get "/bookings/#{bookings(:upcoming).id}", headers: auth_headers(users(:demo))

    assert_response :success
    assert_native_booking(JSON.parse(response.body), bookings(:upcoming).reload)
  end

  test "index rows use the same flat native Booking DTO" do
    get "/bookings", headers: auth_headers(users(:demo))

    assert_response :success
    rows = JSON.parse(response.body)
    assert_equal bookings(:upcoming).id.to_s, rows.find { |r| r["id"] == bookings(:upcoming).id.to_s }["id"]
    rows.each do |row|
      assert_equal NATIVE_BOOKING_KEYS, row.keys.sort
    end
  end

  test "create returns the flat native DTO and does not create a Dog" do
    dog_count = Dog.count

    post "/bookings",
      params: { walker_id: walkers(:luna).id, dog_id: dogs(:mochi).id, starts_at: 1.day.from_now, duration_min: 30 },
      headers: auth_headers(users(:demo))

    assert_response :created
    created = Booking.find(JSON.parse(response.body)["id"].to_i)
    assert_native_booking(JSON.parse(response.body), created)
    assert_equal dogs(:mochi).name, JSON.parse(response.body)["dog_name"]
    assert_equal dog_count, Dog.count
  end

  test "walker transition responses use the flat native DTO" do
    booking = new_booking(status: "pending")

    post "/bookings/#{booking.id}/accept", headers: auth_headers(users(:luna_walker))

    assert_response :success
    assert_native_booking(JSON.parse(response.body), booking.reload)
  end

  test "owner cancel response uses the flat native DTO" do
    booking = new_booking(status: "pending")

    post "/bookings/#{booking.id}/cancel", headers: auth_headers(users(:demo))

    assert_response :success
    assert_native_booking(JSON.parse(response.body), booking.reload)
  end

  test "assigned rows use the flat native DTO" do
    get "/bookings/assigned", headers: auth_headers(users(:luna_walker))

    assert_response :success
    rows = JSON.parse(response.body)
    assert_not_empty rows
    rows.each { |row| assert_equal NATIVE_BOOKING_KEYS, row.keys.sort }
  end

  test "show for another user's booking returns 404" do
    get "/bookings/#{bookings(:past).id}", headers: auth_headers(users(:demo))

    assert_response :not_found
    assert_equal "not found", JSON.parse(response.body)["error"]
  end

  # --- Assigned bookings (walker view) ---

  test "assigned lists only bookings assigned to the linked walker" do
    get "/bookings/assigned", headers: auth_headers(users(:luna_walker))

    assert_response :success
    ids = JSON.parse(response.body).map { |b| b["id"] }

    assert_includes ids, bookings(:upcoming).id.to_s
    assert_includes ids, bookings(:walking_now).id.to_s
    assert_not_includes ids, bookings(:pending_cancel).id.to_s # assigned to sam, unlinked profile
  end

  test "assigned is empty for a walker-role user with no linked profile" do
    unlinked = User.create!(name: "Unlinked", email: "unlinked@example.com", password: "secret123", role: :walker)
    get "/bookings/assigned", headers: auth_headers(unlinked)

    assert_response :success
    assert_equal [], JSON.parse(response.body)
  end

  # --- Walker transitions ---

  test "accept moves a pending booking to confirmed for the assigned walker" do
    booking = new_booking(status: "pending")

    post "/bookings/#{booking.id}/accept", headers: auth_headers(users(:luna_walker))

    assert_response :success
    assert_equal "confirmed", JSON.parse(response.body)["status"]
    assert_equal "confirmed", booking.reload.status
  end

  test "decline moves a pending booking to cancelled for the assigned walker" do
    booking = new_booking(status: "pending")

    post "/bookings/#{booking.id}/decline", headers: auth_headers(users(:luna_walker))

    assert_response :success
    assert_equal "cancelled", JSON.parse(response.body)["status"]
    assert_equal "cancelled", booking.reload.status
  end

  test "start moves a confirmed booking to in_progress for the assigned walker" do
    booking = new_booking(status: "confirmed")

    post "/bookings/#{booking.id}/start", headers: auth_headers(users(:luna_walker))

    assert_response :success
    assert_equal "in_progress", JSON.parse(response.body)["status"]
    assert_equal "in_progress", booking.reload.status
  end

  test "start is allowed on a booking confirmed by the payment webhook" do
    booking = new_booking(status: "pending")
    booking.create_payment!(amount_cents: booking.price_cents, stripe_payment_intent_id: "pi_t3")
    event = OpenStruct.new(
      type: "payment_intent.succeeded",
      data: OpenStruct.new(object: OpenStruct.new(id: "pi_t3"))
    )

    Stripe::Webhook.stub :construct_event, event do
      post "/stripe/webhooks", headers: { "Stripe-Signature" => "sig" }
    end
    assert_equal "confirmed", booking.reload.status

    post "/bookings/#{booking.id}/start", headers: auth_headers(users(:luna_walker))

    assert_response :success
    assert_equal "in_progress", booking.reload.status
  end

  test "complete moves an in_progress booking to completed for the assigned walker" do
    post "/bookings/#{bookings(:walking_now).id}/complete", headers: auth_headers(users(:luna_walker))

    assert_response :success
    assert_equal "completed", JSON.parse(response.body)["status"]
    assert_equal "completed", bookings(:walking_now).reload.status
  end

  test "an invalid walker transition returns 409 transition_conflict and leaves the booking unchanged" do
    booking = new_booking(status: "confirmed")

    post "/bookings/#{booking.id}/accept", headers: auth_headers(users(:luna_walker))

    assert_response :conflict
    assert_equal "transition_conflict", conflict_body["code"]
    assert_match(/cannot accept a confirmed booking/, conflict_body["detail"])
    assert_equal "confirmed", booking.reload.status
  end

  test "a second accept of the same booking conflicts instead of committing twice" do
    booking = new_booking(status: "pending")
    post "/bookings/#{booking.id}/accept", headers: auth_headers(users(:luna_walker))

    post "/bookings/#{booking.id}/accept", headers: auth_headers(users(:luna_walker))

    assert_response :conflict
    assert_equal "transition_conflict", conflict_body["code"]
    assert_equal "confirmed", booking.reload.status
  end

  test "a walker cannot transition a booking assigned to another walker, and it stays hidden" do
    booking = bookings(:pending_cancel) # assigned to sam, whose profile is unlinked

    post "/bookings/#{booking.id}/accept", headers: auth_headers(users(:luna_walker))

    assert_response :not_found
    assert_equal "not found", JSON.parse(response.body)["error"]
    assert_equal "pending", booking.reload.status
  end

  test "an owner cannot perform walker transitions on their own booking" do
    booking = new_booking(status: "pending")

    post "/bookings/#{booking.id}/accept", headers: auth_headers(users(:demo))

    assert_response :not_found
    assert_equal "pending", booking.reload.status
  end

  test "a walker-role user without a linked profile cannot transition bookings" do
    unlinked = User.create!(name: "Unlinked", email: "unlinked2@example.com", password: "secret123", role: :walker)
    booking = new_booking(status: "pending")

    post "/bookings/#{booking.id}/accept", headers: auth_headers(unlinked)

    assert_response :not_found
    assert_equal "pending", booking.reload.status
  end

  # --- Owner cancellation (POST native route + PATCH compatibility alias) ---

  test "owner cancels their pending booking with POST" do
    booking = new_booking(status: "pending")

    post "/bookings/#{booking.id}/cancel", headers: auth_headers(users(:demo))

    assert_response :success
    assert_equal "cancelled", JSON.parse(response.body)["status"]
    assert_equal "cancelled", booking.reload.status
  end

  test "owner cancels their confirmed booking with POST" do
    booking = new_booking(status: "confirmed")

    post "/bookings/#{booking.id}/cancel", headers: auth_headers(users(:demo))

    assert_response :success
    assert_equal "cancelled", booking.reload.status
  end

  test "cancel a pending booking with the PATCH compatibility alias" do
    patch "/bookings/#{bookings(:pending_cancel).id}/cancel", headers: auth_headers(users(:demo))

    assert_response :success
    assert_equal "cancelled", JSON.parse(response.body)["status"]
  end

  test "PATCH and POST cancel produce the same owner-visible result" do
    patched = new_booking(status: "pending")
    posted = new_booking(status: "pending")

    patch "/bookings/#{patched.id}/cancel", headers: auth_headers(users(:demo))
    patch_body = JSON.parse(response.body)
    post "/bookings/#{posted.id}/cancel", headers: auth_headers(users(:demo))
    post_body = JSON.parse(response.body)

    assert_equal patch_body.keys.sort, post_body.keys.sort
    assert_equal patch_body["status"], post_body["status"]
    assert_equal "cancelled", patched.reload.status
    assert_equal "cancelled", posted.reload.status
  end

  test "cancel a completed booking is rejected with 409 transition_conflict" do
    patch "/bookings/#{bookings(:past).id}/cancel", headers: auth_headers(users(:jane))

    assert_response :conflict
    assert_equal "transition_conflict", conflict_body["code"]
    assert_match(/cannot cancel a completed booking/, conflict_body["detail"])
    assert_equal "completed", bookings(:past).reload.status
  end

  test "owner cannot cancel another user's booking, and it stays hidden" do
    post "/bookings/#{bookings(:past).id}/cancel", headers: auth_headers(users(:demo))

    assert_response :not_found
    assert_equal "completed", bookings(:past).reload.status
  end

  test "a walker-role user cannot cancel bookings as an owner, on POST or the PATCH alias" do
    booking = new_booking(status: "pending")

    post "/bookings/#{booking.id}/cancel", headers: auth_headers(users(:luna_walker))
    assert_response :forbidden
    assert_equal "This action is for pet owners", JSON.parse(response.body)["error"]

    patch "/bookings/#{booking.id}/cancel", headers: auth_headers(users(:luna_walker))
    assert_response :forbidden

    assert_equal "pending", booking.reload.status
  end

  # --- Owner-role guard (owner routes are owner-only; walker routes use the linked profile) ---

  test "a walker-role user is forbidden from the owner booking list" do
    get "/bookings", headers: auth_headers(users(:luna_walker))

    assert_response :forbidden
    assert_equal "This action is for pet owners", JSON.parse(response.body)["error"]
  end

  test "a walker-role user is forbidden from owner booking detail, even for an assigned booking" do
    get "/bookings/#{bookings(:upcoming).id}", headers: auth_headers(users(:luna_walker))

    assert_response :forbidden
    assert_equal "This action is for pet owners", JSON.parse(response.body)["error"]
  end

  test "a walker-role user cannot create a booking, and no booking is written" do
    booking_count = Booking.count

    post "/bookings",
      params: { walker_id: walkers(:luna).id, dog_id: dogs(:mochi).id, starts_at: 1.day.from_now, duration_min: 30 },
      headers: auth_headers(users(:luna_walker))

    assert_response :forbidden
    assert_equal booking_count, Booking.count
  end

  test "a linked walker keeps the assigned list and transitions under the owner-role guard" do
    get "/bookings/assigned", headers: auth_headers(users(:luna_walker))
    assert_response :success

    booking = new_booking(status: "pending")
    post "/bookings/#{booking.id}/accept", headers: auth_headers(users(:luna_walker))
    assert_response :success
    assert_equal "confirmed", booking.reload.status
  end

  test "an owner-role user is not blocked by the walker-only assigned route" do
    get "/bookings/assigned", headers: auth_headers(users(:demo))

    assert_response :success
    assert_equal [], JSON.parse(response.body)
  end

  # --- Role and Walker-link guard ---

  test "signup cannot self-elevate to the walker role" do
    post "/signup", params: { name: "Climber", email: "climber@example.com", password: "secret123", role: "walker" }

    assert_response :created
    assert_equal "owner", User.find_by!(email: "climber@example.com").role
  end

  test "a Walker profile can be linked to at most one user" do
    second = Walker.new(name: "Duplicate", city: "Austin", price_per_30_min_cents: 2000, user: users(:luna_walker))

    assert_raises(ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid) { second.save! }
  end
end
