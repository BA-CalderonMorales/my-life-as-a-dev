//! Build Command - Build site with Zensical
//!
//! This command builds the documentation site using Zensical.
//! It automatically merges config files before building.

use std::io;
use std::path::PathBuf;

use super::{Command, CommandContext};
use crate::config::ConfigManager;
use crate::zensical::ZensicalManager;

/// Command to build the site with Zensical
pub struct BuildCommand {
    project_root: PathBuf,
}

impl BuildCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
        }
    }
}

impl Command for BuildCommand {
    fn name(&self) -> &'static str {
        "build"
    }

    fn description(&self) -> &'static str {
        "Build site with Zensical"
    }

    fn execute(&self) -> io::Result<()> {
        ConfigManager::new(self.project_root.clone()).ensure_merged()?;
        ZensicalManager::new(self.project_root.clone()).build()
    }
}
