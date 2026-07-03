class Payment < ApplicationRecord
  belongs_to :booking

  enum :status, { processing: "processing", succeeded: "succeeded", failed: "failed" }

  validates :amount_cents, numericality: { only_integer: true, greater_than: 0 }
end
