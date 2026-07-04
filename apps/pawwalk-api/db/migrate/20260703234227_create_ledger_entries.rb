class CreateLedgerEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :ledger_entries do |t|
      t.string :account, null: false
      t.integer :amount_cents, null: false
      t.references :payout, null: true, foreign_key: true

      t.timestamps
    end
  end
end
