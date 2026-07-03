class AddIndexToBookingsOnUserStatusStartsAt < ActiveRecord::Migration[8.1]
  def change
    add_index :bookings, [ :user_id, :status, :starts_at ]
  end
end
