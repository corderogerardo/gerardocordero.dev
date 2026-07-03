class WalkSessionsController < ApplicationController
  # In real life the walker's device would drive start/end; this app only authenticates
  # the booking's owner, so the owner drives the walk here.
  def create
    booking = current_user.bookings.find(params[:booking_id])

    unless booking.confirmed? && booking.walk_session.nil?
      render json: { error: "walk can only start on a confirmed booking" }, status: :unprocessable_content
      return
    end

    walk_session = booking.create_walk_session!(started_at: Time.current)
    booking.update!(status: :in_progress)

    render json: { walk_session: walk_session_payload(walk_session) }, status: :created
  end

  def update
    booking = current_user.bookings.find(params[:booking_id])
    walk_session = booking.walk_session

    unless walk_session && walk_session.ended_at.nil?
      render json: { error: "walk session is not active" }, status: :unprocessable_content
      return
    end

    walk_session.update!(ended_at: Time.current)
    booking.update!(status: :completed)

    render json: { walk_session: walk_session_payload(walk_session) }
  end

  private

  def walk_session_payload(walk_session)
    {
      id: walk_session.id,
      booking_id: walk_session.booking_id,
      started_at: walk_session.started_at,
      ended_at: walk_session.ended_at
    }
  end
end
