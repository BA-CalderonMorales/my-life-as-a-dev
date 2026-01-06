//! Deploy Command - Deploy all versions to GitHub Pages
//!
//! This command runs the deploy_all_versions binary to deploy documentation
//! to GitHub Pages.

use std::env;
use std::fs;
use std::io;
use std::path::PathBuf;
use std::process::{Command as ProcessCommand, Stdio};

use super::{Command, CommandContext};

/// Command to deploy all versions
pub struct DeployCommand {
    project_root: PathBuf,
    script_path: PathBuf,
    args: Vec<String>,
}

impl DeployCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
            script_path: ctx.script_path,
            args: ctx.args,
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

impl Command for DeployCommand {
    fn name(&self) -> &'static str {
        "deploy"
    }

    fn description(&self) -> &'static str {
        "Deploy all versions to GitHub Pages"
    }

    fn aliases(&self) -> Vec<&'static str> {
        vec!["deploy-all-versions", "deploy_all_versions"]
    }

    fn execute(&self) -> io::Result<()> {
        println!("\n Running deploy-all-versions script...\n");

        let binary_name = "deploy_all_versions";
        let binary_path = self.script_path.join("target/release").join(binary_name);

        self.build_binary(binary_name)?;

        env::set_current_dir(&self.project_root)?;

        let mut cmd = ProcessCommand::new(&binary_path);

        if !self.args.is_empty() {
            cmd.args(&self.args);
        }

        cmd.stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit());

        let status = cmd.status()?;

        if !status.success() {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Deploy script failed with exit code: {}", status),
            ));
        }

        Ok(())
    }
}
