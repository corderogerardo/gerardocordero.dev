class WalkSession < ApplicationRecord
  belongs_to :booking
  has_many :location_pings, dependent: :destroy
end
