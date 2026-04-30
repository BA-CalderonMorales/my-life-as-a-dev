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

        let dev_addr = env::var("ZENSICAL_DEV_ADDR").unwrap_or_else(|_| "0.0.0.0:8001".to_string());

        println!("\nZensical server starting at http://{}/", dev_addr);
        println!("Press Ctrl+C to stop the server\n");

        let status = if let Some(native_python) = self.native_venv_binary("python") {
            Command::new(native_python)
                .args(&["-m", "zensical", "serve", "-a", &dev_addr])
                .stdin(Stdio::inherit())
                .stdout(Stdio::inherit())
                .stderr(Stdio::inherit())
                .status()
        } else {
            let zensical_cmd = self.get_zensical_path();
            Command::new(&zensical_cmd)
                .args(&["serve", "-a", &dev_addr])
                .stdin(Stdio::inherit())
                .stdout(Stdio::inherit())
                .stderr(Stdio::inherit())
                .status()
        };

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
            self.project_root
                .join(".venv")
                .join("Scripts")
                .join("zensical.exe")
        } else {
            self.project_root.join(".venv").join("bin").join("zensical")
        };

        if venv_zensical.exists() {
            venv_zensical.to_string_lossy().to_string()
        } else if let Some(native_zensical) = self.native_venv_binary("zensical") {
            native_zensical
        } else if Environment::command_exists("zensical") {
            "zensical".to_string()
        } else {
            "uv".to_string() // Will use uv run fallback
        }
    }

    fn start_with_uv(&self) -> io::Result<ExitStatus> {
        let dev_addr = env::var("ZENSICAL_DEV_ADDR").unwrap_or_else(|_| "0.0.0.0:8001".to_string());

        println!("\nStarting via uv at http://{}/", dev_addr);

        let mut cmd = Command::new("uv");
        cmd.args(&["run", "zensical", "serve", "-a", &dev_addr])
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit());

        if self.project_root.to_string_lossy().starts_with("/mnt/") {
            cmd.env(
                "UV_CACHE_DIR",
                env::var("UV_CACHE_DIR").unwrap_or_else(|_| "/tmp/uv-cache".to_string()),
            );
            cmd.env(
                "UV_LINK_MODE",
                env::var("UV_LINK_MODE").unwrap_or_else(|_| "copy".to_string()),
            );
        }

        cmd.status()
    }

    fn native_venv_binary(&self, name: &str) -> Option<String> {
        if !self.project_root.to_string_lossy().starts_with("/mnt/") {
            return None;
        }

        let project_name = self.project_root.file_name().and_then(|n| n.to_str())?;
        let home = env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
        let binary = PathBuf::from(home)
            .join(".venvs")
            .join(project_name)
            .join("bin")
            .join(name);

        binary
            .exists()
            .then(|| binary.to_string_lossy().to_string())
    }
}
