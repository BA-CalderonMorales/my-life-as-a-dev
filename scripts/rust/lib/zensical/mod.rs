//! Zensical server management - serve, build, and kill commands

use std::env;
use std::io;
use std::path::PathBuf;
use std::process::{Command, Stdio};

/// Manages Zensical server operations
pub struct ZensicalManager {
    project_root: PathBuf,
}

impl ZensicalManager {
    /// Create a new ZensicalManager
    pub fn new(project_root: PathBuf) -> Self {
        Self { project_root }
    }

    /// Get the path to zensical binary (checks venv first, then system PATH)
    pub fn get_zensical_path(&self) -> String {
        let venv_zensical = self.project_root.join(".venv").join("bin").join("zensical");
        if venv_zensical.exists() {
            return venv_zensical.to_string_lossy().to_string();
        }
        "zensical".to_string()
    }

    /// Start the Zensical development server
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
                format!("Zensical serve failed with exit code: {}", status),
            ));
        }

        Ok(())
    }

    /// Build the site with Zensical
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
                format!("Zensical build failed with exit code: {}", status),
            ));
        }

        println!("\nZensical build complete!");
        Ok(())
    }

    /// Kill any running Zensical/MkDocs processes
    pub fn kill(&self) -> io::Result<()> {
        println!("\n🔪 Stopping Zensical/MkDocs processes...\n");

        let mut killed_count = 0;

        // Kill zensical processes
        killed_count += self.kill_process_by_name("zensical")?;

        // Kill mkdocs processes (legacy)
        killed_count += self.kill_process_by_name("mkdocs")?;

        // Kill any process listening on port 8001 (zensical default)
        killed_count += self.kill_process_on_port(8001)?;

        // Kill any process listening on port 8000 (mkdocs default)
        killed_count += self.kill_process_on_port(8000)?;

        if killed_count > 0 {
            println!("\n✅ Stopped {} process(es)", killed_count);
        } else {
            println!("\n📭 No running Zensical/MkDocs processes found");
        }

        Ok(())
    }

    /// Kill processes by name using pkill
    fn kill_process_by_name(&self, name: &str) -> io::Result<usize> {
        // First, check if any processes exist
        let check = Command::new("pgrep")
            .arg("-f")
            .arg(name)
            .output();

        match check {
            Ok(output) if output.status.success() => {
                let pids = String::from_utf8_lossy(&output.stdout);
                let pid_count = pids.lines().count();

                if pid_count > 0 {
                    println!("  Found {} {} process(es), terminating...", pid_count, name);

                    // Use pkill to kill the processes
                    let _ = Command::new("pkill")
                        .arg("-f")
                        .arg(name)
                        .status();

                    // Give processes time to terminate gracefully
                    std::thread::sleep(std::time::Duration::from_millis(500));

                    // Force kill if still running
                    let _ = Command::new("pkill")
                        .arg("-9")
                        .arg("-f")
                        .arg(name)
                        .status();

                    return Ok(pid_count);
                }
            }
            _ => {}
        }

        Ok(0)
    }

    /// Kill process listening on a specific port
    fn kill_process_on_port(&self, port: u16) -> io::Result<usize> {
        // Try lsof first (macOS/Linux)
        let lsof_result = Command::new("lsof")
            .args(&["-t", "-i", &format!(":{}", port)])
            .output();

        if let Ok(output) = lsof_result {
            if output.status.success() {
                let pids = String::from_utf8_lossy(&output.stdout);
                let pid_list: Vec<&str> = pids.lines().collect();

                if !pid_list.is_empty() {
                    println!("  Found process on port {}, terminating...", port);

                    for pid in &pid_list {
                        let pid = pid.trim();
                        if !pid.is_empty() {
                            let _ = Command::new("kill").arg(pid).status();
                        }
                    }

                    std::thread::sleep(std::time::Duration::from_millis(500));

                    // Force kill if still running
                    for pid in &pid_list {
                        let pid = pid.trim();
                        if !pid.is_empty() {
                            let _ = Command::new("kill").args(&["-9", pid]).status();
                        }
                    }

                    return Ok(pid_list.len());
                }
            }
        }

        // Try fuser as fallback (Linux)
        let fuser_result = Command::new("fuser")
            .args(&["-k", &format!("{}/tcp", port)])
            .status();

        if let Ok(status) = fuser_result {
            if status.success() {
                return Ok(1);
            }
        }

        Ok(0)
    }

    /// Check if Zensical is currently running
    pub fn is_running(&self) -> bool {
        // Check for zensical process
        if let Ok(output) = Command::new("pgrep").arg("-f").arg("zensical").output() {
            if output.status.success() && !output.stdout.is_empty() {
                return true;
            }
        }

        // Check if port 8001 is in use
        if let Ok(output) = Command::new("lsof")
            .args(&["-i", ":8001"])
            .output()
        {
            if output.status.success() && !output.stdout.is_empty() {
                return true;
            }
        }

        false
    }

    /// Restart the server (kill then serve)
    pub fn restart(&self) -> io::Result<()> {
        self.kill()?;
        std::thread::sleep(std::time::Duration::from_millis(1000));
        self.serve()
    }
}
