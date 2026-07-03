class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker, counter_cache: true
  belongs_to :dog
  has_one :walk_session
  has_one :payment, dependent: :destroy

  enum :status, {
    pending: "pending",
    confirmed: "confirmed",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled"
  }

  validates :starts_at, presence: true
  validates :duration_min, inclusion: { in: [ 30, 60 ] }
  validates :price_cents, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validate :dog_belongs_to_booker

  scope :upcoming, -> { where(starts_at: Time.current..).where.not(status: :cancelled) }
  scope :for_walker, ->(walker) { where(walker: walker) }

  # Price is always derived from the walker's rate, never accepted from the client.
  def compute_price!
    self.price_cents = walker.price_per_30_min_cents * (duration_min / 30)
  end

  private

  def dog_belongs_to_booker
    return if dog.nil? || user.nil?

    errors.add(:dog, "must belong to the user making the booking") if dog.user_id != user_id
  end
end
