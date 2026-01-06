//! Kill Command - Stop running Zensical/MkDocs processes
//!
//! This command stops any running documentation server processes
//! by name (zensical, mkdocs) and by port (8000, 8001).

use std::io;
use std::path::PathBuf;
use std::process::Command as ProcessCommand;

use super::{Command, CommandContext};

/// Command to kill running Zensical/MkDocs processes
pub struct KillCommand {
    #[allow(dead_code)]
    project_root: PathBuf,
}

impl KillCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
        }
    }

    /// Kill processes by name using pkill
    fn kill_process_by_name(&self, name: &str) -> io::Result<usize> {
        let check = ProcessCommand::new("pgrep")
            .arg("-f")
            .arg(name)
            .output();

        match check {
            Ok(output) if output.status.success() => {
                let pids = String::from_utf8_lossy(&output.stdout);
                let pid_count = pids.lines().count();

                if pid_count > 0 {
                    println!("  Found {} {} process(es), killing...", pid_count, name);

                    let _ = ProcessCommand::new("pkill")
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

    /// Kill process listening on a specific port using lsof
    fn kill_process_on_port(&self, port: u16) -> io::Result<usize> {
        let check = ProcessCommand::new("lsof")
            .args(&["-t", "-i", &format!(":{}", port)])
            .output();

        match check {
            Ok(output) if output.status.success() => {
                let pids = String::from_utf8_lossy(&output.stdout);
                let pid_list: Vec<&str> = pids.lines().collect();

                if !pid_list.is_empty() {
                    println!(
                        "  Found {} process(es) on port {}, killing...",
                        pid_list.len(),
                        port
                    );

                    for pid in &pid_list {
                        let _ = ProcessCommand::new("kill")
                            .args(&["-9", pid])
                            .status();
                    }

                    return Ok(pid_list.len());
                }
            }
            _ => {}
        }

        Ok(0)
    }
}

impl Command for KillCommand {
    fn name(&self) -> &'static str {
        "kill"
    }

    fn description(&self) -> &'static str {
        "Stop running Zensical/MkDocs processes"
    }

    fn aliases(&self) -> Vec<&'static str> {
        vec!["stop"]
    }

    fn execute(&self) -> io::Result<()> {
        println!("\nStopping Zensical/MkDocs processes...\n");

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
            println!("\nStopped {} process(es)", killed_count);
        } else {
            println!("\nNo running Zensical/MkDocs processes found");
        }

        Ok(())
    }
}
