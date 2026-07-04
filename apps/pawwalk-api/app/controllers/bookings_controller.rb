class BookingsController < ApplicationController
  DEFAULT_PAGE_SIZE = 20
  MAX_PAGE_SIZE = 100

  def index
    # includes(:walker, :dog) avoids an N+1 query when rendering booking_payload for each row.
    bookings = current_user.bookings.includes(:walker, :dog).order(starts_at: :asc)
    bookings = bookings.where(status: params[:status]) if params[:status].present?

    page = params[:page].to_i.clamp(1, Float::INFINITY).to_i
    per_page = params[:per_page].present? ? [ [ params[:per_page].to_i, 1 ].max, MAX_PAGE_SIZE ].min : DEFAULT_PAGE_SIZE
    bookings = bookings.limit(per_page).offset((page - 1) * per_page)

    render json: { bookings: bookings.map { |booking| booking_payload(booking) }, page: page, per_page: per_page }
  end

  def show
    # Scoped through current_user.bookings so a stranger's booking 404s instead of 403 —
    # a 403 would confirm the booking exists, a 404 doesn't leak that.
    booking = current_user.bookings.find(params[:id])

    render json: { booking: booking_payload(booking) }
  end

  def create
    booking = current_user.bookings.build(booking_params)
    booking.compute_price! # never trust the client with money — price is derived server-side
    booking.save!

    render json: { booking: booking_payload(booking) }, status: :created
  end

  def cancel
    booking = current_user.bookings.find(params[:id])

    unless booking.pending? || booking.confirmed?
      render json: { error: "cannot cancel a #{booking.status} booking" }, status: :unprocessable_content
      return
    end

    booking.update!(status: :cancelled)
    render json: { booking: booking_payload(booking) }
  end

  private

  def booking_params
    params.permit(:walker_id, :dog_id, :starts_at, :duration_min)
  end

  def booking_payload(booking)
    {
      id: booking.id,
      status: booking.status,
      starts_at: booking.starts_at,
      duration_min: booking.duration_min,
      price_cents: booking.price_cents,
      walker: { id: booking.walker.id, name: booking.walker.name },
      dog: { id: booking.dog.id, name: booking.dog.name }
    }
  end
end
