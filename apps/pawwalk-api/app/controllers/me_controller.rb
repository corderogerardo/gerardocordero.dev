class MeController < ApplicationController
  def show
    render json: { user: user_payload(current_user) }, status: :ok
  end
end
