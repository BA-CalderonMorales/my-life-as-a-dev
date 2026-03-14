//! Zensical server operations.

use std::env;
use std::io;
use std::path::PathBuf;
use std::process::{Command, ExitStatus, Stdio};

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

    fn dev_addr(&self) -> String {
        env::var("DEV_ADDR")
            .or_else(|_| env::var("ZENSICAL_DEV_ADDR"))
            .unwrap_or_else(|_| "0.0.0.0:8001".to_string())
    }

    fn run_zensical(&self, args: &[&str]) -> io::Result<ExitStatus> {
        let zensical_cmd = self.get_zensical_path();

        match Command::new(&zensical_cmd)
            .args(args)
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()
        {
            Ok(status) => Ok(status),
            Err(err) if err.kind() == io::ErrorKind::NotFound => self.run_with_uv(args),
            Err(err) => Err(err),
        }
    }

    fn run_with_uv(&self, args: &[&str]) -> io::Result<ExitStatus> {
        let mut uv_args = vec!["run", "zensical"];
        uv_args.extend_from_slice(args);

        Command::new("uv")
            .args(&uv_args)
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()
    }

    /// Start the Zensical development server.
    pub fn serve(&self) -> io::Result<()> {
        println!("\nStarting Zensical development server...\n");

        env::set_current_dir(&self.project_root)?;

        let dev_addr = self.dev_addr();
        let status = self.run_zensical(&["serve", "-a", &dev_addr])?;

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

        let status = self.run_zensical(&["build"])?;

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
