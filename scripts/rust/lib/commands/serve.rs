//! Serve Command - Start Zensical development server
//!
//! This command starts the Zensical development server on port 8001.
//! It automatically merges config files before starting.

use std::io;
use std::path::PathBuf;

use super::{Command, CommandContext};
use crate::config::ConfigManager;
use crate::zensical::ZensicalManager;

/// Command to start the Zensical development server
pub struct ServeCommand {
    project_root: PathBuf,
}

impl ServeCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
        }
    }
}

impl Command for ServeCommand {
    fn name(&self) -> &'static str {
        "serve"
    }

    fn description(&self) -> &'static str {
        "Start Zensical development server"
    }

    fn execute(&self) -> io::Result<()> {
        ConfigManager::new(self.project_root.clone()).ensure_merged()?;
        ZensicalManager::new(self.project_root.clone()).serve()
    }
}
