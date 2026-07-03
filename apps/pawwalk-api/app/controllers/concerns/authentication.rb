module Authentication
  extend ActiveSupport::Concern

  included do
    attr_reader :current_user

    before_action :authenticate_request
  end

  private

  def authenticate_request
    token = request.headers["Authorization"]&.split(" ")&.last
    payload = JsonWebToken.decode(token)
    @current_user = User.find(payload[:user_id])
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound
    render json: { error: "unauthorized" }, status: :unauthorized
  end

  def user_payload(user)
    { id: user.id, name: user.name, email: user.email }
  end
end
