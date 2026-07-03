class WalkersController < ApplicationController
  skip_before_action :authenticate_request

  def index
    walkers = Walker.order(rating: :desc)
    walkers = walkers.in_city(params[:city]) if params[:city].present?

    render json: { walkers: walkers.map { |walker| walker_payload(walker) } }
  end

  def show
    walker = Walker.find(params[:id])

    render json: { walker: walker_payload(walker) }
  end

  private

  def walker_payload(walker)
    {
      id: walker.id,
      name: walker.name,
      bio: walker.bio,
      city: walker.city,
      rating: walker.rating,
      price_per_30_min_cents: walker.price_per_30_min_cents,
      price_label: walker.price_label,
      bookings_count: walker.bookings_count
    }
  end
end
