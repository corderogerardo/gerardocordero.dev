# Rack::Attack sits in front of the whole app as middleware — a throttled request never
# reaches a controller, so rejecting abuse costs nothing beyond this check.
# See apps/learn/lessons-ruby/20-api-hardening.js for the lesson this mirrors.
class Rack::Attack
  throttle("api/ip", limit: 300, period: 5.minutes) do |req|
    req.ip
  end
end

# Disabled in test: the suite fires hundreds of requests across parallel workers, and this
# throttle would otherwise trip on the test run itself, failing tests for a reason that has
# nothing to do with the code under test.
Rack::Attack.enabled = false if Rails.env.test?
