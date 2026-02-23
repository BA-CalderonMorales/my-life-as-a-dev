//! Update Command - One-shot version bump deploy helper
//!
//! Provides an easier deploy interface:
//! `./doc-cli update [VERSION] --alias latest --push`

use std::env;
use std::io::{self, Write};
use std::path::PathBuf;
use std::process::{Command as ProcessCommand, Stdio};

use super::{Command, CommandContext};

/// Command to deploy/update a docs version with optional alias + push
pub struct UpdateCommand {
    project_root: PathBuf,
    args: Vec<String>,
}

impl UpdateCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
            args: ctx.args,
        }
    }

    fn get_current_version(&self) -> Option<String> {
        let versions_file = self.project_root.join("versions.json");
        if let Ok(content) = std::fs::read_to_string(&versions_file) {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(arr) = json.as_array() {
                    if let Some(first) = arr.first() {
                        return first.get("version").and_then(|v| v.as_str()).map(String::from);
                    }
                }
                if let Some(versions) = json.get("versions").and_then(|v| v.as_array()) {
                    if let Some(first) = versions.first() {
                        return first.get("version").and_then(|v| v.as_str()).map(String::from);
                    }
                }
            }
        }
        None
    }

    fn suggest_next_patch(&self, current: &str) -> String {
        let parts: Vec<&str> = current.split('.').collect();
        if parts.len() == 3 {
            if let Ok(patch) = parts[2].parse::<u32>() {
                return format!("{}.{}.{}", parts[0], parts[1], patch + 1);
            }
        }
        current.to_string()
    }

    fn prompt_version(&self) -> io::Result<String> {
        let current = self
            .get_current_version()
            .unwrap_or_else(|| "0.1.0".to_string());
        let suggested = self.suggest_next_patch(&current);

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

    fn parse_args(&self) -> io::Result<(Option<String>, String, Option<bool>)> {
        let mut version: Option<String> = None;
        let mut alias = "latest".to_string();
        let mut push: Option<bool> = None;

        let mut i = 0;
        while i < self.args.len() {
            let arg = &self.args[i];

            match arg.as_str() {
                "--alias" => {
                    if i + 1 >= self.args.len() {
                        return Err(io::Error::new(
                            io::ErrorKind::InvalidInput,
                            "Missing value for --alias",
                        ));
                    }
                    alias = self.args[i + 1].clone();
                    i += 2;
                }
                "--push" | "-p" => {
                    push = Some(true);
                    i += 1;
                }
                "--no-push" => {
                    push = Some(false);
                    i += 1;
                }
                _ if arg.starts_with('-') => {
                    return Err(io::Error::new(
                        io::ErrorKind::InvalidInput,
                        format!("Unknown option: {}", arg),
                    ));
                }
                _ => {
                    if version.is_none() {
                        version = Some(arg.clone());
                    } else {
                        return Err(io::Error::new(
                            io::ErrorKind::InvalidInput,
                            format!("Unexpected argument: {}", arg),
                        ));
                    }
                    i += 1;
                }
            }
        }

        Ok((version, alias, push))
    }
}

impl Command for UpdateCommand {
    fn name(&self) -> &'static str {
        "update"
    }

    fn description(&self) -> &'static str {
        "Deploy/update a docs version with alias and push options"
    }

    fn aliases(&self) -> Vec<&'static str> {
        vec!["up"]
    }

    fn execute(&self) -> io::Result<()> {
        println!("\n============================================================");
        println!("Documentation Update");
        println!("============================================================\n");

        env::set_current_dir(&self.project_root)?;

        let (version_arg, alias, push_arg) = self.parse_args()?;
        let version = match version_arg {
            Some(v) => v,
            None => self.prompt_version()?,
        };

        let push = push_arg.unwrap_or(true);

        println!(
            "\n  Updating docs to version {} with alias '{}'...\n",
            version, alias
        );

        let script_path = self.project_root.join("scripts/python/versioned_deploy.py");

        let mut cmd = ProcessCommand::new("uv");
        cmd.arg("run")
            .arg("python")
            .arg(&script_path)
            .arg("deploy")
            .arg(&version)
            .arg("--alias")
            .arg(&alias);

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
                format!("Update failed with exit code: {}", status),
            ));
        }

        println!("\n  Update complete!");

        Ok(())
    }
}
