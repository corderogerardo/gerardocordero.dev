class SessionsController < ApplicationController
  skip_before_action :authenticate_request

  def create
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = JsonWebToken.encode({ user_id: user.id })
      render json: { user: user_payload(user), token: }, status: :ok
    else
      render json: { error: "invalid email or password" }, status: :unauthorized
    end
  end
end
