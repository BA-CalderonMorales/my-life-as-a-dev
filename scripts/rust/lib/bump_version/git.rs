//! Git operations for version management.

use std::process::Command;

use super::colors::*;

/// Git tag operations.
pub struct Git;

impl Git {
    /// Get the latest tag from git.
    pub fn get_latest_tag() -> String {
        let output = Command::new("git")
            .args(&["describe", "--tags", "--abbrev=0"])
            .output();

        match output {
            Ok(output) if output.status.success() => {
                let tag = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if tag.starts_with('v') {
                    tag[1..].to_string()
                } else {
                    tag
                }
            }
            _ => "0.0.0".to_string(),
        }
    }

    /// Create and push a git tag.
    pub fn create_tag(version: &str) {
        let tag_name = format!("v{}", version);
        let tag_message = format!("Version {}", version);

        println!("Creating new Git tag {}...", tag_name);

        let status = Command::new("git")
            .args(&["tag", "-a", &tag_name, "-m", &tag_message])
            .status()
            .expect("Failed to create git tag");

        if !status.success() {
            eprintln!("{}Error: Failed to create git tag.{}", RED, NC);
            std::process::exit(1);
        }

        println!("Pushing tag to remote...");

        let status = Command::new("git")
            .args(&["push", "origin", &tag_name])
            .status()
            .expect("Failed to push git tag");

        if !status.success() {
            eprintln!("{}Error: Failed to push git tag to remote.{}", RED, NC);
            std::process::exit(1);
        }
    }
}
