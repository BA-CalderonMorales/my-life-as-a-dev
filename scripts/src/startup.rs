use std::env;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

// Main entry point
fn main() {
    // Parse command line arguments
    let args: Vec<String> = env::args().collect();
    let mut draft_version = None;
    
    // Check for --draft-version argument
    for i in 1..args.len() {
        if args[i] == "--draft-version" && i + 1 < args.len() {
            draft_version = Some(args[i + 1].clone());
            break;
        }
    }
    
    let startup = Startup::new(draft_version);
    startup.run();
}

// Startup struct to encapsulate the functionality
struct Startup {
    project_root: PathBuf,
    draft_version: Option<String>,
}

impl Startup {
    // Create a new Startup instance
    fn new(draft_version: Option<String>) -> Self {
        // Get the project root directory (current directory, since we're running from project root)
        let current_dir = env::current_dir().expect("Failed to get current directory");
        let project_root = if current_dir.ends_with("scripts") {
            current_dir.parent().unwrap().to_path_buf()
        } else {
            current_dir
        };
        println!("Debug - Project root: {}", project_root.display());
        
        Self { project_root, draft_version }
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
        
        // Debug: Print the actual path being used
        println!("Debug - Requirements path: {}", requirements_path.display());
        
        // Verify the file exists before attempting to install
        if !Path::new(&requirements_path).exists() {
            eprintln!("Error: Requirements file not found at {}", requirements_path.display());
            eprintln!("Current directory: {:?}", env::current_dir().unwrap_or_default());
            std::process::exit(1);
        }
        
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
        
        // Install the project in development mode to ensure plugins are available
        println!("Installing project in development mode...");
        let status = Command::new("pip")
            .args(&["install", "-e", "."])
            .current_dir(&self.project_root)
            .status()
            .expect("Failed to execute pip install -e .");
            
        if !status.success() {
            eprintln!("Error: Failed to install project in development mode.");
            std::process::exit(1);
        }
        
        println!("Project installed in development mode.");
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
        println!("Starting documentation server...");
        
        // Change to the project root directory where mkdocs.yml is located
        if let Err(e) = env::set_current_dir(&self.project_root) {
            eprintln!("Failed to change to project root directory: {}", e);
            std::process::exit(1);
        }
        
        // Verify that the custom plugin is available
        println!("Verifying plugin installation...");
        let verify_cmd = Command::new("python")
            .arg("-c")
            .arg("import sys; import mkdocs_plugins; print(f'Plugin module found at: {mkdocs_plugins.__file__}')")
            .status();
            
        match verify_cmd {
            Ok(status) if status.success() => println!("Plugin module verification successful."),
            _ => println!("Warning: Plugin module verification failed. This may cause issues with custom plugins.")
        }
        
        // Check if mike is available for versioning by trying to import it
        let mike_available = Command::new("python")
            .arg("-c")
            .arg("import mike; print('mike available')")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .is_ok();
        
        if mike_available {
            println!("Mike is available, but using standard MkDocs serve for simplicity");
        }
        
        // Determine the serve command based on availability and draft version
        let cmd_str = if let Some(version) = &self.draft_version {
            println!("Using draft version: {} (not yet deployed)", version);
            
            // Build the site first with mkdocs
            println!("Building draft documentation for version {}...", version);
            let build_status = Command::new("python")
                .args(&["-m", "mkdocs", "build", "--clean"])
                .status()
                .expect("Failed to build site with mkdocs");
                
            if !build_status.success() {
                eprintln!("Error: Failed to build site with mkdocs.");
                std::process::exit(1);
            }
            
            // For draft versions, serve the built site directly
            println!("Serving draft version using Python HTTP server...");
            "cd site && python -m http.server 8000 --bind 0.0.0.0".to_string()
        } else {
            println!("Using standard MkDocs serve");
            "PYTHONPATH=$PYTHONPATH:$(pwd) python -m mkdocs serve --dev-addr=0.0.0.0:8000".to_string()
        };
        
        println!("Executing: {}", cmd_str);
        
        let status = Command::new("sh")
            .arg("-c")
            .arg(&cmd_str)
            .status()
            .expect("Failed to start documentation server");
            
        if !status.success() {
            eprintln!("Error: Failed to start documentation server.");
            std::process::exit(1);
        }
    }

    // Show completion message
    fn show_completion_message(&self) {
        println!("==== Setup complete! ====");
        println!("Your versioned documentation is now available at http://localhost:8000");
        println!("You can start editing the files in the 'docs/' directory.");
        println!("Changes will be reflected automatically on the development server.");
    }
}