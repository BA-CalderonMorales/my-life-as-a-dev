use std::env;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

// Main entry point
fn main() {
    let startup = Startup::new();
    startup.run();
}

// Startup struct to encapsulate the functionality
struct Startup {
    project_root: PathBuf,
}

impl Startup {
    // Create a new Startup instance
    fn new() -> Self {
        // Get the project root directory (parent of scripts directory)
        let current_dir = env::current_dir().expect("Failed to get current directory");
        let project_root = current_dir.parent().unwrap_or(&current_dir).to_path_buf();
        
        Self { project_root }
    }

    // Main execution method
    fn run(&self) {
        println!("==== Starting setup for my-life-as-a-dev project ====");

        // Only run in Codespaces environment
        if !self.is_codespaces_environment() {
            self.show_local_dev_instructions();
            return;
        }
        
        println!("GitHub Codespaces environment detected! Setting up development environment...");
        
        self.install_dependencies();
        self.check_port_and_kill_if_needed();
        self.start_documentation_server();
        
        self.show_completion_message();
    }

    // Check if we're in GitHub Codespaces
    fn is_codespaces_environment(&self) -> bool {
        env::var("CODESPACES").is_ok()
    }

    // Show instructions for local development
    fn show_local_dev_instructions(&self) {
        println!("This script is optimized for GitHub Codespaces.");
        println!("For local development, please follow the instructions in the README:");
        println!("https://github.com/BA-CalderonMorales/my-life-as-a-dev#local-development");
    }

    // Install dependencies from requirements.txt
    fn install_dependencies(&self) {
        let requirements_path = self.project_root.join("requirements.txt");
        
        println!("Installing dependencies from {}...", requirements_path.display());
        let status = Command::new("python")
            .args(&["-m", "pip", "install", "-r"])
            .arg(&requirements_path)
            .status()
            .expect("Failed to execute pip install command");

        if !status.success() {
            eprintln!("Error: Failed to install dependencies.");
            std::process::exit(1);
        }
        
        println!("Dependencies installed successfully.");
    }

    // Check if port 8000 is in use and offer to kill the process
    fn check_port_and_kill_if_needed(&self) {
        // Check if port 8000 is in use
        let check_port = Command::new("lsof")
            .args(&["-Pi", ":8000", "-sTCP:LISTEN", "-t"])
            .stdout(Stdio::null())
            .status()
            .expect("Failed to execute lsof command");

        if !check_port.success() {
            println!("Port 8000 is available.");
            return;
        }
        
        println!("Port 8000 is already in use.");
        
        // Show what process is using the port
        println!("Process using port 8000:");
        let _ = Command::new("lsof")
            .args(&["-Pi", ":8000", "-sTCP:LISTEN"])
            .status()
            .expect("Failed to execute lsof command");
        
        // Ask if user wants to kill the process
        print!("Do you want to kill this process? (y/n): ");
        io::stdout().flush().unwrap();
        
        let mut answer = String::new();
        io::stdin().read_line(&mut answer).expect("Failed to read input");
        
        if answer.trim().to_lowercase() == "y" {
            self.kill_process_on_port(8000);
        } else {
            println!("Port 8000 is still in use. MkDocs server may fail to start.");
        }
    }

    // Kill the process using the specified port
    fn kill_process_on_port(&self, port: u16) {
        println!("Terminating process on port {}...", port);
        
        // Get PID and kill it
        let output = Command::new("lsof")
            .args(&[&format!("-ti:{}", port)])
            .output()
            .expect("Failed to get process ID");
        
        if output.stdout.is_empty() {
            println!("No process found on port {}", port);
            return;
        }

        let pid = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let status = Command::new("kill")
            .args(&["-9", &pid])
            .status()
            .expect("Failed to terminate process");
            
        if status.success() {
            println!("Process terminated successfully.");
        } else {
            println!("Failed to terminate process. You may need to kill it manually.");
        }
    }

    // Start the MkDocs development server
    fn start_documentation_server(&self) {
        println!("Starting versioned documentation server via Mike...");
        
        // Change to the project root directory where mkdocs.yml is located
        if let Err(e) = env::set_current_dir(&self.project_root) {
            eprintln!("Failed to change to project root directory: {}", e);
            std::process::exit(1);
        }
        
        self.set_up_mike();
        
        // Serve all deployed versions locally at root
        println!("Serving all versions on gh-pages branch at http://localhost:8000");
        
        // Using system to execute in background with &
        let status = Command::new("sh")
            .arg("-c")
            .arg("mike serve --dev-addr=0.0.0.0:8000 --branch gh-pages &")
            .status()
            .expect("Failed to start mike serve");
            
        if !status.success() {
            eprintln!("Error: Failed to start mike serve.");
            std::process::exit(1);
        }
    }

    // Set up mike versioning
    fn set_up_mike(&self) {
        // Ensure the gh-pages branch is fetched locally
        let _ = Command::new("git")
            .args(&["fetch", "origin", "gh-pages", "--depth=1"])
            .status()
            .expect("Failed to fetch gh-pages branch");
        
        // Ensure a 'latest' alias exists (point to latest tag)
        let _ = Command::new("mike")
            .args(&["alias", "latest", "latest", "-b", "gh-pages", "-r", "origin"])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status();
        
        // Set default version alias to 'latest' on gh-pages branch (with remote)
        let _ = Command::new("mike")
            .args(&["set-default", "latest", "--branch", "gh-pages", "--remote", "origin"])
            .status()
            .expect("Failed to set default mike version");
    }

    // Show completion message
    fn show_completion_message(&self) {
        println!("==== Setup complete! ====");
        println!("Your versioned documentation is now available at http://localhost:8000");
        println!("You can start editing the files in the 'docs/' directory.");
        println!("Changes will be reflected automatically on the development server.");
    }
}