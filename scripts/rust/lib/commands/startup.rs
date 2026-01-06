//! Startup Command - Legacy MkDocs startup
//!
//! This command starts the legacy MkDocs development environment.
//! It's maintained for backwards compatibility.

use std::env;
use std::fs;
use std::io;
use std::path::PathBuf;
use std::process::{Command as ProcessCommand, Stdio};

use super::{Command, CommandContext};

/// Command to run legacy MkDocs startup
pub struct StartupCommand {
    project_root: PathBuf,
    script_path: PathBuf,
    args: Vec<String>,
}

impl StartupCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
            script_path: ctx.script_path,
            args: ctx.args,
        }
    }

    /// Ensure config files are merged before starting
    fn ensure_config_merged(&self) -> io::Result<()> {
        use crate::config::ConfigManager;
        let config = ConfigManager::new(self.project_root.clone());
        config.ensure_merged()
    }

    /// Build a Rust binary if it doesn't exist
    fn build_binary(&self, name: &str) -> io::Result<()> {
        let binary_path = self.script_path.join("target/release").join(name);
        let source_path = self.script_path.join("lib").join(name).join("mod.rs");

        if binary_path.exists() {
            return Ok(());
        }

        if !source_path.exists() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("Source not found: {}", source_path.display()),
            ));
        }

        println!("Building {} binary...", name);

        fs::create_dir_all(self.script_path.join("target/release"))?;

        let status = ProcessCommand::new("rustc")
            .current_dir(&self.script_path)
            .args(&[
                "-o",
                binary_path.to_str().unwrap(),
                source_path.to_str().unwrap(),
            ])
            .status()?;

        if !status.success() {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Failed to build {}", name),
            ));
        }

        Ok(())
    }
}

impl Command for StartupCommand {
    fn name(&self) -> &'static str {
        "startup"
    }

    fn description(&self) -> &'static str {
        "Start MkDocs development environment (legacy)"
    }

    fn aliases(&self) -> Vec<&'static str> {
        vec!["mkdocs-serve", "mkdocs_serve"]
    }

    fn execute(&self) -> io::Result<()> {
        self.ensure_config_merged()?;

        println!("\n Running startup script...\n");

        let binary_name = "startup";
        let binary_path = self.script_path.join("target/release").join(binary_name);

        self.build_binary(binary_name)?;

        // Parse arguments
        let mut draft_version = None;
        let mut local_mode = false;
        let mut codespaces = false;
        let mut extra_args = Vec::new();

        let mut i = 0;
        while i < self.args.len() {
            if self.args[i] == "--draft-version" && i + 1 < self.args.len() {
                draft_version = Some(self.args[i + 1].clone());
                i += 2;
            } else if self.args[i] == "--local" {
                local_mode = true;
                i += 1;
            } else if self.args[i] == "--codespaces" {
                codespaces = true;
                i += 1;
            } else {
                extra_args.push(self.args[i].clone());
                i += 1;
            }
        }

        env::set_current_dir(&self.project_root)?;

        let mut cmd = ProcessCommand::new(&binary_path);

        if let Some(version) = draft_version {
            cmd.args(&["--draft-version", &version]);
            println!("Using draft version: {}", version);
        }

        if local_mode {
            cmd.arg("--local");
        }

        if codespaces {
            cmd.arg("--codespaces");
        }

        if !extra_args.is_empty() {
            cmd.args(&extra_args);
        }

        cmd.stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit());

        let status = cmd.status()?;

        if !status.success() {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Startup script failed with exit code: {}", status),
            ));
        }

        Ok(())
    }
}
