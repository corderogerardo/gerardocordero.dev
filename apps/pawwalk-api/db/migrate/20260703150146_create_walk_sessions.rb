class CreateWalkSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :walk_sessions do |t|
      t.references :booking, null: false, foreign_key: true, index: { unique: true }
      t.datetime :started_at
      t.datetime :ended_at

      t.timestamps
    end
  end
end
