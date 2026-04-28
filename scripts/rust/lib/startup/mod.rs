//! Application startup module.
//!
//! # Structure
//!
//! - `environment.rs` - Environment detection (Codespaces, local)
//! - `dependencies.rs` - Python dependency installation
//! - `ports.rs` - Port checking and process management
//! - `server.rs` - Zensical server management
//! - `ai_proxy.rs` - AI proxy server management

mod ai_proxy;
mod dependencies;
mod environment;
mod ports;
mod server;

use std::env;
use std::path::PathBuf;

pub use environment::Environment;

/// Main entry point for application startup.
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

/// Handles application startup.
#[derive(Debug)]
pub struct Startup {
    project_root: PathBuf,
    #[allow(dead_code)]
    script_path: PathBuf,
}

impl Startup {
    /// Create a new Startup instance.
    pub fn new() -> Self {
        let current_dir = env::current_dir().expect("Failed to get current directory");

        let (project_root, script_path) = Self::detect_paths(&current_dir);

        println!("Debug - Project root: {}", project_root.display());
        println!("Debug - Script path: {}", script_path.display());

        Self { project_root, script_path }
    }

    fn detect_paths(current_dir: &PathBuf) -> (PathBuf, PathBuf) {
        if current_dir.ends_with("scripts/rust") || current_dir.ends_with("scripts\\rust") {
            (
                current_dir.parent()
                    .and_then(|p| p.parent())
                    .unwrap_or_else(|| ".".as_ref())
                    .to_path_buf(),
                current_dir.clone(),
            )
        } else if current_dir.ends_with("scripts") {
            (
                current_dir.parent()
                    .unwrap_or_else(|| ".".as_ref())
                    .to_path_buf(),
                current_dir.join("rust"),
            )
        } else {
            (current_dir.clone(), current_dir.join("scripts/rust"))
        }
    }

    /// Main execution method.
    pub fn run(&self) -> std::io::Result<()> {
        self.run_with_local(false)
    }

    /// Run setup in local mode (skips Codespaces check).
    pub fn run_local(&self) -> std::io::Result<()> {
        self.run_with_local(true)
    }

    fn run_with_local(&self, force_local: bool) -> std::io::Result<()> {
        println!("==== Starting setup for my-life-as-a-dev project ====");

        let is_local = env::args().any(|arg| arg == "--local") || force_local;

        if !Environment::is_codespaces() && !is_local {
            Environment::show_local_dev_instructions();
            return Ok(());
        }

        if is_local {
            println!("Local development mode detected.");
        } else {
            println!("GitHub Codespaces environment detected!");
        }

        println!("Setting up development environment...");

        // Install dependencies
        let deps = dependencies::Dependencies::new(self.project_root.clone());
        deps.install();

        // Start AI proxy if needed
        let proxy = ai_proxy::AiProxy::new(
            self.project_root.clone(),
            Environment::is_codespaces(),
        );
        proxy.start_if_needed();

        // Check port availability
        ports::Ports::check_and_kill_if_needed(8000);

        // Start the documentation server
        let server = server::Server::new(self.project_root.clone());
        match server.start() {
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

    fn show_completion_message(&self) {
        println!("\nSetup completed successfully!");
        println!("\nYour documentation is now available at:");
        println!("http://localhost:8001");
        println!("\nProject root: {}", self.project_root.display());
        println!("\nPress Ctrl+C to stop the server when you're done.");
    }
}
