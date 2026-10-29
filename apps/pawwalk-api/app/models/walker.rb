class Walker < ApplicationRecord
  # Optional and unique: a catalog profile may stay unclaimed (NULL) until trusted provisioning links it.
  belongs_to :user, optional: true, inverse_of: :walker_profile

  has_many :bookings
  has_many :payouts

  validates :name, presence: true
  validates :city, presence: true
  validates :user_id, uniqueness: true, allow_nil: true
  validate :linked_user_must_be_walker
  validates :price_per_30_min_cents, presence: true,
                                      numericality: { only_integer: true, greater_than: 0 }

  scope :in_city, ->(city) { where("LOWER(city) = ?", city.to_s.downcase) }

  def price_label
    "$#{price_per_30_min_cents / 100} / 30 min"
  end

  private

  def linked_user_must_be_walker
    return if user.nil? || user.walker?

    errors.add(:user, "must have the walker role to own a walker profile")
  end
end
