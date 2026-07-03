class UsersController < ApplicationController
  skip_before_action :authenticate_request

  def create
    user = User.create!(user_params)
    token = JsonWebToken.encode({ user_id: user.id })

    render json: { user: user_payload(user), token: }, status: :created
  end

  private

  def user_params
    params.permit(:name, :email, :password)
  end
end
