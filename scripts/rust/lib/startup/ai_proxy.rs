//! AI proxy management.

use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::thread::sleep;
use std::time::Duration;

use super::environment::Environment;

/// Manages the AI proxy server.
pub struct AiProxy {
    project_root: PathBuf,
    is_codespaces: bool,
}

impl AiProxy {
    pub fn new(project_root: PathBuf, is_codespaces: bool) -> Self {
        Self { project_root, is_codespaces }
    }

    /// Start the AI proxy if not already running.
    pub fn start_if_needed(&self) {
        let addr = "127.0.0.1:8765";

        if TcpStream::connect(addr).is_ok() {
            println!("AI proxy already running at {}", addr);
            return;
        }

        println!("Starting AI proxy at {}...", addr);

        let proxy_script = self.project_root.join("scripts/python/ai_proxy.py");
        if !proxy_script.exists() {
            println!("Warning: AI proxy script not found at {}", proxy_script.display());
            return;
        }

        self.spawn_proxy(&proxy_script);
        self.wait_for_ready(addr);
    }

    fn spawn_proxy(&self, script: &PathBuf) {
        let log_path = self.project_root.join("ai_proxy.log");

        let mut cmd = self.build_python_command(script);

        if self.is_codespaces {
            cmd.env("HOST", "0.0.0.0");
        }

        // Set up logging
        if let Ok(log_file) = std::fs::File::create(&log_path) {
            cmd.stdout(Stdio::from(log_file));
        }
        if let Ok(log_file) = std::fs::OpenOptions::new().append(true).open(&log_path) {
            cmd.stderr(Stdio::from(log_file));
        }

        cmd.stdin(Stdio::null());

        match cmd.spawn() {
            Ok(_) => println!("AI proxy launched. Logging to {}", log_path.display()),
            Err(e) => println!("Warning: Failed to launch AI proxy: {}", e),
        }
    }

    fn build_python_command(&self, script: &PathBuf) -> Command {
        let venv_python = if cfg!(windows) {
            self.project_root.join(".venv").join("Scripts").join("python.exe")
        } else {
            self.project_root.join(".venv").join("bin").join("python")
        };

        if venv_python.exists() {
            let mut cmd = Command::new(venv_python);
            cmd.current_dir(&self.project_root).arg(script);
            cmd
        } else if Environment::command_exists("uv") {
            let mut cmd = Command::new("uv");
            cmd.current_dir(&self.project_root)
                .args(&["run", "python", script.to_str().unwrap()]);
            cmd
        } else {
            let py = if cfg!(windows) { "python" } else { "python3" };
            let mut cmd = Command::new(py);
            cmd.current_dir(&self.project_root).arg(script);
            cmd
        }
    }

    fn wait_for_ready(&self, addr: &str) {
        for _ in 0..25 {
            if TcpStream::connect(addr).is_ok() {
                println!("AI proxy is ready at {}", addr);
                return;
            }
            sleep(Duration::from_millis(200));
        }
        println!("Warning: AI proxy did not become ready in time.");
    }
}
