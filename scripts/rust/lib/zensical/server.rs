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
        self.find_venv_binary("zensical")
            .unwrap_or_else(|| "zensical".to_string())
    }

    fn dev_addr(&self) -> String {
        env::var("DEV_ADDR")
            .or_else(|_| env::var("ZENSICAL_DEV_ADDR"))
            .unwrap_or_else(|_| "0.0.0.0:8001".to_string())
    }

    fn run_zensical(&self, args: &[&str]) -> io::Result<ExitStatus> {
        if let Some(python_cmd) = self.find_venv_binary("python") {
            let mut module_args = vec!["-m", "zensical"];
            module_args.extend_from_slice(args);

            return Command::new(python_cmd)
                .args(&module_args)
                .stdin(Stdio::inherit())
                .stdout(Stdio::inherit())
                .stderr(Stdio::inherit())
                .status();
        }

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

        let mut cmd = Command::new("uv");
        cmd.args(&uv_args)
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

    fn find_venv_binary(&self, name: &str) -> Option<String> {
        if self.project_root.to_string_lossy().starts_with("/mnt/") {
            if let Some(project_name) = self.project_root.file_name().and_then(|n| n.to_str()) {
                let home = env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
                let native_bin = PathBuf::from(home)
                    .join(".venvs")
                    .join(project_name)
                    .join("bin")
                    .join(name);

                if native_bin.exists() {
                    return Some(native_bin.to_string_lossy().to_string());
                }
            }
        }

        let project_bin = self.project_root.join(".venv").join("bin").join(name);
        if project_bin.exists() {
            return Some(project_bin.to_string_lossy().to_string());
        }

        None
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
