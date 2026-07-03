class AddBookingsCountToWalkers < ActiveRecord::Migration[8.1]
  def change
    add_column :walkers, :bookings_count, :integer, default: 0, null: false

    reversible do |dir|
      dir.up { Walker.find_each { |walker| Walker.reset_counters(walker.id, :bookings) } }
    end
  end
end
