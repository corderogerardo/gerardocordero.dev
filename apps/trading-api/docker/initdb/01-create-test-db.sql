-- Runs once, on first container start. Test suites use a separate database so a
-- failed run can never corrupt local development data.
CREATE DATABASE trading_test OWNER trading;
