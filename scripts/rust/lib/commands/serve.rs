//! Serve Command - Start Zensical development server
//!
//! This command starts the Zensical development server on port 8001.
//! It automatically merges config files before starting.

use std::env;
use std::io;
use std::path::PathBuf;
use std::process::{Command as ProcessCommand, Stdio};

use super::{Command, CommandContext};

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

    /// Ensure config files are merged before serving
    fn ensure_config_merged(&self) -> io::Result<()> {
        use crate::config::ConfigManager;
        let config = ConfigManager::new(self.project_root.clone());
        config.ensure_merged()
    }

    /// Get the path to zensical binary (checks venv first, then system PATH)
    fn get_zensical_path(&self) -> String {
        let venv_zensical = self.project_root.join(".venv").join("bin").join("zensical");
        if venv_zensical.exists() {
            return venv_zensical.to_string_lossy().to_string();
        }
        "zensical".to_string()
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
        // Ensure config is up-to-date before serving
        self.ensure_config_merged()?;

        println!("\nStarting Zensical development server...\n");

        env::set_current_dir(&self.project_root)?;

        let zensical_cmd = self.get_zensical_path();

        let status = ProcessCommand::new(&zensical_cmd)
            .args(&["serve", "-a", "0.0.0.0:8001"])
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()?;

        if !status.success() {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Zensical serve failed with exit code: {}", status),
            ));
        }

        Ok(())
    }
}
