class User < ApplicationRecord
  has_secure_password

  has_many :dogs
  has_many :bookings

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :name, presence: true
  validates :email, presence: true,
                     uniqueness: { case_sensitive: false },
                     format: { with: /\A[^@\s]+@[^@\s]+\z/ }
end
