//! Zensical server operations.

use std::env;
use std::io;
use std::path::PathBuf;
use std::process::{Command, Stdio};

/// Manages Zensical server start/restart.
pub struct Server {
    project_root: PathBuf,
}

impl Server {
    pub fn new(project_root: PathBuf) -> Self {
        Self { project_root }
    }

    /// Get the path to zensical binary.
    pub fn get_zensical_path(&self) -> String {
        let venv_zensical = self.project_root.join(".venv").join("bin").join("zensical");
        if venv_zensical.exists() {
            venv_zensical.to_string_lossy().to_string()
        } else {
            "zensical".to_string()
        }
    }

    /// Start the Zensical development server.
    pub fn serve(&self) -> io::Result<()> {
        println!("\nStarting Zensical development server...\n");

        env::set_current_dir(&self.project_root)?;

        let zensical_cmd = self.get_zensical_path();

        let status = Command::new(&zensical_cmd)
            .args(&["serve", "-a", "0.0.0.0:8001"])
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()?;

        if !status.success() {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Zensical serve failed: {}", status),
            ));
        }

        Ok(())
    }

    /// Build the site with Zensical.
    pub fn build(&self) -> io::Result<()> {
        println!("\nBuilding site with Zensical...\n");

        env::set_current_dir(&self.project_root)?;

        let zensical_cmd = self.get_zensical_path();

        let status = Command::new(&zensical_cmd)
            .arg("build")
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()?;

        if !status.success() {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Zensical build failed: {}", status),
            ));
        }

        println!("\nZensical build complete!");
        Ok(())
    }

    /// Check if Zensical is currently running.
    pub fn is_running(&self) -> bool {
        if let Ok(output) = Command::new("pgrep").arg("-f").arg("zensical").output() {
            if output.status.success() && !output.stdout.is_empty() {
                return true;
            }
        }

        if let Ok(output) = Command::new("lsof").args(&["-i", ":8001"]).output() {
            if output.status.success() && !output.stdout.is_empty() {
                return true;
            }
        }

        false
    }
}
