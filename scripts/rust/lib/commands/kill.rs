//! Kill Command - Stop running Zensical/MkDocs processes
//!
//! This command stops any running documentation server processes
//! by name (zensical, mkdocs) and by port (8000, 8001).

use std::io;
use std::path::PathBuf;

use super::{Command, CommandContext};
use crate::zensical::ZensicalManager;

/// Command to kill running Zensical/MkDocs processes
pub struct KillCommand {
    #[allow(dead_code)]
    project_root: PathBuf,
}

impl KillCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
        }
    }
}

impl Command for KillCommand {
    fn name(&self) -> &'static str {
        "kill"
    }

    fn description(&self) -> &'static str {
        "Stop running Zensical/MkDocs processes"
    }

    fn aliases(&self) -> Vec<&'static str> {
        vec!["stop"]
    }

    fn execute(&self) -> io::Result<()> {
        ZensicalManager::new(self.project_root.clone()).kill()
    }
}
