//! Info Command - Show project structure and configuration info
//!
//! This command displays useful information about the project structure,
//! configuration files, and directory layout for understanding the project.

use std::io;
use std::path::PathBuf;

use super::{Command, CommandContext};
use crate::project_info::ProjectInfo;

/// Command to show project information
pub struct InfoCommand {
    project_root: PathBuf,
}

impl InfoCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
        }
    }
}

impl Command for InfoCommand {
    fn name(&self) -> &'static str {
        "info"
    }

    fn description(&self) -> &'static str {
        "Show project structure and config info"
    }

    fn execute(&self) -> io::Result<()> {
        ProjectInfo::new(self.project_root.clone()).show()
    }
}
