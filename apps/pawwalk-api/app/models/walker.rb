class Walker < ApplicationRecord
  has_many :bookings
  has_many :payouts

  validates :name, presence: true
  validates :city, presence: true
  validates :price_per_30_min_cents, presence: true,
                                      numericality: { only_integer: true, greater_than: 0 }

  scope :in_city, ->(city) { where("LOWER(city) = ?", city.to_s.downcase) }

  def price_label
    "$#{price_per_30_min_cents / 100} / 30 min"
  end
end
