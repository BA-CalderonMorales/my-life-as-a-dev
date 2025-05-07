use std::env;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::io::{self, Write};

fn main() {
    let mut app = DocCli::new();
    app.run();
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
        let current_dir = env::current_dir().expect("Failed to get current directory");
        
        // Determine if we're in the scripts directory or the project root
        let is_in_scripts = current_dir.file_name().map_or(false, |name| name == "scripts");
        
        // Set script_path to the scripts directory
        let script_path = if is_in_scripts {
            current_dir.clone()
        } else {
            current_dir.join("scripts")
        };
        
        // Set project_root to the parent of scripts
        let project_root = if is_in_scripts {
            current_dir.parent().unwrap_or(&current_dir).to_path_buf()
        } else {
            current_dir.clone()
        };
        
        println!("Debug - script_path: {:?}", script_path);
        println!("Debug - project_root: {:?}", project_root);
        
        Self { 
            project_root,
            script_path,
            args,
        }
    }

    // Main execution method
    fn run(&mut self) {
        self.print_header();

        if self.args.len() <= 1 {
            self.print_menu();
            self.handle_user_choice();
        } else {
            let command = &self.args[1];
            self.handle_command(command);
        }
    }

    // Print header with tool name
    fn print_header(&self) {
        println!("\n{}", "=".repeat(60));
        println!("📚 MkDocs Documentation CLI Tool");
        println!("{}", "=".repeat(60));
    }

    // Print the main menu
    fn print_menu(&self) {
        println!("\nAvailable commands:");
        println!("  1. startup       - Start the development environment");
        println!("  2. bump-version  - Bump the documentation version");
        println!("  3. deploy        - Deploy all versions to GitHub Pages");
        println!("  h. help          - Show command help information");
        println!();
        print!("Enter your choice (1-3 or h) or command name: ");
        io::stdout().flush().unwrap();
    }

    // Handle user choice from the menu
    fn handle_user_choice(&mut self) {
        let mut choice = String::new();
        io::stdin().read_line(&mut choice).expect("Failed to read input");
        let choice = choice.trim();
        
        match choice {
            "1" | "startup" => self.handle_command("startup"),
            "2" | "bump-version" => self.handle_command("bump-version"),
            "3" | "deploy" => self.handle_command("deploy"),
            "h" | "help" => self.handle_command("help"),
            _ => {
                println!("Invalid choice: {}. Please try again.", choice);
                self.print_menu();
                self.handle_user_choice();
            }
        }
    }

    // Handle a specific command
    fn handle_command(&self, command: &str) {
        match command {
            "startup" => self.run_startup(),
            "bump-version" => self.run_bump_version(),
            "deploy" | "deploy-all-versions" => self.run_deploy_all_versions(),
            "help" | "--help" | "-h" => self.show_help(),
            _ => {
                println!("Unknown command: {}. Available commands: startup, bump-version, deploy, help", command);
                println!("Use 'doc-cli help' to see more details about available commands.");
                std::process::exit(1);
            }
        }
    }

    // Show help information
    fn show_help(&self) {
        println!("\n📋 Documentation CLI Tool Help");
        println!("==============================\n");
        println!("Usage: doc-cli [COMMAND] [OPTIONS]");
        println!("\nCommands:");
        println!("  startup              Start the documentation development environment");
        println!("                       Sets up MkDocs with mike for versioned documentation");
        println!("    Options:");
        println!("      --draft-version VERSION   View a specific version not yet deployed to gh-pages");
        println!();
        println!("  bump-version         Bump the documentation version");
        println!("                       Creates a new git tag and optionally deploys it");
        println!();
        println!("  deploy               Deploy all versions to GitHub Pages");
        println!("                       Uses mike to deploy to the gh-pages branch");
        println!();
        println!("  help, -h, --help     Display this help information");
        println!();
        println!("Examples:");
        println!("  doc-cli                                  # Start interactive menu");
        println!("  doc-cli startup                          # Start development server");
        println!("  doc-cli startup --draft-version 1.2.0    # Start server with draft version 1.2.0");
        println!("  doc-cli bump-version                     # Bump the version");
        println!("  doc-cli deploy                           # Deploy all versions");
        
        // Add information about planned features
        println!("\nPlanned Features:");
        println!("  - Force deployment option for 'deploy' command");
        println!("  - Version selection for 'bump-version' command");
        println!("  - Custom port option for 'startup' command");
    }

    // Execute the startup functionality
    fn run_startup(&self) {
        println!("\n🚀 Running startup script...\n");
        
        let binary_path = self.script_path.join("target/release/startup");
        let source_path = self.script_path.join("startup.rs");
        
        if !binary_path.exists() {
            println!("Startup binary not found. Building it first...");
            
            // Ensure target directory exists
            std::fs::create_dir_all(self.script_path.join("target/release"))
                .expect("Failed to create target directory");
                
            // Use rustc directly instead of cargo
            let status = Command::new("rustc")
                .current_dir(&self.script_path)
                .args(&["-o", binary_path.to_str().unwrap(), source_path.to_str().unwrap()])
                .status()
                .expect("Failed to build startup binary");
                
            if !status.success() {
                eprintln!("Error: Failed to build startup binary.");
                std::process::exit(1);
            }
        }
        
        // Get command line arguments (skip the first two: "doc-cli" and "startup")
        let mut args = Vec::new();
        let mut draft_version = None;
        
        // Check if draft version was provided
        if self.args.len() > 2 {
            let mut i = 2;
            while i < self.args.len() {
                if self.args[i] == "--draft-version" && i + 1 < self.args.len() {
                    draft_version = Some(self.args[i+1].clone());
                    // Skip both the flag and its value
                    i += 2;
                } else {
                    args.push(self.args[i].clone());
                    i += 1;
                }
            }
        }
        
        // Change to project root for environment setup
        if let Err(e) = env::set_current_dir(&self.project_root) {
            eprintln!("Failed to change to project root directory: {}", e);
            std::process::exit(1);
        }
        
        // Set up command with explicit interactive I/O handling
        let mut cmd = Command::new(&binary_path);
        
        // Add draft version if specified
        if let Some(version) = draft_version {
            cmd.args(&["--draft-version", &version]);
            println!("Using draft version: {}", version);
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
        let status = cmd.status()
            .expect("Failed to run startup binary");
            
        if !status.success() {
            eprintln!("Error: Startup script failed with exit code: {}", status);
            std::process::exit(status.code().unwrap_or(1));
        }
    }

    // Execute the bump-version functionality
    fn run_bump_version(&self) {
        println!("\n🔄 Running version bump script...\n");
        
        let binary_path = self.script_path.join("target/release/bump-version");
        let source_path = self.script_path.join("bump-version.rs");
        
        if !binary_path.exists() {
            println!("Bump version binary not found. Building it first...");
            
            // Ensure target directory exists
            std::fs::create_dir_all(self.script_path.join("target/release"))
                .expect("Failed to create target directory");
                
            // Use rustc directly instead of cargo
            let status = Command::new("rustc")
                .current_dir(&self.script_path)
                .args(&["-o", binary_path.to_str().unwrap(), source_path.to_str().unwrap()])
                .status()
                .expect("Failed to build bump-version binary");
                
            if !status.success() {
                eprintln!("Error: Failed to build bump-version binary.");
                std::process::exit(1);
            }
        }
        
        // Change to project root for git operations
        if let Err(e) = env::set_current_dir(&self.project_root) {
            eprintln!("Failed to change to project root directory: {}", e);
            std::process::exit(1);
        }
        
        // Configure interactive I/O
        let status = Command::new(&binary_path)
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()
            .expect("Failed to run bump-version binary");
            
        if !status.success() {
            eprintln!("Error: Bump version script failed with exit code: {}", status);
            std::process::exit(status.code().unwrap_or(1));
        }
    }

    // Execute the deploy-all-versions functionality
    fn run_deploy_all_versions(&self) {
        println!("\n🚀 Running deploy-all-versions script...\n");
        
        let binary_path = self.script_path.join("target/release/deploy-all-versions");
        let source_path = self.script_path.join("deploy-all-versions.rs");
        
        if !binary_path.exists() {
            println!("Deploy-all-versions binary not found. Building it first...");
            
            // Ensure target directory exists
            std::fs::create_dir_all(self.script_path.join("target/release"))
                .expect("Failed to create target directory");
                
            // Use rustc directly instead of cargo
            let status = Command::new("rustc")
                .current_dir(&self.script_path)
                .args(&["-o", binary_path.to_str().unwrap(), source_path.to_str().unwrap()])
                .status()
                .expect("Failed to build deploy-all-versions binary");
                
            if !status.success() {
                eprintln!("Error: Failed to build deploy-all-versions binary.");
                std::process::exit(1);
            }
        }
        
        // Get command line arguments (skip the first two: "doc-cli" and "deploy")
        let mut args = Vec::new();
        if self.args.len() > 2 {
            args.extend_from_slice(&self.args[2..]);
        }
        
        // Change to project root for git operations
        if let Err(e) = env::set_current_dir(&self.project_root) {
            eprintln!("Failed to change to project root directory: {}", e);
            std::process::exit(1);
        }
        
        // Set up command with explicit interactive I/O handling
        let mut cmd = Command::new(&binary_path);
        
        // Add any passed arguments
        if !args.is_empty() {
            cmd.args(&args);
        }
        
        // Explicitly inherit stdio for interactive use
        // This ensures prompts are shown and can be responded to
        cmd.stdin(Stdio::inherit())
           .stdout(Stdio::inherit())
           .stderr(Stdio::inherit());
        
        // Run the command and wait for completion
        let status = cmd.status()
            .expect("Failed to run deploy-all-versions binary");
            
        if !status.success() {
            eprintln!("Error: Deploy-all-versions script failed with exit code: {}", status);
            std::process::exit(status.code().unwrap_or(1));
        }
    }
}