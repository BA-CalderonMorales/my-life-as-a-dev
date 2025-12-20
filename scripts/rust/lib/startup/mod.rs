//! Module for application startup

use std::env;
use std::io::{self, Write};
use std::net::TcpStream;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread::sleep;
use std::time::Duration;

/// Main entry point for application startup
#[allow(dead_code)]
pub fn main() -> std::io::Result<()> {
    let startup = Startup::new();
    match startup.run() {
        Ok(_) => {
            println!("Documentation server stopped.");
            Ok(())
        }
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}

/// Handles application startup
#[derive(Debug)]
pub struct Startup {
    project_root: PathBuf,
    script_path: PathBuf,
}

impl Startup {
    /// Create a new Startup instance
    pub fn new() -> Self {
        // Get the current directory
        let current_dir = env::current_dir().expect("Failed to get current directory");

        // Determine project root and script paths
        let (project_root, script_path) =
            if current_dir.ends_with("scripts/rust") || current_dir.ends_with("scripts\\rust") {
                // Running from scripts/rust directory
                (
                    current_dir
                        .parent()
                        .and_then(|p| p.parent())
                        .unwrap_or_else(|| ".".as_ref())
                        .to_path_buf(),
                    current_dir,
                )
            } else if current_dir.ends_with("scripts") {
                // Running from scripts directory
                (
                    current_dir
                        .parent()
                        .unwrap_or_else(|| ".".as_ref())
                        .to_path_buf(),
                    current_dir.join("rust"),
                )
            } else {
                // Default to current directory as project root
                (current_dir.clone(), current_dir.join("scripts/rust"))
            };

        println!("Debug - Project root: {}", project_root.display());
        println!("Debug - Script path: {}", script_path.display());

        Self {
            project_root,
            script_path,
        }
    }

    // Main execution method
    pub fn run(&self) -> std::io::Result<()> {
        println!("==== Starting setup for my-life-as-a-dev project ====");

        let is_local = env::args().any(|arg| arg == "--local");

        if !self.is_codespaces_environment() && !is_local {
            self.show_local_dev_instructions();
            return Ok(());
        }

        if is_local {
            println!("Local development mode detected.");
        } else {
            println!("GitHub Codespaces environment detected!");
        }

        println!("Setting up development environment...");

        self.install_dependencies();
        self.start_ai_proxy_if_needed();
        self.check_port_and_kill_if_needed();

        // Start the documentation server and handle any errors
        match self.start_documentation_server() {
            Ok(_) => {
                self.show_completion_message();
                Ok(())
            }
            Err(e) => {
                eprintln!("Error: Failed to start documentation server: {}", e);
                Err(e)
            }
        }
    }

    // Try connecting to 127.0.0.1:8765; if fails, start the AI proxy in background
    fn start_ai_proxy_if_needed(&self) {
        let addr = "127.0.0.1:8765";
        if TcpStream::connect(addr).is_ok() {
            println!("AI proxy already running at {}", addr);
            return;
        }

        println!("Starting AI proxy at {}...", addr);

        // Prefer uv run; fallback to venv python; then python3/python
        let proxy_script = self.project_root.join("scripts/python/ai_proxy.py");
        if !proxy_script.exists() {
            println!(
                "Warning: AI proxy script not found at {}",
                proxy_script.display()
            );
            return;
        }

        // Prefer using the project's venv python if available, then uv run, then system python
        let venv_python = if cfg!(windows) {
            self.project_root
                .join(".venv")
                .join("Scripts")
                .join("python.exe")
        } else {
            self.project_root.join(".venv").join("bin").join("python")
        };

        let mut cmd;
        if venv_python.exists() {
            cmd = Command::new(venv_python);
            cmd.current_dir(&self.project_root)
                .arg(proxy_script.to_str().unwrap());
        } else if Self::command_exists("uv") {
            cmd = Command::new("uv");
            cmd.current_dir(&self.project_root).args(&[
                "run",
                "python",
                proxy_script.to_str().unwrap(),
            ]);
        } else {
            let py = if cfg!(windows) { "python" } else { "python3" };
            cmd = Command::new(py);
            cmd.current_dir(&self.project_root)
                .arg(proxy_script.to_str().unwrap());
        }

        // Inherit environment; run detached (no stdio, don't wait)
        // If running in Codespaces, bind proxy on all interfaces for port forwarding
        if self.is_codespaces_environment() {
            cmd.env("HOST", "0.0.0.0");
        }

        // Capture logs to ai_proxy.log for debugging
        let log_path = self.project_root.join("ai_proxy.log");
        let log_file = std::fs::File::create(&log_path).ok();
        let log_file_err = std::fs::OpenOptions::new()
            .append(true)
            .open(&log_path)
            .ok();

        let mut child_cmd = cmd.stdin(Stdio::null());
        if let Some(f) = log_file {
            child_cmd = child_cmd.stdout(Stdio::from(f));
        }
        if let Some(f) = log_file_err {
            child_cmd = child_cmd.stderr(Stdio::from(f));
        }

        let _ = child_cmd
            .spawn()
            .map(|_| println!("AI proxy launched. Logging to {}", log_path.display()))
            .map_err(|e| println!("Warning: Failed to launch AI proxy: {}", e));

        // Wait briefly for the proxy to become ready
        let mut ready = false;
        for _ in 0..25 {
            if TcpStream::connect(addr).is_ok() {
                println!("AI proxy is ready at {}", addr);
                ready = true;
                break;
            }
            sleep(Duration::from_millis(200));
        }
        if !ready {
            println!(
                "Warning: AI proxy did not become ready in time. Check {} for errors.",
                log_path.display()
            );
        }
    }

    // Check if we're in GitHub Codespaces
    fn is_codespaces_environment(&self) -> bool {
        env::var("CODESPACES").is_ok() || env::var("GITHUB_CODESPACE_TOKEN").is_ok()
    }

    // Show instructions for local development
    fn show_local_dev_instructions(&self) {
        println!("\n=== Local Development Setup ===");
        println!("To set up the development environment locally, please ensure you have:");
        println!("1. Python 3.8+ installed");
        println!("2. uv (recommended) or pip (Python package manager)");
        println!("\nInstall dependencies manually with:");
        println!("  uv pip install -r requirements.txt");
        println!("\nStart the development server with:");
        println!("  mkdocs serve");
        println!("\n🤔 Are you trying to run this locally? Remember to use:");
        println!("  ./doc-cli startup --local");
        println!("\nOptions:");
        println!("  --clean    Use full rebuilds (slower but reliable when hot reload misbehaves)");
        println!();
    }

    // Check if a command exists in PATH
    fn command_exists(cmd: &str) -> bool {
        Command::new("sh")
            .arg("-lc")
            .arg(format!("command -v {} >/dev/null 2>&1", cmd))
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
    }

    // Install dependencies from requirements.txt into the project venv (always ensure AI proxy deps are present)
    fn install_dependencies(&self) {
        // First try to find requirements.txt in the project root
        let requirements_path = self.project_root.join("requirements.txt");

        // If not found in project root, try in the docs directory (common MkDocs location)
        let requirements_path = if !requirements_path.exists() {
            self.project_root.join("docs").join("requirements.txt")
        } else {
            requirements_path
        };

        println!(
            "\nEnsuring Python dependencies from {} are installed in project venv...",
            requirements_path.display()
        );

        if !requirements_path.exists() {
            eprintln!(
                "Warning: Requirements file not found at {}",
                requirements_path.display()
            );
            eprintln!("Please ensure you have a requirements.txt file in your project root or docs directory.");
            return;
        }

        // Prefer uv-managed virtual environment
        let venv_dir = self.project_root.join(".venv");
        let venv_bin = if cfg!(windows) {
            venv_dir.join("Scripts")
        } else {
            venv_dir.join("bin")
        };

        // Try using uv first
        if Self::command_exists("uv") {
            // Create venv if missing
            if !venv_dir.exists() {
                println!(
                    "Creating Python virtual environment with uv at {}",
                    venv_dir.display()
                );
                let status = Command::new("uv")
                    .current_dir(&self.project_root)
                    .args(&["venv", ".venv"])
                    .status();
                if !matches!(status, Ok(s) if s.success()) {
                    eprintln!("Warning: Failed to create venv with uv; will fallback to python venv if needed.");
                }
            }

            println!("Installing Python dependencies with uv pip...");
            let mut cmd = Command::new("uv");
            cmd.current_dir(&self.project_root).args(&[
                "pip",
                "install",
                "-r",
                requirements_path.to_str().unwrap(),
            ]);
            // Prefer installing into our project venv by adjusting PATH and VIRTUAL_ENV
            if venv_bin.exists() {
                let mut new_path = env::var("PATH").unwrap_or_default();
                let venv_bin_str = venv_bin.to_string_lossy().to_string();
                new_path = format!("{}:{}", venv_bin_str, new_path);
                cmd.env("PATH", new_path);
                cmd.env("VIRTUAL_ENV", venv_dir.to_string_lossy().to_string());
            }
            if let Ok(status) = cmd.status() {
                if status.success() {
                    return;
                } else {
                    eprintln!(
                        "Warning: uv pip install failed (status {}). Will try python venv.",
                        status
                    );
                }
            } else {
                eprintln!("Warning: Failed to execute uv. Will try python venv.");
            }
        }

        // Fallback: create a venv and install via pip inside it (avoids system pip restrictions)
        let python_cmd = if cfg!(windows) { "python" } else { "python3" };
        if !venv_dir.exists() {
            println!(
                "Creating Python virtual environment at {}",
                venv_dir.display()
            );
            let status = Command::new(python_cmd)
                .current_dir(&self.project_root)
                .args(&["-m", "venv", ".venv"])
                .status()
                .unwrap_or_else(|_| {
                    eprintln!("Error: Failed to create virtual environment. Make sure Python is installed.");
                    std::process::exit(1);
                });
            if !status.success() {
                eprintln!(
                    "Error: Failed to create virtual environment (exit code {}).",
                    status
                );
                std::process::exit(1);
            }
        }

        let pip_install =
            Command::new(venv_bin.join(if cfg!(windows) { "pip.exe" } else { "pip" }))
                .args(&["install", "-r", requirements_path.to_str().unwrap()])
                .status();
        match pip_install {
            Ok(s) if s.success() => {
                // All good
            }
            _ => {
                eprintln!("Error: Failed to install dependencies in virtual environment.");
                std::process::exit(1);
            }
        }
    }

    // Check if a port is in use and offer to kill the process
    fn check_port_and_kill_if_needed(&self) {
        let port = 8000;

        // Check if port is in use
        let is_port_in_use = if cfg!(windows) {
            // Windows: Use netstat to check for the port
            let output = Command::new("netstat").args(&["-ano"]).output();

            match output {
                Ok(output) if output.status.success() => {
                    let output_str = String::from_utf8_lossy(&output.stdout);
                    output_str.contains(&format!(":{}", port))
                }
                _ => {
                    println!(
                        "Warning: Could not check if port {} is in use. Continuing...",
                        port
                    );
                    return;
                }
            }
        } else {
            // Unix-like: Use lsof to check for the port
            let check_port = Command::new("lsof")
                .args(&["-Pi", &format!(":{}", port), "-sTCP:LISTEN", "-t"])
                .stdout(Stdio::null())
                .status();

            match check_port {
                Ok(status) => status.success(),
                Err(_) => {
                    println!("Warning: lsof not found. Could not check if port {} is in use. Continuing...", port);
                    return;
                }
            }
        };

        if !is_port_in_use {
            println!("Port {} is available.", port);
            return;
        }

        println!("Port {} is already in use.", port);

        // Show what process is using the port
        if cfg!(windows) {
            let _ = Command::new("cmd")
                .args(&["/C", &format!("netstat -ano | findstr :{}", port)])
                .status();
        } else {
            let _ = Command::new("lsof")
                .args(&["-Pi", &format!(":{}", port), "-sTCP:LISTEN"])
                .status();
        }

        // Ask if user wants to kill the process
        print!(
            "Do you want to kill the process using port {}? (y/n): ",
            port
        );
        io::stdout().flush().unwrap();

        let mut answer = String::new();
        io::stdin()
            .read_line(&mut answer)
            .expect("Failed to read input");

        if answer.trim().to_lowercase() == "y" {
            self.kill_process_on_port(port);
        } else {
            println!(
                "Port {} is still in use. MkDocs server may fail to start.",
                port
            );
        }
    }

    // Kill the process using the specified port
    fn kill_process_on_port(&self, port: u16) {
        println!("Terminating process on port {}...", port);

        if cfg!(windows) {
            // Windows: Find and kill the process using the port
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
                Ok(output) if output.status.success() && !output.stdout.is_empty() => {
                    String::from_utf8_lossy(&output.stdout).trim().to_string()
                }
                _ => {
                    println!("No process found on port {}", port);
                    return;
                }
            };

            if pid.is_empty() {
                println!("No process found on port {}", port);
                return;
            }

            println!("Killing process with PID: {}", pid);

            // Kill the process using taskkill
            let status = Command::new("taskkill")
                .args(&["/F", "/PID", &pid])
                .status();

            match status {
                Ok(status) if status.success() => {
                    println!("Successfully killed process on port {}", port);
                }
                _ => {
                    eprintln!("Failed to kill process on port {}", port);
                }
            }
        } else {
            // Unix-like: Use lsof to get the PID and kill the process
            let output = Command::new("lsof")
                .args(&["-ti", &format!(":{}", port)])
                .output();

            let pid = match output {
                Ok(output) if !output.stdout.is_empty() => {
                    String::from_utf8_lossy(&output.stdout).trim().to_string()
                }
                _ => {
                    println!("No process found on port {}", port);
                    return;
                }
            };

            if pid.is_empty() {
                println!("No process found on port {}", port);
                return;
            }

            println!("Killing process with PID: {}", pid);

            // Kill the process
            let status = Command::new("kill").args(&[&pid]).status();

            match status {
                Ok(status) if status.success() => {
                    println!("Successfully killed process on port {}", port);
                }
                _ => {
                    eprintln!("Failed to kill process on port {}", port);
                }
            }
        }
    }

    // Start the Zensical development server
    fn start_documentation_server(&self) -> std::io::Result<std::process::ExitStatus> {
        println!("\nStarting Zensical development server...");

        // Change to project root directory where zensical.toml should be located
        env::set_current_dir(&self.project_root).map_err(|e| {
            eprintln!("Failed to change to project directory: {}", e);
            e
        })?;

        // Check if zensical.toml exists
        if !Path::new("zensical.toml").exists() {
            let err = format!("zensical.toml not found in {}", self.project_root.display());
            eprintln!("Error: {}", err);
            eprintln!(
                "Please ensure you're in the correct directory with your Zensical documentation."
            );
            return Err(std::io::Error::new(std::io::ErrorKind::NotFound, err));
        }

        // Get zensical binary path - prefer venv installation
        let venv_zensical = if cfg!(windows) {
            self.project_root
                .join(".venv")
                .join("Scripts")
                .join("zensical.exe")
        } else {
            self.project_root.join(".venv").join("bin").join("zensical")
        };

        let zensical_cmd = if venv_zensical.exists() {
            venv_zensical.to_string_lossy().to_string()
        } else if Self::command_exists("zensical") {
            "zensical".to_string()
        } else {
            // Fallback to uv run
            return self.start_zensical_with_uv();
        };

        // Build the command
        let dev_addr = env::var("ZENSICAL_DEV_ADDR").unwrap_or_else(|_| "0.0.0.0:8001".to_string());
        
        let mut command = Command::new(&zensical_cmd);
        command.args(&["serve", "-a", &dev_addr]);

        println!("\nZensical server starting at http://{}/", dev_addr);
        println!("Press Ctrl+C to stop the server\n");

        // Execute the command
        let status = command
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status();

        match status {
            Ok(status) if status.success() => Ok(status),
            Ok(status) => {
                eprintln!("Error: Zensical server failed with exit code: {}", status);
                Err(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Zensical server failed with exit code: {}", status),
                ))
            }
            Err(e) => {
                eprintln!("Failed to start Zensical server: {}", e);
                eprintln!("Trying with uv run...");
                self.start_zensical_with_uv()
            }
        }
    }
    
    // Fallback: start zensical using uv run
    fn start_zensical_with_uv(&self) -> std::io::Result<std::process::ExitStatus> {
        let dev_addr = env::var("ZENSICAL_DEV_ADDR").unwrap_or_else(|_| "0.0.0.0:8001".to_string());
        
        let mut command = Command::new("uv");
        command.args(&["run", "zensical", "serve", "-a", &dev_addr]);

        println!("\nZensical server starting via uv at http://{}/", dev_addr);
        println!("Press Ctrl+C to stop the server\n");

        command
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()
    }

    // Show completion message
    fn show_completion_message(&self) {
        println!("\nSetup completed successfully!");
        println!("\nYour documentation is now available at:");
        println!("http://localhost:8001");
        println!("\nProject root: {}", self.project_root.display());
        println!("Script path: {}", self.script_path.display());
        println!("\nPress Ctrl+C to stop the server when you're done.");
    }
}
