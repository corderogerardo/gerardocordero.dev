class User < ApplicationRecord
  has_secure_password

  # Roles are exclusive: a user is an owner or a walker, never both. Legacy rows default to owner.
  # Walker privileges come only from trusted provisioning, never from signup params.
  enum :role, { owner: "owner", walker: "walker" }, default: "owner", validate: true

  has_many :dogs
  has_many :bookings
  has_one :walker_profile, class_name: "Walker", inverse_of: :user, dependent: :nullify

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :name, presence: true
  validates :email, presence: true,
                     uniqueness: { case_sensitive: false },
                     format: { with: /\A[^@\s]+@[^@\s]+\z/ }
end
