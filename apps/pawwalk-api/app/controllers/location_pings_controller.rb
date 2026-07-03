class LocationPingsController < ApplicationController
  def index
    booking = current_user.bookings.find(params[:booking_id])
    walk_session = booking.walk_session

    render json: { location_pings: walk_session.location_pings.order(:recorded_at).map { |ping| ping_payload(ping) } }
  end

  def create
    booking = current_user.bookings.find(params[:booking_id])
    walk_session = booking.walk_session

    unless walk_session && walk_session.started_at.present? && walk_session.ended_at.nil?
      render json: { error: "walk session is not active" }, status: :unprocessable_content
      return
    end

    ping = walk_session.location_pings.create!(ping_params.merge(recorded_at: Time.current))

    # Fan-out moment: every client subscribed to this walk session's WalkChannel stream gets this.
    WalkChannel.broadcast_to(walk_session, ping_payload(ping))

    render json: { location_ping: ping_payload(ping) }, status: :created
  end

  private

  def ping_params
    params.permit(:lat, :lng)
  end

  def ping_payload(ping)
    { lat: ping.lat, lng: ping.lng, recorded_at: ping.recorded_at }
  end
end
