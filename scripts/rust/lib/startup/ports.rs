//! Port management utilities.

use std::io::{self, Write};
use std::process::{Command, Stdio};

/// Manages port checking and process termination.
pub struct Ports;

impl Ports {
    /// Check if a port is in use and offer to kill the process.
    pub fn check_and_kill_if_needed(port: u16) {
        if !Self::is_port_in_use(port) {
            println!("Port {} is available.", port);
            return;
        }

        println!("Port {} is already in use.", port);
        Self::show_process_on_port(port);

        if Self::prompt_kill(port) {
            Self::kill_process_on_port(port);
        } else {
            println!("Port {} is still in use. Server may fail to start.", port);
        }
    }

    fn is_port_in_use(port: u16) -> bool {
        if cfg!(windows) {
            let output = Command::new("netstat").args(&["-ano"]).output();
            match output {
                Ok(output) if output.status.success() => {
                    String::from_utf8_lossy(&output.stdout).contains(&format!(":{}", port))
                }
                _ => false,
            }
        } else {
            Command::new("lsof")
                .args(&["-Pi", &format!(":{}", port), "-sTCP:LISTEN", "-t"])
                .stdout(Stdio::null())
                .status()
                .map(|s| s.success())
                .unwrap_or(false)
        }
    }

    fn show_process_on_port(port: u16) {
        if cfg!(windows) {
            let _ = Command::new("cmd")
                .args(&["/C", &format!("netstat -ano | findstr :{}", port)])
                .status();
        } else {
            let _ = Command::new("lsof")
                .args(&["-Pi", &format!(":{}", port), "-sTCP:LISTEN"])
                .status();
        }
    }

    fn prompt_kill(port: u16) -> bool {
        print!("Do you want to kill the process using port {}? (y/n): ", port);
        io::stdout().flush().unwrap();

        let mut answer = String::new();
        io::stdin().read_line(&mut answer).unwrap_or_default();
        answer.trim().to_lowercase() == "y"
    }

    fn kill_process_on_port(port: u16) {
        println!("Terminating process on port {}...", port);

        if cfg!(windows) {
            Self::kill_process_on_port_windows(port);
        } else {
            Self::kill_process_on_port_unix(port);
        }
    }

    fn kill_process_on_port_windows(port: u16) {
        let output = Command::new("cmd")
            .args(&[
                "/C",
                &format!(
                    "for /f \"tokens=5\" %a in ('netstat -ano ^| findstr :{}') do @echo %a",
                    port
                ),
            ])
            .output();

        let pid = match output {
            Ok(output) if output.status.success() => {
                String::from_utf8_lossy(&output.stdout).trim().to_string()
            }
            _ => return,
        };

        if !pid.is_empty() {
            println!("Killing process with PID: {}", pid);
            let _ = Command::new("taskkill").args(&["/F", "/PID", &pid]).status();
        }
    }

    fn kill_process_on_port_unix(port: u16) {
        let output = Command::new("lsof")
            .args(&["-ti", &format!(":{}", port)])
            .output();

        let pid = match output {
            Ok(output) if !output.stdout.is_empty() => {
                String::from_utf8_lossy(&output.stdout).trim().to_string()
            }
            _ => return,
        };

        if !pid.is_empty() {
            println!("Killing process with PID: {}", pid);
            let _ = Command::new("kill").args(&[&pid]).status();
        }
    }
}
