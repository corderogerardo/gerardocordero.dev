# Optional, unique link from a Walker catalog profile to the User account that operates it.
# Existing profiles stay NULL (unclaimed) until trusted provisioning links them. The unique index
# enforces at most one Walker profile per User.
class AddUserToWalkers < ActiveRecord::Migration[8.1]
  def change
    add_reference :walkers, :user, null: true, foreign_key: true, index: { unique: true }
  end
end
