class BookingsController < ApplicationController
  DEFAULT_PAGE_SIZE = 20
  MAX_PAGE_SIZE = 100

  # Owner routes are for owner-role accounts only (aligned with FastAPI's require_owner, 403).
  # Walker routes (assigned, accept, decline, start, complete) are not guarded here: they scope by
  # the linked walker profile instead, so their unlinked/foreign cases stay 404.
  before_action :require_owner_role!, only: %i[index show create cancel]

  def index
    # includes(:dog) avoids an N+1 query when booking_payload reads dog_name for each row.
    bookings = current_user.bookings.includes(:dog).order(starts_at: :asc)
    bookings = bookings.where(status: params[:status]) if params[:status].present?

    render json: paginate(bookings).map { |booking| booking_payload(booking) }
  end

  # Bookings assigned to the signed-in walker's linked profile. Non-walker accounts and walker-role
  # accounts without a linked profile get an empty list rather than someone else's bookings.
  def assigned
    walker = current_user.walker_profile if current_user.walker?
    bookings = walker ? walker.bookings : Booking.none

    render json: paginate(bookings.includes(:dog).order(starts_at: :asc)).map { |booking| booking_payload(booking) }
  end

  def show
    # Scoped through current_user.bookings so a stranger's booking 404s instead of 403 —
    # a 403 would confirm the booking exists, a 404 doesn't leak that.
    booking = current_user.bookings.find(params[:id])

    render json: booking_payload(booking)
  end

  def create
    booking = current_user.bookings.build(booking_params)
    booking.compute_price! # never trust the client with money — price is derived server-side
    booking.save!

    render json: booking_payload(booking), status: :created
  end

  # Owner cancellation. PATCH and POST both route here, so they share one owner-only behavior.
  def cancel
    booking = owned_booking
    booking.cancel_as_owner!

    render json: booking_payload(booking)
  rescue Booking::InvalidTransition => error
    render_transition_conflict(error)
  end

  def accept = transition_as_walker(:accept)
  def decline = transition_as_walker(:decline)
  def start = transition_as_walker(:start)
  def complete = transition_as_walker(:complete)

  private

  def booking_params
    params.permit(:walker_id, :dog_id, :starts_at, :duration_min)
  end

  def require_owner_role!
    return if current_user.owner?

    render json: { error: "This action is for pet owners" }, status: :forbidden
  end

  # Owner-role access is enforced by require_owner_role!; this scope keeps other owners' bookings
  # hidden behind a 404 so foreign bookings are never disclosed.
  def owned_booking
    current_user.bookings.find(params[:id])
  end

  # Only the linked, assigned walker may move a booking; anything else is a 404 for the same reason.
  def assigned_booking
    walker = current_user.walker_profile if current_user.walker?
    raise ActiveRecord::RecordNotFound unless walker

    walker.bookings.find(params[:id])
  end

  def transition_as_walker(action)
    booking = assigned_booking
    booking.transition_as_walker!(action)

    render json: booking_payload(booking)
  rescue Booking::InvalidTransition => error
    render_transition_conflict(error)
  end

  def render_transition_conflict(error)
    render json: { code: "transition_conflict", detail: error.message }, status: :conflict
  end

  def paginate(bookings)
    page = params[:page].to_i.clamp(1, Float::INFINITY).to_i
    per_page = params[:per_page].present? ? [ [ params[:per_page].to_i, 1 ].max, MAX_PAGE_SIZE ].min : DEFAULT_PAGE_SIZE

    bookings.limit(per_page).offset((page - 1) * per_page)
  end

  # Flat native Booking DTO, matching the keys and types the iOS and Android clients decode.
  # Ids are strings on the wire; dog_name is read from the existing dog association (no Dog is created).
  def booking_payload(booking)
    {
      id: booking.id.to_s,
      walker_id: booking.walker_id.to_s,
      dog_name: booking.dog.name,
      start_time: booking.starts_at,
      duration_minutes: booking.duration_min,
      status: booking.status,
      price_cents: booking.price_cents,
      created_at: booking.created_at
    }
  end
end
