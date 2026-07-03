class Dog < ApplicationRecord
  belongs_to :user
  has_many :bookings

  validates :name, presence: true
  validates :size, inclusion: { in: %w[small medium large] }
end
