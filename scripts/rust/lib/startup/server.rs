//! Documentation server management.

use std::env;
use std::io;
use std::path::{Path, PathBuf};
use std::process::{Command, ExitStatus, Stdio};

use super::environment::Environment;

/// Manages the documentation server (Zensical).
pub struct Server {
    project_root: PathBuf,
}

impl Server {
    pub fn new(project_root: PathBuf) -> Self {
        Self { project_root }
    }

    /// Start the Zensical development server.
    pub fn start(&self) -> io::Result<ExitStatus> {
        println!("\nStarting Zensical development server...");

        env::set_current_dir(&self.project_root)?;

        if !Path::new("zensical.toml").exists() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("zensical.toml not found in {}", self.project_root.display()),
            ));
        }

        let zensical_cmd = self.get_zensical_path();
        let dev_addr = env::var("ZENSICAL_DEV_ADDR").unwrap_or_else(|_| "0.0.0.0:8001".to_string());

        println!("\nZensical server starting at http://{}/", dev_addr);
        println!("Press Ctrl+C to stop the server\n");

        let status = Command::new(&zensical_cmd)
            .args(&["serve", "-a", &dev_addr])
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status();

        match status {
            Ok(s) if s.success() => Ok(s),
            Ok(s) => Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Zensical failed with exit code: {}", s),
            )),
            Err(_) => self.start_with_uv(),
        }
    }

    fn get_zensical_path(&self) -> String {
        let venv_zensical = if cfg!(windows) {
            self.project_root.join(".venv").join("Scripts").join("zensical.exe")
        } else {
            self.project_root.join(".venv").join("bin").join("zensical")
        };

        if venv_zensical.exists() {
            venv_zensical.to_string_lossy().to_string()
        } else if Environment::command_exists("zensical") {
            "zensical".to_string()
        } else {
            "uv".to_string() // Will use uv run fallback
        }
    }

    fn start_with_uv(&self) -> io::Result<ExitStatus> {
        let dev_addr = env::var("ZENSICAL_DEV_ADDR").unwrap_or_else(|_| "0.0.0.0:8001".to_string());

        println!("\nStarting via uv at http://{}/", dev_addr);

        Command::new("uv")
            .args(&["run", "zensical", "serve", "-a", &dev_addr])
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()
    }
}
