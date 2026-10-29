# Exclusive account roles. Legacy accounts have no role yet, so the column default makes every
# existing row an owner without rewriting any record. Walker privileges are granted only by trusted
# provisioning; signup never accepts a role (see UsersController#user_params).
class AddRoleToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :role, :string, null: false, default: "owner"
  end
end
