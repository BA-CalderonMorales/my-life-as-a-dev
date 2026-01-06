//! Configuration management module.
//!
//! # Structure
//!
//! - `merge.rs` - Config file merging utilities
//! - `validate.rs` - Config validation utilities

mod merge;
mod validate;

use std::io;
use std::path::PathBuf;

pub use merge::Merger;
pub use validate::Validator;

/// Manages Zensical configuration files.
///
/// Provides a unified interface for config operations.
pub struct ConfigManager {
    merger: Merger,
    validator: Validator,
}

impl ConfigManager {
    /// Create a new ConfigManager.
    pub fn new(project_root: PathBuf) -> Self {
        Self {
            merger: Merger::new(project_root.clone()),
            validator: Validator::new(project_root),
        }
    }

    /// Check if config files need to be merged.
    pub fn needs_merge(&self) -> bool {
        self.merger.needs_merge()
    }

    /// Run the merge script to regenerate zensical.toml.
    pub fn merge(&self) -> io::Result<()> {
        self.merger.merge()
    }

    /// Ensure config is up-to-date before running zensical commands.
    pub fn ensure_merged(&self) -> io::Result<()> {
        self.merger.ensure_merged()
    }

    /// Validate site configuration.
    pub fn validate(&self) -> io::Result<()> {
        self.validator.validate()
    }
}
