//! Main library crate for doc-tools
//!
//! This library provides a modular command-pattern architecture for the doc-cli tool.

// ============================================================================
// Command Pattern (interface + implementations)
// ============================================================================
pub mod commands;

// ============================================================================
// Domain Services (shared business logic)
// ============================================================================
pub mod config;
pub mod project_info;
pub mod zensical;

// ============================================================================
// Utility Modules
// ============================================================================
pub mod logger;

// ============================================================================
// Legacy Binaries (standalone executables)
// ============================================================================
pub mod bump_version;
pub mod deploy_all_versions;
pub mod startup;
