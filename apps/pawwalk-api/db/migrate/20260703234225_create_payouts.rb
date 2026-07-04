class CreatePayouts < ActiveRecord::Migration[8.1]
  def change
    create_table :payouts do |t|
      t.references :walker, null: false, foreign_key: true
      t.integer :amount_cents, null: false
      t.string :idempotency_key, null: false
      t.string :status, default: "pending"

      t.timestamps
    end

    add_index :payouts, :idempotency_key, unique: true
  end
end
