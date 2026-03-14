//! Validate Command - Validate site configuration
//!
//! This command validates the Zensical configuration file (zensical.toml)
//! and checks for common issues like missing sections or files.

use std::io;
use std::path::PathBuf;

use super::{Command, CommandContext};
use crate::config::ConfigManager;

/// Command to validate site configuration
pub struct ValidateCommand {
    project_root: PathBuf,
}

impl ValidateCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
        }
    }
}

impl Command for ValidateCommand {
    fn name(&self) -> &'static str {
        "validate"
    }

    fn description(&self) -> &'static str {
        "Validate site configuration"
    }

    fn execute(&self) -> io::Result<()> {
        ConfigManager::new(self.project_root.clone()).validate()
    }
}
