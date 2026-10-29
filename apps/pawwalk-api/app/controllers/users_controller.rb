class UsersController < ApplicationController
  skip_before_action :authenticate_request

  def create
    user = User.new(user_params)

    if persist(user)
      token = JsonWebToken.encode({ user_id: user.id })
      render json: { user: user_payload(user), token: }, status: :created
    elsif user.errors.of_kind?(:email, :taken)
      # Duplicate email is a state conflict, not a validation error; the native clients key on the code.
      render json: { code: "email_taken", detail: "Email already registered" }, status: :conflict
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  # The unique index on users.email settles a race between two concurrent signups; the loser is a
  # duplicate, so it gets the same taken-error path as a validation-time duplicate.
  def persist(user)
    user.save
  rescue ActiveRecord::RecordNotUnique
    user.errors.add(:email, :taken)
    false
  end

  def user_params
    params.permit(:name, :email, :password)
  end
end
