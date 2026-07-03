ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "ostruct"      # stdlib OpenStruct, used to stub Stripe's response objects in tests
require "minitest/mock" # Object#stub, used to stub Stripe's class methods in tests

module ActiveSupport
  class TestCase
    include ActionMailer::TestHelper

    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...

    def auth_headers(user)
      { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
    end
  end
end
