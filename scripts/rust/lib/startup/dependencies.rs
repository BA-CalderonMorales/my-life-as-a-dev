//! Python dependency management.

use std::env;
use std::path::PathBuf;
use std::process::Command;

use super::environment::Environment;

/// Manages Python dependencies installation.
pub struct Dependencies {
    project_root: PathBuf,
}

impl Dependencies {
    pub fn new(project_root: PathBuf) -> Self {
        Self { project_root }
    }

    /// Install dependencies from requirements.txt
    pub fn install(&self) {
        let requirements_path = self.find_requirements();

        println!(
            "\nEnsuring Python dependencies from {} are installed...",
            requirements_path.display()
        );

        if !requirements_path.exists() {
            eprintln!(
                "Warning: Requirements file not found at {}",
                requirements_path.display()
            );
            return;
        }

        // Try uv first, then fallback to pip
        if Environment::command_exists("uv") {
            if self.install_with_uv(&requirements_path) {
                return;
            }
        }

        self.install_with_pip(&requirements_path);
    }

    fn find_requirements(&self) -> PathBuf {
        let root_req = self.project_root.join("requirements.txt");
        if root_req.exists() {
            root_req
        } else {
            self.project_root.join("docs").join("requirements.txt")
        }
    }

    fn install_with_uv(&self, requirements_path: &PathBuf) -> bool {
        let venv_dir = self.project_root.join(".venv");
        let venv_bin = self.venv_bin_dir(&venv_dir);

        // Create venv if missing
        if !venv_dir.exists() {
            println!("Creating virtual environment with uv...");
            let status = Command::new("uv")
                .current_dir(&self.project_root)
                .args(&["venv", ".venv"])
                .status();
            if !matches!(status, Ok(s) if s.success()) {
                return false;
            }
        }

        // Clear stale lock files left behind by killed uv processes
        let lock_file = venv_dir.join(".lock");
        if lock_file.exists() {
            println!("Clearing stale uv lock file...");
            let _ = std::fs::remove_file(&lock_file);
        }

        println!("Installing dependencies with uv pip...");
        let mut cmd = Command::new("uv");
        cmd.current_dir(&self.project_root).args(&[
            "pip",
            "install",
            "-r",
            requirements_path.to_str().unwrap(),
        ]);

        // On WSL /mnt/c, hardlinks fail; skip straight to copies
        if env::var("UV_LINK_MODE").is_err() {
            let cwd = env::current_dir().unwrap_or_default();
            if cwd.to_string_lossy().starts_with("/mnt/")
                || self.project_root.to_string_lossy().starts_with("/mnt/")
            {
                cmd.env("UV_LINK_MODE", "copy");
            }
        }

        if venv_bin.exists() {
            let mut new_path = env::var("PATH").unwrap_or_default();
            new_path = format!("{}:{}", venv_bin.to_string_lossy(), new_path);
            cmd.env("PATH", new_path);
            cmd.env("VIRTUAL_ENV", venv_dir.to_string_lossy().to_string());
        }

        matches!(cmd.status(), Ok(s) if s.success())
    }

    fn install_with_pip(&self, requirements_path: &PathBuf) {
        let venv_dir = self.project_root.join(".venv");
        let venv_bin = self.venv_bin_dir(&venv_dir);
        let python_cmd = if cfg!(windows) { "python" } else { "python3" };

        // Create venv if needed
        if !venv_dir.exists() {
            println!("Creating virtual environment...");
            let status = Command::new(python_cmd)
                .current_dir(&self.project_root)
                .args(&["-m", "venv", ".venv"])
                .status();

            if !matches!(status, Ok(s) if s.success()) {
                eprintln!("Error: Failed to create virtual environment.");
                std::process::exit(1);
            }
        }

        // Install with pip
        let pip = venv_bin.join(if cfg!(windows) { "pip.exe" } else { "pip" });
        let status = Command::new(pip)
            .args(&["install", "-r", requirements_path.to_str().unwrap()])
            .status();

        if !matches!(status, Ok(s) if s.success()) {
            eprintln!("Error: Failed to install dependencies.");
            std::process::exit(1);
        }
    }

    fn venv_bin_dir(&self, venv_dir: &PathBuf) -> PathBuf {
        if cfg!(windows) {
            venv_dir.join("Scripts")
        } else {
            venv_dir.join("bin")
        }
    }
}
