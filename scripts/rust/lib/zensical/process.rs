//! Process management for Zensical/MkDocs.

use std::io;
use std::process::Command;

/// Manages process killing for Zensical/MkDocs.
pub struct ProcessManager;

impl ProcessManager {
    /// Kill any running Zensical/MkDocs processes.
    pub fn kill_all() -> io::Result<usize> {
        println!("\n Stopping Zensical/MkDocs processes...\n");

        let mut killed_count = 0;

        killed_count += Self::kill_by_name("zensical")?;
        killed_count += Self::kill_by_name("mkdocs")?;
        killed_count += Self::kill_on_port(8001)?;
        killed_count += Self::kill_on_port(8000)?;

        Ok(killed_count)
    }

    /// Kill processes by name using pkill.
    pub fn kill_by_name(name: &str) -> io::Result<usize> {
        let check = Command::new("pgrep").arg("-f").arg(name).output();

        if let Ok(output) = check {
            if output.status.success() {
                let pids = String::from_utf8_lossy(&output.stdout);
                let pid_count = pids.lines().count();

                if pid_count > 0 {
                    println!("  Found {} {} process(es), terminating...", pid_count, name);

                    let _ = Command::new("pkill").arg("-f").arg(name).status();
                    std::thread::sleep(std::time::Duration::from_millis(500));
                    let _ = Command::new("pkill").arg("-9").arg("-f").arg(name).status();

                    return Ok(pid_count);
                }
            }
        }

        Ok(0)
    }

    /// Kill process on a specific port.
    pub fn kill_on_port(port: u16) -> io::Result<usize> {
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

        // Fallback: try fuser
        if let Ok(status) = Command::new("fuser")
            .args(&["-k", &format!("{}/tcp", port)])
            .status()
        {
            if status.success() {
                return Ok(1);
            }
        }

        Ok(0)
    }
}
