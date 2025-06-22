//! Module for handling version bumping functionality

use std::io::{self, Write, stdin};
use std::process::Command;

// Constants for colored outputs
pub const GREEN: &str = "\x1b[0;32m";
pub const YELLOW: &str = "\x1b[1;33m";
pub const BLUE: &str = "\x1b[0;34m";
pub const RED: &str = "\x1b[0;31m";
pub const NC: &str = "\x1b[0m"; // No Color

/// Main entry point for version bumping
#[allow(dead_code)]
pub fn main() {

    let bumper = VersionBumper::new();
    bumper.run();

}

pub struct VersionBumper {

    current_version: String,
    major: u32,
    minor: u32,
    patch: u32,

}

impl VersionBumper {

    /// Creates a new VersionBumper instance
    pub fn new() -> Self {

        let current_version = Self::get_latest_tag();
        let (major, minor, patch) = Self::parse_version(&current_version);
        
        Self {
            current_version,
            major,
            minor,
            patch,
        }

    }
    
    /// Runs the version bumping process
    pub fn run(&self) {

        println!("{}MkDocs Version Bumper{}", BLUE, NC);
        println!("==============================");
        println!("{}Current version:{} {}", YELLOW, NC, self.current_version);
        
        // Get bump type from user
        let bump_type = self.prompt_bump_type();
        
        let new_version = self.calculate_new_version(bump_type);
        println!("{}New version will be:{} {}", YELLOW, NC, new_version);
        
        // Confirm with user
        if !self.confirm_version() {

            println!("Version bump canceled.");
            return;

        }
        
        // Create and push git tag
        self.create_git_tag(&new_version);
        
        println!("\n{}Version bump to {} complete!{}", GREEN, new_version, NC);
        println!("\n{}To deploy this version, run:{} doc-cli deploy", YELLOW, NC);
        println!("This will perform a smart deploy, only deploying versions that aren't already deployed.");
        println!("\nOr to deploy just this version: mike deploy v{} --branch gh-pages --push", new_version);
        
    }

    // Remaining public methods...
    
    pub fn get_latest_tag() -> String {

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
    
    pub fn parse_version(version: &str) -> (u32, u32, u32) {
        let parts: Vec<&str> = version.split('.').collect();
        
        let major = parts.get(0).and_then(|s| s.parse().ok()).unwrap_or(0);
        let minor = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        let patch = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(0);
        
        (major, minor, patch)
    }
    
    pub fn prompt_bump_type(&self) -> u8 {
        println!("\n{}What kind of version bump do you want to make?{}", YELLOW, NC);
        println!("{}1){} Major ({}.0.0)", BLUE, NC, self.major + 1);
        println!("{}2){} Minor ({}.{}.0)", BLUE, NC, self.major, self.minor + 1);
        println!("{}3){} Patch ({}.{}.{})", BLUE, NC, self.major, self.minor, self.patch + 1);
        
        let stdin = stdin();
        
        loop {
            print!("{}Enter choice [1-3]: {}", YELLOW, NC);
            if let Err(e) = io::stdout().flush() {
                eprintln!("{}Error: {}{}", RED, e, NC);
                continue;
            }
            
            let mut input = String::new();
            if let Err(e) = stdin.read_line(&mut input) {
                eprintln!("\n{}Error reading input: {}{}", RED, e, NC);
                continue;
            }
            
            match input.trim() {
                "1" | "2" | "3" => return input.trim().parse().unwrap(),
                _ => println!("\n{}Invalid option. Please enter 1, 2, or 3.{}", YELLOW, NC)
            }
        }
    }
    
    pub fn calculate_new_version(&self, bump_type: u8) -> String {
        match bump_type {
            1 => format!("{}.0.0", self.major + 1),
            2 => format!("{}.{}.0", self.major, self.minor + 1),
            3 => format!("{}.{}.{}", self.major, self.minor, self.patch + 1),
            _ => panic!("Invalid bump type")
        }
    }
    
    pub fn confirm_version(&self) -> bool {
        print!("Proceed with this version? (y/n): ");
        io::stdout().flush().unwrap();
        
        let mut confirm = String::new();
        io::stdin().read_line(&mut confirm).expect("Failed to read input");
        
        confirm.trim().eq_ignore_ascii_case("y")
    }
    
    pub fn create_git_tag(&self, new_version: &str) {
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
    
    // Deployment functionality has been moved to deploy_all_versions module
    // Please use `doc-cli deploy` to deploy versions
}