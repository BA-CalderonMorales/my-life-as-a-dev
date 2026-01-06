//! CLI Application Module
//!
//! This module contains the main CLI application logic, keeping the entry point
//! (`doc-cli.rs`) minimal.
//!
//! # Structure
//!
//! - `app.rs` - Core `App` struct and execution logic
//! - `menu.rs` - Interactive menu display and input handling
//! - `paths.rs` - Project/script path detection

mod app;
mod menu;
mod paths;

// Re-export App as the public interface
pub use app::App;

