//! NavCheck Command - Check for pages not in navigation
//!
//! This command scans the docs/ directory for markdown files and compares
//! them against the navigation structure in zensical.toml to find orphaned pages.

use std::io;
use std::path::PathBuf;

use super::{Command, CommandContext};
use crate::project_info::ProjectInfo;

/// Command to check for pages not in navigation
pub struct NavCheckCommand {
    project_root: PathBuf,
}

impl NavCheckCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
        }
    }
}

impl Command for NavCheckCommand {
    fn name(&self) -> &'static str {
        "nav-check"
    }

    fn description(&self) -> &'static str {
        "Check for pages not in navigation"
    }

    fn aliases(&self) -> Vec<&'static str> {
        vec!["nav_check"]
    }

    fn execute(&self) -> io::Result<()> {
        ProjectInfo::new(self.project_root.clone()).nav_check()
    }
}
