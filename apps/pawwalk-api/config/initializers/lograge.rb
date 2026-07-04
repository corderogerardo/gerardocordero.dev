# Collapses Rails' default multi-line-per-request log (Started/Processing/Rendered/Completed)
# into one structured line per request — easy for a log aggregator (or plain grep) to query.
# Only enabled in production: local dev keeps the familiar multi-line log, and the test suite's
# output is unaffected either way. Response bodies are untouched — this only changes what gets
# written to the log.
Rails.application.configure do
  config.lograge.enabled = Rails.env.production?

  # request_id and params are added to the process_action.action_controller payload by
  # ApplicationController#append_info_to_payload — pull them into the single log line so one
  # line has enough to debug a request without cross-referencing others. filtered_parameters
  # (used in append_info_to_payload) already redacts anything filter_parameter_logging.rb marks
  # sensitive, so nothing secret ends up in the log.
  config.lograge.custom_options = lambda do |event|
    { request_id: event.payload[:request_id], params: event.payload[:params] }
  end
end
