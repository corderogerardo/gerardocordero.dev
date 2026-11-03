//! Paper-trading API. The crate is a library so integration tests can spawn the
//! real router against a disposable database instead of mocking the stack.

pub mod api;
pub mod auth;
pub mod config;
pub mod domain;
pub mod error;
pub mod hashing;
pub mod market;
pub mod rate_limit;
pub mod state;
pub mod store;
pub mod telemetry;
pub mod trading;
