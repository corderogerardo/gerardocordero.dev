class ApplicationController < ActionController::API
  include Authentication

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :render_invalid

  private

  # Surfaces the request id on the process_action.action_controller notification payload, so
  # lograge's custom_options (config/initializers/lograge.rb) can fold it into the single-line
  # production log without every controller having to add it by hand.
  def append_info_to_payload(payload)
    super
    payload[:request_id] = request.request_id
    payload[:params] = request.filtered_parameters.except("controller", "action")
  end

  def render_not_found
    render json: { error: "not found" }, status: :not_found
  end

  def render_invalid(exception)
    render json: { errors: exception.record.errors.full_messages }, status: :unprocessable_content
  end
end
