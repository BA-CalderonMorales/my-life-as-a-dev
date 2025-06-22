use std::env;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::io::{self, Write};

fn main() {
    let mut app = DocCli::new();
    if let Err(e) = app.run() {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
}

// DocCli struct to handle all documentation utilities
struct DocCli {
    project_root: PathBuf,
    script_path: PathBuf,
    args: Vec<String>,
}

impl DocCli {
    // Create a new DocCli instance
    fn new() -> Self {
        let args: Vec<String> = env::args().collect();
        
        // Get current working directory and executable path
        let current_dir = env::current_dir().expect("Failed to get current directory");
        let current_exe = env::current_exe().expect("Failed to get current executable path");
        
        // Determine paths based on where we're running from
        let (project_root, script_path) = if current_exe.file_name().unwrap_or_default() == "doc-cli.exe" && current_dir.ends_with("my-life-as-a-dev") {
            // Running ./doc-cli.exe from project root
            let script_path = current_dir.join("scripts").join("rust");
            (current_dir, script_path)
        } else if current_exe.parent().unwrap_or(&current_dir).ends_with("target/release") || current_exe.parent().unwrap_or(&current_dir).ends_with("target/debug") {
            // Running from cargo build output
            let script_path = current_dir.clone();
            let project_root = script_path.parent().and_then(|p| p.parent()).unwrap_or(&current_dir).to_path_buf();
            (project_root, script_path)
        } else {
            // Fallback: try to detect based on current directory
            if current_dir.ends_with("scripts/rust") || current_dir.ends_with("scripts\\rust") {
                let project_root = current_dir.parent().and_then(|p| p.parent()).unwrap_or(&current_dir).to_path_buf();
                (project_root, current_dir)
            } else {
                // Last resort: assume we're in project root
                let script_path = current_dir.join("scripts").join("rust");
                (current_dir.clone(), script_path)
            }
        };
        
        println!("Debug - script_path: {:?}", script_path);
        println!("Debug - project_root: {:?}", project_root);
        
        // Process command line arguments
        let mut filtered_args = Vec::new();
        
        for arg in &args {
            if arg == "--help" || arg == "-h" {
                // Handle help flag immediately
                let _ = Self::show_help();
                std::process::exit(0);
            } else {
                filtered_args.push(arg.clone());
            }
        }
        
        DocCli {
            args: filtered_args,
            script_path,
            project_root,
        }
    }

    // Main execution method
    fn run(&mut self) -> std::io::Result<()> {
        self.print_header();

        if self.args.len() <= 1 {
            self.print_menu()?;
            self.handle_user_choice()
        } else {
            let command = &self.args[1];
            self.handle_command(command)
        }
    }

    // Print header with tool name
    fn print_header(&self) {
        println!("\n{}", "=".repeat(60));
        println!("📚 MkDocs Documentation CLI Tool");
        println!("{}", "=".repeat(60));
    }

    // Print the main menu
    fn print_menu(&self) -> std::io::Result<()> {
        println!("\nAvailable commands:");
        println!("  1. startup       - Start the development environment (GitHub Codespaces)");
        println!("  2. bump-version  - Bump the documentation version");
        println!("  3. deploy        - Deploy all versions to GitHub Pages");
        println!("  h. help          - Show command help information");
        println!();
        println!("💡 For local development, use: ./doc-cli.exe startup --local");
        println!();
        print!("Enter your choice (1-3 or h) or command name: ");
        io::stdout().flush()?;
        Ok(())
    }

    // Handle user choice from the menu
    fn handle_user_choice(&mut self) -> std::io::Result<()> {
        let mut choice = String::new();
        io::stdin().read_line(&mut choice).expect("Failed to read input");
        let choice = choice.trim();
        
        match choice {
            "1" | "startup" => self.handle_command("startup"),
            "2" | "bump-version" => self.handle_command("bump-version"),
            "3" | "deploy" => self.handle_command("deploy"),
            "h" | "help" => {
                Self::show_help()?;
                Ok(())
            },
            _ => {
                println!("Invalid choice: {}. Please try again.", choice);
                self.print_menu()?;
                self.handle_user_choice()
            }
        }
    }

    // Handle a specific command
    fn handle_command(&self, command: &str) -> std::io::Result<()> {
        match command {
            "startup" => self.run_startup(),
            "bump-version" | "bump_version" => self.run_bump_version(),
            "deploy" | "deploy-all-versions" | "deploy_all_versions" => self.run_deploy_all_versions(),
            "help" | "--help" | "-h" => {
                Self::show_help()?;
                Ok(())
            },
            _ => {
                eprintln!("Unknown command: {}", command);
                eprintln!("Available commands: startup, bump-version, deploy, help");
                eprintln!("Use 'doc-cli help' to see more details about available commands.");
                std::process::exit(1);
            }
        }
    }

    // Show help information
    fn show_help() -> std::io::Result<()> {
        println!("\n📋 Documentation CLI Tool Help");
        println!("==============================\n");
        println!("Usage: doc-cli [COMMAND] [OPTIONS]");
        println!("\nCommands:");
        println!("  startup              Start the documentation development environment");
        println!("                       Sets up MkDocs with mike for versioned documentation");
        println!("    Options:");
        println!("      --local           Run in local mode");
        println!("      --codespaces      Run in GitHub Codespaces environment");
        println!("      --draft-version VERSION   View a specific version not yet deployed to gh-pages");
        println!();
        println!("  bump-version         Bump the documentation version");
        println!("  deploy              Deploy all versions of the documentation");
        println!("  help                Show this help message");
        Ok(())
    }

    // Helper method to find rustc
    fn find_rustc(&self) -> Result<String, String> {
        // Try rustc directly first
        if Command::new("rustc").arg("--version").output().is_ok() {
            return Ok("rustc".to_string());
        }
        
        // Try common installation paths
        let common_paths = [
            "/usr/bin/rustc",
            "/usr/local/bin/rustc",
            "/opt/homebrew/bin/rustc",
        ];
        
        for path in &common_paths {
            if std::path::Path::new(path).exists() {
                return Ok(path.to_string());
            }
        }
        
        // Try to find via which command
        if let Ok(output) = Command::new("which").arg("rustc").output() {
            let path_string = String::from_utf8_lossy(&output.stdout);
            let path = path_string.trim();
            if !path.is_empty() && std::path::Path::new(path).exists() {
                return Ok(path.to_string());
            }
        }
        
        Err("rustc not found".to_string())
    }

    // Helper method to build a Rust binary
    fn build_rust_binary(&self, source_file: &str, binary_name: &str) -> Result<(), String> {
        let binary_path = self.script_path.join(format!("target/release/{}", binary_name));
        
        // Look for source file in the lib/ directory structure
        let source_path = self.script_path.join("lib").join(source_file).join("mod.rs");
        
        if !source_path.exists() {
            return Err(format!("Source file not found: {}", source_path.display()));
        }
        
        println!("{} binary not found. Building it first...", binary_name);
        
        // Ensure target directory exists
        std::fs::create_dir_all(self.script_path.join("target/release"))
            .map_err(|e| format!("Failed to create target directory: {}", e))?;
        
        // Find rustc
        let rustc_cmd = self.find_rustc().map_err(|_| {
            format!(
                "rustc not found. Please install Rust:\n\
                 - Visit https://rustup.rs/ to install Rust\n\
                 - Or install via package manager:\n\
                   Ubuntu/Debian: sudo apt install rustc\n\
                   Fedora: sudo dnf install rust\n\
                   Arch: sudo pacman -S rust\n\
                 - Make sure rustc is in your PATH"
            )
        })?;
        
        // Build the binary
        let status = Command::new(&rustc_cmd)
            .current_dir(&self.script_path)
            .args(&["-o", binary_path.to_str().unwrap(), source_path.to_str().unwrap()])
            .status()
            .map_err(|e| format!("Failed to execute rustc: {}", e))?;
            
        if !status.success() {
            return Err(format!("Failed to build {} binary", binary_name));
        }
        
        Ok(())
    }

    // Execute the startup functionality
    fn run_startup(&self) -> std::io::Result<()> {
        println!("\n🚀 Running startup script...\n");
        
        let binary_path = self.script_path.join("target/release/startup");
        
        if !binary_path.exists() {
            if let Err(e) = self.build_rust_binary("startup", "startup") {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    format!("Failed to build startup binary: {}", e)
                ));
            }
        }
        
        // Get command line arguments (skip the first two: "doc-cli" and "startup")
        let mut args = Vec::new();
        let mut draft_version = None;
        let mut local_mode = false;
        let mut codespaces = false;
        
        if self.args.len() > 2 {
            let mut i = 2;
            while i < self.args.len() {
                if self.args[i] == "--draft-version" && i + 1 < self.args.len() {
                    draft_version = Some(self.args[i+1].clone());
                    // Skip both the flag and its value
                    i += 2;
                } else if self.args[i] == "--local" {
                    local_mode = true;
                    i += 1;
                } else if self.args[i] == "--codespaces" {
                    codespaces = true;
                    i += 1;
                } else {
                    args.push(self.args[i].clone());
                    i += 1;
                }
            }
        }
        
        // Change to project root for environment setup
        env::set_current_dir(&self.project_root).map_err(|e| {
            std::io::Error::new(
                std::io::ErrorKind::NotFound,
                format!("Failed to change to project root directory: {}", e)
            )
        })?;
        
        // Set up command with explicit interactive I/O handling
        let mut cmd = Command::new(&binary_path);
        
        // Add draft version if specified
        if let Some(version) = draft_version {
            cmd.args(&["--draft-version", &version]);
            println!("Using draft version: {}", version);
        }
        
        // Add local mode if specified
        if local_mode {
            cmd.arg("--local");
        }
        
        // Add codespaces mode if specified
        if codespaces {
            cmd.arg("--codespaces");
        }
        
        // Add any other passed arguments
        if !args.is_empty() {
            cmd.args(&args);
        }
        
        // Explicitly inherit stdio for interactive use
        cmd.stdin(Stdio::inherit())
           .stdout(Stdio::inherit())
           .stderr(Stdio::inherit());
        
        // Run the command and wait for completion
        let status = cmd.status()?;
            
        if !status.success() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Startup script failed with exit code: {}", status)
            ));
        }
        
        Ok(())
    }

    // Execute the bump-version functionality
    fn run_bump_version(&self) -> std::io::Result<()> {
        use std::io::{self, Write};
        
        println!("\n🔄 Running version bump script...\n");
        
        let binary_name = "bump_version";
        let binary_path = self.script_path.join(format!("target/release/{}", binary_name));
        
        if !binary_path.exists() {
            self.build_rust_binary(binary_name, binary_name)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
        }
        
        // Change to project root for git operations
        env::set_current_dir(&self.project_root)?;
        
        // Flush stdout before running the command
        io::stdout().flush()?;
        
        // Use the standard Command API with inherited stdio
        let status = Command::new(&binary_path)
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()?;
            
        if !status.success() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Bump version script failed with exit code: {}", status)
            ));
        }
        
        Ok(())
    }

    // Execute the deploy-all-versions functionality
    fn run_deploy_all_versions(&self) -> std::io::Result<()> {
        println!("\n🚀 Running deploy-all-versions script...\n");
        
        let binary_name = "deploy_all_versions";
        let binary_path = self.script_path.join(format!("target/release/{}", binary_name));
        
        if !binary_path.exists() {
            self.build_rust_binary(binary_name, binary_name)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
        }
        
        // Get command line arguments (skip the first two: "doc-cli" and "deploy")
        let mut args = Vec::new();
        if self.args.len() > 2 {
            args.extend_from_slice(&self.args[2..]);
        }
        
        // Change to project root for git operations
        env::set_current_dir(&self.project_root)?;
        
        // Set up command with explicit interactive I/O handling
        let mut cmd = Command::new(&binary_path);
        
        // Add any passed arguments
        if !args.is_empty() {
            cmd.args(&args);
        }
        
        // Explicitly inherit stdio for interactive use
        cmd.stdin(Stdio::inherit())
           .stdout(Stdio::inherit())
           .stderr(Stdio::inherit());
        
        // Run the command and wait for completion
        let status = cmd.status()?;
            
        if !status.success() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Deploy-all-versions script failed with exit code: {}", status)
            ));
        }
        
        Ok(())
    }
}