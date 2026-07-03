# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_07_03_234227) do
  create_table "bookings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "dog_id", null: false
    t.integer "duration_min", default: 30
    t.integer "price_cents", null: false
    t.datetime "starts_at", null: false
    t.string "status", default: "pending"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.integer "walker_id", null: false
    t.index ["dog_id"], name: "index_bookings_on_dog_id"
    t.index ["status"], name: "index_bookings_on_status"
    t.index ["user_id", "status", "starts_at"], name: "index_bookings_on_user_id_and_status_and_starts_at"
    t.index ["user_id"], name: "index_bookings_on_user_id"
    t.index ["walker_id"], name: "index_bookings_on_walker_id"
  end

  create_table "dogs", force: :cascade do |t|
    t.string "breed"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.text "notes"
    t.string "size", default: "medium"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_dogs_on_user_id"
  end

  create_table "ledger_entries", force: :cascade do |t|
    t.string "account", null: false
    t.integer "amount_cents", null: false
    t.datetime "created_at", null: false
    t.integer "payout_id"
    t.datetime "updated_at", null: false
    t.index ["payout_id"], name: "index_ledger_entries_on_payout_id"
  end

  create_table "location_pings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.decimal "lat", precision: 9, scale: 6, null: false
    t.decimal "lng", precision: 9, scale: 6, null: false
    t.datetime "recorded_at", null: false
    t.datetime "updated_at", null: false
    t.integer "walk_session_id", null: false
    t.index ["walk_session_id"], name: "index_location_pings_on_walk_session_id"
  end

  create_table "payments", force: :cascade do |t|
    t.integer "amount_cents", null: false
    t.integer "booking_id", null: false
    t.datetime "created_at", null: false
    t.string "status", default: "processing"
    t.string "stripe_payment_intent_id"
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_payments_on_booking_id", unique: true
    t.index ["stripe_payment_intent_id"], name: "index_payments_on_stripe_payment_intent_id"
  end

  create_table "payouts", force: :cascade do |t|
    t.integer "amount_cents", null: false
    t.datetime "created_at", null: false
    t.string "idempotency_key", null: false
    t.string "status", default: "pending"
    t.datetime "updated_at", null: false
    t.integer "walker_id", null: false
    t.index ["idempotency_key"], name: "index_payouts_on_idempotency_key", unique: true
    t.index ["walker_id"], name: "index_payouts_on_walker_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name"
    t.string "password_digest"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "walk_sessions", force: :cascade do |t|
    t.integer "booking_id", null: false
    t.datetime "created_at", null: false
    t.datetime "ended_at"
    t.datetime "started_at"
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_walk_sessions_on_booking_id", unique: true
  end

  create_table "walkers", force: :cascade do |t|
    t.text "bio"
    t.integer "bookings_count", default: 0, null: false
    t.string "city"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.integer "price_per_30_min_cents", null: false
    t.decimal "rating", precision: 3, scale: 1, default: "5.0"
    t.datetime "updated_at", null: false
  end

  add_foreign_key "bookings", "dogs"
  add_foreign_key "bookings", "users"
  add_foreign_key "bookings", "walkers"
  add_foreign_key "dogs", "users"
  add_foreign_key "ledger_entries", "payouts"
  add_foreign_key "location_pings", "walk_sessions"
  add_foreign_key "payments", "bookings"
  add_foreign_key "payouts", "walkers"
  add_foreign_key "walk_sessions", "bookings"
end
