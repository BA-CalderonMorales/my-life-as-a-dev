use std::io::{self, Write};
use std::process::Command;

// ANSI color codes
const GREEN: &str = "\x1b[0;32m";
const YELLOW: &str = "\x1b[1;33m";
const BLUE: &str = "\x1b[0;34m";
const NC: &str = "\x1b[0m"; // No Color

fn main() {
    let version_bumper = VersionBumper::new();
    version_bumper.run();
}

struct VersionBumper {
    current_version: String,
    major: u32,
    minor: u32,
    patch: u32,
}

impl VersionBumper {
    fn new() -> Self {
        let current_version = Self::get_latest_tag();
        let (major, minor, patch) = Self::parse_version(&current_version);
        
        Self {
            current_version,
            major,
            minor,
            patch,
        }
    }
    
    fn run(&self) {
        println!("{}MkDocs Version Bumper{}", BLUE, NC);
        println!("==============================");
        
        println!("{}Current version:{} {}", YELLOW, NC, self.current_version);
        
        // Get bump type from user
        let bump_type = self.prompt_bump_type();
        
        // Calculate new version
        let new_version = self.calculate_new_version(bump_type);
        println!("{}New version will be:{} {}", YELLOW, NC, new_version);
        
        // Confirm with user
        if !self.confirm_version() {
            println!("Version bump canceled.");
            return;
        }
        
        // Create and push git tag
        self.create_git_tag(&new_version);
        
        // Ask about deployment
        let deploy_choice = self.prompt_deployment();
        self.handle_deployment(&new_version, deploy_choice);
        
        println!("{}Version bump to {} complete!{}", GREEN, new_version, NC);
        
        if deploy_choice == 3 {
            println!("{}Note:{} You can deploy this version later using:", YELLOW, NC);
            println!("  {}doc-cli deploy{} (to deploy all versions)", BLUE, NC);
            println!("  or");
            println!("  {}mike deploy v{} --branch gh-pages --push{} (to deploy just this version)", BLUE, new_version, NC);
        }
    }
    
    fn get_latest_tag() -> String {
        // Get the latest tag from git or use 0.0.0 if none exists
        let output = Command::new("git")
            .args(&["describe", "--tags", "--abbrev=0"])
            .output();
            
        match output {
            Ok(output) => {
                if output.status.success() {
                    let tag = String::from_utf8_lossy(&output.stdout).trim().to_string();
                    // Remove 'v' prefix if present
                    if tag.starts_with('v') {
                        tag[1..].to_string()
                    } else {
                        tag
                    }
                } else {
                    "0.0.0".to_string()
                }
            },
            Err(_) => "0.0.0".to_string()
        }
    }
    
    fn parse_version(version: &str) -> (u32, u32, u32) {
        let parts: Vec<&str> = version.split('.').collect();
        
        let major = parts.get(0).and_then(|s| s.parse().ok()).unwrap_or(0);
        let minor = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        let patch = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(0);
        
        (major, minor, patch)
    }
    
    fn prompt_bump_type(&self) -> u8 {
        println!("What kind of version bump do you want to make?");
        println!("1) Major ({}.0.0)", self.major + 1);
        println!("2) Minor ({}.{}.0)", self.major, self.minor + 1);
        println!("3) Patch ({}.{}.{})", self.major, self.minor, self.patch + 1);
        
        loop {
            print!("Enter choice [1-3]: ");
            io::stdout().flush().unwrap();
            
            let mut choice = String::new();
            io::stdin().read_line(&mut choice).expect("Failed to read input");
            
            match choice.trim() {
                "1" | "2" | "3" => return choice.trim().parse().unwrap(),
                _ => println!("Invalid option. Please enter 1, 2, or 3.")
            }
        }
    }
    
    fn calculate_new_version(&self, bump_type: u8) -> String {
        match bump_type {
            1 => format!("{}.0.0", self.major + 1),
            2 => format!("{}.{}.0", self.major, self.minor + 1),
            3 => format!("{}.{}.{}", self.major, self.minor, self.patch + 1),
            _ => panic!("Invalid bump type")
        }
    }
    
    fn confirm_version(&self) -> bool {
        print!("Proceed with this version? (y/n): ");
        io::stdout().flush().unwrap();
        
        let mut confirm = String::new();
        io::stdin().read_line(&mut confirm).expect("Failed to read input");
        
        confirm.trim().eq_ignore_ascii_case("y")
    }
    
    fn create_git_tag(&self, new_version: &str) {
        println!("Creating new Git tag v{}...", new_version);
        
        let tag_name = format!("v{}", new_version);
        let tag_message = format!("Version {}", new_version);
        
        let status = Command::new("git")
            .args(&["tag", "-a", &tag_name, "-m", &tag_message])
            .status()
            .expect("Failed to create git tag");
            
        if !status.success() {
            eprintln!("Error: Failed to create git tag.");
            std::process::exit(1);
        }
        
        println!("Pushing tag to remote...");
        
        let status = Command::new("git")
            .args(&["push", "origin", &tag_name])
            .status()
            .expect("Failed to push git tag");
            
        if !status.success() {
            eprintln!("Error: Failed to push git tag to remote.");
            std::process::exit(1);
        }
    }
    
    fn prompt_deployment(&self) -> u8 {
        println!("\n{}Do you want to deploy this version to gh-pages with mike?{}", YELLOW, NC);
        println!("1) Yes, deploy as a regular version");
        println!("2) Yes, deploy as a regular version AND set as 'latest'");
        println!("3) No, skip deployment");
        
        loop {
            print!("Enter choice [1-3]: ");
            io::stdout().flush().unwrap();
            
            let mut choice = String::new();
            io::stdin().read_line(&mut choice).expect("Failed to read input");
            
            match choice.trim() {
                "1" | "2" | "3" => return choice.trim().parse().unwrap(),
                _ => println!("Invalid option. Please enter 1, 2, or 3.")
            }
        }
    }
    
    fn handle_deployment(&self, new_version: &str, deploy_choice: u8) {
        let tag_name = format!("v{}", new_version);
        
        match deploy_choice {
            1 => {
                println!("{}Deploying {} to gh-pages...{}", BLUE, tag_name, NC);
                
                let status = Command::new("mike")
                    .args(&["deploy", &tag_name, "--branch", "gh-pages", "--push"])
                    .status()
                    .expect("Failed to deploy with mike");
                    
                if status.success() {
                    println!("{}Deployment complete!{}", GREEN, NC);
                } else {
                    eprintln!("Error: Failed to deploy version.");
                }
            },
            2 => {
                println!("{}Deploying {} to gh-pages and setting as 'latest'...{}", BLUE, tag_name, NC);
                
                // First deploy the version
                let status = Command::new("mike")
                    .args(&["deploy", &tag_name, "--branch", "gh-pages"])
                    .status()
                    .expect("Failed to deploy with mike");
                    
                if !status.success() {
                    eprintln!("Error: Failed to deploy version.");
                    return;
                }
                
                // Then set it as latest
                let status = Command::new("mike")
                    .args(&["deploy", &tag_name, "latest", "--branch", "gh-pages", "--update-aliases"])
                    .status()
                    .expect("Failed to set as latest");
                    
                if !status.success() {
                    eprintln!("Error: Failed to set version as latest.");
                    return;
                }
                
                // Set default to latest
                let status = Command::new("mike")
                    .args(&["set-default", "latest", "--branch", "gh-pages"])
                    .status()
                    .expect("Failed to set default version");
                    
                if !status.success() {
                    eprintln!("Error: Failed to set default version.");
                    return;
                }
                
                // Push changes
                let status = Command::new("git")
                    .args(&["push", "origin", "gh-pages"])
                    .status()
                    .expect("Failed to push changes");
                    
                if status.success() {
                    println!("{}Deployment complete and set as 'latest'!{}", GREEN, NC);
                } else {
                    eprintln!("Error: Failed to push gh-pages branch.");
                }
            },
            3 => println!("Skipping deployment to gh-pages."),
            _ => println!("Invalid option. Skipping deployment.")
        }
    }
}