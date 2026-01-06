//! Build Command - Build site with Zensical
//!
//! This command builds the documentation site using Zensical.
//! It automatically merges config files before building.

use std::env;
use std::io;
use std::path::PathBuf;
use std::process::{Command as ProcessCommand, Stdio};

use super::{Command, CommandContext};

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

    /// Ensure config files are merged before building
    fn ensure_config_merged(&self) -> io::Result<()> {
        use crate::config::ConfigManager;
        let config = ConfigManager::new(self.project_root.clone());
        config.ensure_merged()
    }

    /// Get the path to zensical binary
    fn get_zensical_path(&self) -> String {
        let venv_zensical = self.project_root.join(".venv").join("bin").join("zensical");
        if venv_zensical.exists() {
            return venv_zensical.to_string_lossy().to_string();
        }
        "zensical".to_string()
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
        // Ensure config is up-to-date before building
        self.ensure_config_merged()?;

        println!("\nBuilding site with Zensical...\n");

        env::set_current_dir(&self.project_root)?;

        let zensical_cmd = self.get_zensical_path();

        let status = ProcessCommand::new(&zensical_cmd)
            .arg("build")
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()?;

        if !status.success() {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Zensical build failed with exit code: {}", status),
            ));
        }

        println!("\nZensical build complete!");
        Ok(())
    }
}
