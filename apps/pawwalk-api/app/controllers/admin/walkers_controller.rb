module Admin
  class WalkersController < BaseController
    def index
      @walkers = Walker.order(:name)
      @recent_bookings = Booking.order(created_at: :desc).limit(10)
    end
  end
end
