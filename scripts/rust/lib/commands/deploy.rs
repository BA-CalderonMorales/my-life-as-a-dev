//! Deploy Command - Deploy versioned documentation to GitHub Pages
//!
//! This command runs versioned_deploy.py to deploy documentation
//! to GitHub Pages with version support.

use std::env;
use std::io::{self, Write};
use std::path::PathBuf;
use std::process::{Command as ProcessCommand, Stdio};

use super::{Command, CommandContext};

/// Command to deploy a versioned release
pub struct DeployCommand {
    project_root: PathBuf,
    args: Vec<String>,
}

impl DeployCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
            args: ctx.args,
        }
    }

    /// Read the current version from versions.json
    fn get_current_version(&self) -> Option<String> {
        let versions_file = self.project_root.join("versions.json");
        if let Ok(content) = std::fs::read_to_string(&versions_file) {
            // Try to parse and extract version
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                // Handle array format (gh-pages style)
                if let Some(arr) = json.as_array() {
                    if let Some(first) = arr.first() {
                        return first.get("version").and_then(|v| v.as_str()).map(String::from);
                    }
                }
                // Handle object format with versions array
                if let Some(versions) = json.get("versions").and_then(|v| v.as_array()) {
                    if let Some(first) = versions.first() {
                        return first.get("version").and_then(|v| v.as_str()).map(String::from);
                    }
                }
            }
        }
        None
    }

    /// Suggest the next patch version
    fn suggest_next_version(&self, current: &str) -> String {
        let parts: Vec<&str> = current.split('.').collect();
        if parts.len() == 3 {
            if let Ok(patch) = parts[2].parse::<u32>() {
                return format!("{}.{}.{}", parts[0], parts[1], patch + 1);
            }
        }
        current.to_string()
    }

    /// Prompt user for version interactively
    fn prompt_version(&self) -> io::Result<String> {
        let current = self.get_current_version().unwrap_or_else(|| "0.1.0".to_string());
        let suggested = self.suggest_next_version(&current);

        println!("\n  Current version: {}", current);
        print!("  Enter version to deploy [{}]: ", suggested);
        io::stdout().flush()?;

        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        let input = input.trim();

        if input.is_empty() {
            Ok(suggested)
        } else {
            Ok(input.to_string())
        }
    }

    /// Prompt user for push confirmation
    fn prompt_push(&self) -> io::Result<bool> {
        print!("  Push to remote after deploy? [Y/n]: ");
        io::stdout().flush()?;

        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        let input = input.trim().to_lowercase();

        Ok(input.is_empty() || input == "y" || input == "yes")
    }
}

impl Command for DeployCommand {
    fn name(&self) -> &'static str {
        "deploy"
    }

    fn description(&self) -> &'static str {
        "Deploy a versioned release to GitHub Pages"
    }

    fn aliases(&self) -> Vec<&'static str> {
        vec!["publish", "release"]
    }

    fn execute(&self) -> io::Result<()> {
        println!("\n============================================================");
        println!("Versioned Deployment");
        println!("============================================================\n");

        env::set_current_dir(&self.project_root)?;

        // Check if version was passed as argument
        let version = if !self.args.is_empty() {
            self.args[0].clone()
        } else {
            self.prompt_version()?
        };

        // Check for --push flag or prompt
        let push = if self.args.iter().any(|a| a == "--push" || a == "-p") {
            true
        } else if self.args.iter().any(|a| a == "--no-push") {
            false
        } else {
            self.prompt_push()?
        };

        println!("\n  Deploying version {} with alias 'latest'...\n", version);

        // Build the command
        let script_path = self.project_root.join("scripts/python/versioned_deploy.py");

        let mut cmd = ProcessCommand::new("uv");
        cmd.arg("run")
            .arg("python")
            .arg(&script_path)
            .arg("deploy")
            .arg(&version)
            .arg("--alias")
            .arg("latest");

        if push {
            cmd.arg("--push");
        }

        cmd.stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit());

        let status = cmd.status()?;

        if !status.success() {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Deploy failed with exit code: {}", status),
            ));
        }

        println!("\n  Deployment complete!");
        if !push {
            println!("  Run with --push to push to remote, or push manually:");
            println!("    cd /tmp/gh-pages-* && git push origin gh-pages");
        }

        Ok(())
    }
}
