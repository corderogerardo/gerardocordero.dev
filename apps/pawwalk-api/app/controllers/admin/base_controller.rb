# Internal ops dashboard, rendered as real HTML — lives alongside the JSON API
# (ApplicationController < ActionController::API) without touching it. Every
# existing api-facing route keeps its JSON behavior; config.api_only stays true
# at the application level.
#
# ponytail: no admin auth yet (internal/staff-only tool, not customer-facing) —
# add Authentication (or Basic Auth) before this ever leaves localhost/staging.
module Admin
  class BaseController < ActionController::Base
    layout "admin"

    protect_from_forgery with: :exception
  end
end
