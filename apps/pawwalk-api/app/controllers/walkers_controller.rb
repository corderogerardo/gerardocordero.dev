class WalkersController < ApplicationController
  skip_before_action :authenticate_request

  def index
    walkers = Walker.order(rating: :desc)
    walkers = walkers.in_city(params[:city]) if params[:city].present?

    fresh_when(etag: walkers, last_modified: walkers.maximum(:updated_at))
    render json: { walkers: walkers.map { |walker| walker_payload(walker) } } unless performed?
  end

  def show
    walker = Walker.find(params[:id])

    fresh_when(walker)
    render json: { walker: walker_payload(walker) } unless performed?
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
