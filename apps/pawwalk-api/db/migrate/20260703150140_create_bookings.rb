class CreateBookings < ActiveRecord::Migration[8.1]
  def change
    create_table :bookings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :walker, null: false, foreign_key: true
      t.references :dog, null: false, foreign_key: true
      t.datetime :starts_at, null: false
      t.integer :duration_min, default: 30
      t.integer :price_cents, null: false
      t.string :status, default: "pending", index: true

      t.timestamps
    end
  end
end
