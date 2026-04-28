//! Environment detection utilities.

use std::env;

/// Checks environment context (Codespaces, local, etc.)
pub struct Environment;

impl Environment {
    /// Check if we're in GitHub Codespaces
    pub fn is_codespaces() -> bool {
        env::var("CODESPACES").is_ok() || env::var("GITHUB_CODESPACE_TOKEN").is_ok()
    }

    /// Check if a command exists in PATH
    pub fn command_exists(cmd: &str) -> bool {
        std::process::Command::new("sh")
            .arg("-lc")
            .arg(format!("command -v {} >/dev/null 2>&1", cmd))
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
    }

    /// Show instructions for local development
    pub fn show_local_dev_instructions() {
        println!("\n=== Local Development Setup ===");
        println!("To set up the development environment locally, please ensure you have:");
        println!("1. Python 3.8+ installed");
        println!("2. uv (recommended) or pip (Python package manager)");
        println!("\nInstall dependencies manually with:");
        println!("  uv pip install -r requirements.txt");
        println!("\nStart the development server with:");
        println!("  mkdocs serve");
        println!("\n Are you trying to run this locally? Remember to use:");
        println!("  ./doc-cli setup --local");
        println!("\nOptions:");
        println!("  --clean    Use full rebuilds (slower but reliable when hot reload misbehaves)");
        println!();
    }
}
