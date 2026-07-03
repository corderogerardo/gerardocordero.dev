module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      # WebSocket clients can't always set custom headers, so the JWT rides in the query string instead.
      payload = JsonWebToken.decode(request.params[:token])
      self.current_user = User.find(payload[:user_id])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      reject_unauthorized_connection
    end
  end
end
