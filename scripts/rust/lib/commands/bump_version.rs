//! BumpVersion Command - Bump the documentation version
//!
//! This command runs the bump_version binary to increment the documentation
//! version number.

use std::env;
use std::fs;
use std::io;
use std::path::PathBuf;
use std::process::{Command as ProcessCommand, Stdio};

use super::{Command, CommandContext};

/// Command to bump documentation version
pub struct BumpVersionCommand {
    project_root: PathBuf,
    script_path: PathBuf,
}

impl BumpVersionCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
            script_path: ctx.script_path,
        }
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

impl Command for BumpVersionCommand {
    fn name(&self) -> &'static str {
        "bump-version"
    }

    fn description(&self) -> &'static str {
        "Bump the documentation version"
    }

    fn aliases(&self) -> Vec<&'static str> {
        vec!["bump_version"]
    }

    fn execute(&self) -> io::Result<()> {
        println!("\n Running version bump script...\n");

        let binary_name = "bump_version";
        let binary_path = self.script_path.join("target/release").join(binary_name);

        self.build_binary(binary_name)?;

        env::set_current_dir(&self.project_root)?;

        io::Write::flush(&mut io::stdout())?;

        let status = ProcessCommand::new(&binary_path)
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()?;

        if !status.success() {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Bump version script failed with exit code: {}", status),
            ));
        }

        Ok(())
    }
}
