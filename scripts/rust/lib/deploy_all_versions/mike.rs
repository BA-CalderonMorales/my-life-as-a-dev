//! Mike (MkDocs version manager) operations.

use std::process::Command;

use super::colors::*;

/// Mike command wrapper for MkDocs versioned deployments.
pub struct Mike;

impl Mike {
    /// Check if mike is installed.
    pub fn is_installed() -> bool {
        Command::new("python")
            .args(["-c", "from mike import driver; print('ok')"])
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }

    /// Install mike using pip.
    pub fn install() -> bool {
        println!("{}Installing mike using pip...{}", BLUE, NC);

        Command::new("python")
            .args(["-m", "pip", "install", "--upgrade", "mike"])
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
    }

    /// Ensure mike is installed.
    pub fn ensure_installed() {
        if !Self::is_installed() {
            println!("{}mike not found. Attempting to install...{}", YELLOW, NC);
            if !Self::install() || !Self::is_installed() {
                eprintln!("\n{}Error: Failed to install mike. Install manually:{}", RED, NC);
                eprintln!("{}  pip install mike{}", BLUE, NC);
                std::process::exit(1);
            }
            println!("{}mike installed successfully!{}", GREEN, NC);
        }
    }

    /// Deploy a version.
    pub fn deploy(tag: &str) -> bool {
        println!("{}Running mike deploy for version {}{}", BLUE, tag, NC);

        let output = Command::new("python")
            .args(["-m", "mike.driver", "deploy", tag, "--branch", "gh-pages"])
            .output();

        match output {
            Ok(o) if o.status.success() => {
                println!("{}Successfully deployed version {}{}", GREEN, tag, NC);
                true
            }
            Ok(o) => {
                eprintln!("\n{}mike deploy failed:{}", RED, NC);
                eprintln!("{}", String::from_utf8_lossy(&o.stderr));
                false
            }
            Err(e) => {
                eprintln!("\n{}Failed to execute mike: {}{}", RED, e, NC);
                false
            }
        }
    }

    /// Set the latest alias.
    pub fn set_latest(tag: &str) {
        println!("\n{}Setting 'latest' alias to: {}{}", BLUE, tag, NC);

        let _ = Command::new("python")
            .args(["-m", "mike.driver", "set-default", tag, "--branch", "gh-pages"])
            .output();

        let _ = Command::new("python")
            .args(["-m", "mike.driver", "set-default", "latest", "--branch", "gh-pages"])
            .output();
    }

    /// Push changes to gh-pages.
    pub fn push() {
        println!("\n{}Pushing changes to gh-pages branch...{}", BLUE, NC);

        let _ = Command::new("python")
            .args(["-m", "mike.driver", "set-default", "--push", "--branch", "gh-pages"])
            .output();
    }
}
