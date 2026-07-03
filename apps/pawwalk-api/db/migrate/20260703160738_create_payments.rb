class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_table :payments do |t|
      t.references :booking, null: false, foreign_key: true, index: { unique: true }
      t.integer :amount_cents, null: false
      t.string :stripe_payment_intent_id
      t.string :status, default: "processing"

      t.timestamps
    end

    add_index :payments, :stripe_payment_intent_id
  end
end
