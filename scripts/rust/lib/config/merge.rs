//! Config file merging utilities.

use std::fs;
use std::io;
use std::path::PathBuf;
use std::process::{Command, Stdio};

/// Handles merging of modular config files into zensical.toml.
pub struct Merger {
    project_root: PathBuf,
}

impl Merger {
    pub fn new(project_root: PathBuf) -> Self {
        Self { project_root }
    }

    /// Check if config files in config/zensical/ are newer than zensical.toml.
    pub fn needs_merge(&self) -> bool {
        let config_dir = self.project_root.join("config").join("zensical");
        let zensical_toml = self.project_root.join("zensical.toml");

        if !config_dir.exists() {
            return false;
        }

        if !zensical_toml.exists() {
            return true;
        }

        let zensical_mtime = match fs::metadata(&zensical_toml)
            .and_then(|m| m.modified())
        {
            Ok(time) => time,
            Err(_) => return true,
        };

        let entries = match fs::read_dir(&config_dir) {
            Ok(entries) => entries,
            Err(_) => return false,
        };

        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("toml") {
                if let Ok(mtime) = fs::metadata(&path).and_then(|m| m.modified()) {
                    if mtime > zensical_mtime {
                        return true;
                    }
                }
            }
        }

        false
    }

    /// Run the merge script to regenerate zensical.toml.
    pub fn merge(&self) -> io::Result<()> {
        println!("\n Config files changed, merging configuration...\n");

        let merge_script = self.project_root
            .join("scripts")
            .join("python")
            .join("merge_zensical_config.py");

        if !merge_script.exists() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("Merge script not found: {}", merge_script.display()),
            ));
        }

        // Try uv run first
        let status = Command::new("uv")
            .current_dir(&self.project_root)
            .args(&["run", "python", merge_script.to_str().unwrap()])
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status();

        match status {
            Ok(s) if s.success() => {
                println!("\n Configuration merged successfully\n");
                return Ok(());
            }
            _ => {}
        }

        // Fallback to direct python
        let venv_python = self.project_root.join(".venv").join("bin").join("python");
        let python_cmd = if venv_python.exists() {
            venv_python.to_string_lossy().to_string()
        } else {
            "python3".to_string()
        };

        let status = Command::new(&python_cmd)
            .current_dir(&self.project_root)
            .arg(merge_script.to_str().unwrap())
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()?;

        if status.success() {
            println!("\n Configuration merged successfully\n");
            Ok(())
        } else {
            Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Config merge failed: {}", status),
            ))
        }
    }

    /// Ensure config is up-to-date before running zensical commands.
    pub fn ensure_merged(&self) -> io::Result<()> {
        if self.needs_merge() {
            self.merge()?;
        }
        Ok(())
    }
}
