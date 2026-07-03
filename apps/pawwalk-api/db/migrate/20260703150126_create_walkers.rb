class CreateWalkers < ActiveRecord::Migration[8.1]
  def change
    create_table :walkers do |t|
      t.string :name, null: false
      t.text :bio
      t.string :city
      t.integer :price_per_30_min_cents, null: false
      t.decimal :rating, precision: 3, scale: 1, default: 5.0

      t.timestamps
    end
  end
end
