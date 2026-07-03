class CreateLocationPings < ActiveRecord::Migration[8.1]
  def change
    create_table :location_pings do |t|
      t.references :walk_session, null: false, foreign_key: true
      t.decimal :lat, precision: 9, scale: 6, null: false
      t.decimal :lng, precision: 9, scale: 6, null: false
      t.datetime :recorded_at, null: false

      t.timestamps
    end
  end
end
