class WalkChannel < ApplicationCable::Channel
  def subscribed
    # Scoped through current_user.bookings, same as the REST layer — only the booking's
    # owner may listen in on their walk.
    walk_session = WalkSession.joins(:booking).merge(current_user.bookings).find_by(id: params[:id])

    if walk_session
      stream_for walk_session
    else
      reject
    end
  end
end
