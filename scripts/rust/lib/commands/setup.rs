//! Setup Command - Setup development environment
//!
//! This command sets up the development environment for the project,
//! including dependency installation, port checking, and server startup.

use std::io;
use std::path::PathBuf;

use super::{Command, CommandContext};
use crate::startup::Startup;

/// Command to setup the development environment
pub struct SetupCommand {
    project_root: PathBuf,
    #[allow(dead_code)]
    args: Vec<String>,
}

impl SetupCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
            args: ctx.args,
        }
    }
}

impl Command for SetupCommand {
    fn name(&self) -> &'static str {
        "setup"
    }

    fn description(&self) -> &'static str {
        "Setup development environment"
    }

    fn execute(&self) -> io::Result<()> {
        std::env::set_current_dir(&self.project_root)?;
        // setup always runs in local mode; --local flag still works via Startup::run()
        Startup::new().run_local()
    }
}
