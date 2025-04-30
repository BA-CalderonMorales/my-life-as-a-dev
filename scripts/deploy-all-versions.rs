use std::env;
use std::io::{self, Write};
use std::process::Command;
use std::str;
use std::thread;
use std::time::Duration;

// ANSI color codes
const GREEN: &str = "\x1b[0;32m";
const YELLOW: &str = "\x1b[1;33m";
const BLUE: &str = "\x1b[0;34m";
const RED: &str = "\x1b[0;31m";
const NC: &str = "\x1b[0m"; // No Color

fn main() {
    let args: Vec<String> = env::args().collect();
    let mut force = false;
    let mut interactive = true;

    // Parse command line arguments
    for arg in &args[1..] {
        match arg.as_str() {
            "-f" | "--force" => {
                force = true;
                interactive = false;
            },
            "-n" | "--non-interactive" => {
                interactive = false;
            },
            _ => {
                eprintln!("{}Unknown option: {}{}", RED, arg, NC);
                eprintln!("Usage: deploy-all-versions [-f|--force] [-n|--non-interactive]");
                eprintln!("  -f, --force            Force deploy all versions (ignores existing deployments)");
                eprintln!("  -n, --non-interactive  Skip interactive prompts");
                std::process::exit(1);
            }
        }
    }
    
    // Always display the prompt selection before anything else
    if interactive {
        force = select_deployment_mode();
    }
    
    let deployer = Deployer::new(force);
    deployer.run();
}

// Prompt the user to choose between regular and force deployment
fn select_deployment_mode() -> bool {
    // Clear the terminal to make the prompt more visible
    println!("\n\n");
    println!("{}============================================================{}", BLUE, NC);
    println!("{}              DOCUMENTATION DEPLOYMENT SELECTION              {}", BLUE, NC);
    println!("{}============================================================{}", BLUE, NC);
    println!("\nPlease select one of the following deployment modes:");
    println!("\n{}1) Smart Deploy (Recommended){}", GREEN, NC);
    println!("   - Only deploy versions that aren't already in gh-pages branch");
    println!("   - Saves time and resources by skipping versions already deployed");
    println!("\n{}2) Force Deploy{}", YELLOW, NC);
    println!("   - Redeploy ALL versions regardless of existing state");
    println!("   - Takes longer but ensures consistency across all versions");
    
    // Ensure flush to make prompt immediately visible
    print!("\n{}Please enter your choice [1/2]: {}", BLUE, NC);
    io::stdout().flush().unwrap();
    
    // Small delay to ensure terminal has time to display the prompt
    thread::sleep(Duration::from_millis(100));
    
    // Read user input
    let mut choice = String::new();
    match io::stdin().read_line(&mut choice) {
        Ok(_) => {
            match choice.trim() {
                "1" => {
                    println!("\n{}Smart deploy selected. Only missing versions will be deployed.{}\n", GREEN, NC);
                    false
                },
                "2" => {
                    println!("\n{}Force deploy selected. All versions will be redeployed.{}\n", YELLOW, NC);
                    true
                },
                _ => {
                    println!("{}Invalid choice. Defaulting to Smart Deploy mode.{}\n", RED, NC);
                    false
                }
            }
        },
        Err(_) => {
            println!("{}Error reading input. Defaulting to Smart Deploy mode.{}\n", RED, NC);
            false
        }
    }
}

struct Deployer {
    force: bool,
    current_branch: String,
    main_tags: Vec<String>,
    deployed_versions: Vec<String>,
}

impl Deployer {
    fn new(force: bool) -> Self {
        let current_branch = Self::get_current_branch();
        
        Self {
            force,
            current_branch,
            main_tags: Vec::new(),
            deployed_versions: Vec::new(),
        }
    }
    
    fn run(&self) {
        self.fetch_tags_and_branch();
        
        // Get main branch tags
        let main_tags = self.get_tags_from_main();
        let mut deployer = Self {
            force: self.force,
            current_branch: self.current_branch.clone(),
            main_tags,
            deployed_versions: Vec::new(),
        };
        
        // Check for previously deployed versions if not forcing
        if !deployer.force {
            deployer.get_deployed_versions();
        }
        
        // Deploy versions
        let deployment_stats = deployer.deploy_versions();
        
        // If we have tags, set latest and push changes
        if !deployer.main_tags.is_empty() {
            deployer.set_latest_alias();
            deployer.push_gh_pages();
            deployer.show_completion_stats(deployment_stats);
        } else {
            println!("{}No tags found in main branch. Nothing to deploy.{}", RED, NC);
        }
    }
    
    fn fetch_tags_and_branch(&self) {
        println!("{}Fetching tags and gh-pages branch...{}", BLUE, NC);
        
        // Fetch all tags
        let status = Command::new("git")
            .args(["fetch", "--tags"])
            .status()
            .expect("Failed to fetch git tags");
            
        if !status.success() {
            eprintln!("{}Error: Failed to fetch git tags.{}", RED, NC);
        }
        
        // Fetch gh-pages branch
        let output = Command::new("git")
            .args(["fetch", "origin", "gh-pages:gh-pages"])
            .output()
            .expect("Failed to fetch gh-pages branch");
            
        if !output.status.success() {
            println!("{}Warning: gh-pages branch doesn't exist yet. It will be created.{}", YELLOW, NC);
        }
    }
    
    fn get_current_branch() -> String {
        let output = Command::new("git")
            .args(["rev-parse", "--abbrev-ref", "HEAD"])
            .output()
            .expect("Failed to get current branch");
            
        String::from_utf8_lossy(&output.stdout).trim().to_string()
    }
    
    fn get_tags_from_main(&self) -> Vec<String> {
        println!("{}Temporarily switching to main branch to get accurate tags...{}", BLUE, NC);
        
        // Switch to main branch
        let status = Command::new("git")
            .args(["checkout", "main"])
            .status()
            .expect("Failed to switch to main branch");
            
        if !status.success() {
            eprintln!("{}Error: Cannot switch to main branch. Make sure it exists.{}", RED, NC);
            std::process::exit(1);
        }
        
        // Get all tags from the main branch
        let output = Command::new("git")
            .args(["tag", "--sort=v:refname"])
            .output()
            .expect("Failed to get git tags");
            
        let tags: Vec<String> = String::from_utf8_lossy(&output.stdout)
            .split('\n')
            .filter(|s| !s.is_empty())
            .map(|s| s.to_string())
            .collect();
            
        println!("{}Found {} tags in main branch.{}", GREEN, tags.len(), NC);
        
        // Switch back to the original branch
        println!("{}Switching back to original branch ({})...{}", BLUE, self.current_branch, NC);
        let status = Command::new("git")
            .args(["checkout", &self.current_branch])
            .status()
            .expect("Failed to switch back to original branch");
            
        if !status.success() {
            eprintln!("{}Error: Failed to switch back to original branch.{}", RED, NC);
            std::process::exit(1);
        }
        
        tags
    }
    
    fn get_deployed_versions(&mut self) {
        if self.force {
            return;
        }
        
        // Check if gh-pages branch exists
        let output = Command::new("git")
            .args(["rev-parse", "--verify", "gh-pages"])
            .output()
            .expect("Failed to verify gh-pages branch");
            
        if !output.status.success() {
            println!("{}No gh-pages branch found. Will deploy all versions.{}", YELLOW, NC);
            return;
        }
        
        // Let's try a different approach to get deployed versions
        // Instead of parsing the JSON file, we'll check the directories directly
        // since mike creates a directory for each version
        println!("{}Checking for deployed versions in gh-pages branch...{}", BLUE, NC);
        
        // First, get a list of directories in the gh-pages branch root
        let output = Command::new("git")
            .args(["ls-tree", "--name-only", "gh-pages"])
            .output()
            .expect("Failed to list directories in gh-pages branch");
            
        if !output.status.success() {
            println!("{}Failed to list contents of gh-pages branch. Will deploy all versions.{}", YELLOW, NC);
            return;
        }
        
        let dirs = String::from_utf8_lossy(&output.stdout);
        let mut detected_versions: Vec<String> = Vec::new();
        
        // Each version has its own directory in the gh-pages branch
        // We're looking for directories that match our tag names (e.g., v0.1.5)
        for line in dirs.lines() {
            let entry = line.trim();
            // Check if this entry looks like a version (starts with v and has digits)
            if entry.starts_with('v') && entry.chars().skip(1).any(|c| c.is_digit(10)) {
                detected_versions.push(entry.to_string());
            }
        }
        
        // Also check if we can find versions in the versions.json file as backup
        let json_versions = self.get_versions_from_json();
        
        // Combine both methods
        self.deployed_versions = detected_versions;
        for version in json_versions {
            if !self.deployed_versions.contains(&version) {
                self.deployed_versions.push(version);
            }
        }
        
        if !self.deployed_versions.is_empty() {
            println!("{}Found {} already deployed versions:{}", GREEN, self.deployed_versions.len(), NC);
            for version in &self.deployed_versions {
                println!("  {}", version);
            }
        } else {
            println!("{}No previously deployed versions detected. Will deploy all versions.{}", YELLOW, NC);
        }
    }
    
    // New method to get versions from versions.json as a backup strategy
    fn get_versions_from_json(&self) -> Vec<String> {
        // Get versions.json file from gh-pages branch
        let output = Command::new("git")
            .args(["show", "gh-pages:versions.json"])
            .output();
            
        match output {
            Ok(output) => {
                if output.status.success() {
                    let json_content = String::from_utf8_lossy(&output.stdout);
                    Self::parse_versions_json(&json_content)
                } else {
                    Vec::new()
                }
            },
            Err(_) => Vec::new()
        }
    }
    
    fn parse_versions_json(json_content: &str) -> Vec<String> {
        let mut versions = Vec::new();
        
        // Improved JSON parsing - look for any format that might contain version info
        for line in json_content.lines() {
            // Look for version patterns in the JSON
            for pattern in &[r#""version":"#, r#"{"version":"#, r#""name":"#, r#""id":"#] {
                if let Some(pos) = line.find(pattern) {
                    let start = pos + pattern.len();
                    if let Some(end) = line[start..].find('"') {
                        let version = line[start..(start + end)].trim();
                        // Only accept versions that look like v0.1.2 format
                        if version.starts_with('v') || version.chars().next().unwrap_or('x').is_digit(10) {
                            versions.push(version.to_string());
                        }
                    }
                }
            }
        }
        
        versions
    }
    
    fn deploy_versions(&self) -> (usize, usize) {
        println!("{}Deploying versions to gh-pages branch...{}", BLUE, NC);
        
        if self.force {
            println!("{}Force mode enabled. All versions will be deployed regardless of existing state.{}", YELLOW, NC);
        } else if self.deployed_versions.is_empty() {
            println!("{}No previously deployed versions found.{}", YELLOW, NC);
        }
        
        let mut deployed_count = 0;
        let mut skipped_count = 0;
        
        for tag in &self.main_tags {
            // Check if this version is already deployed and we're not forcing
            if !self.force && self.deployed_versions.contains(tag) {
                println!("{}Skipping version {} (already deployed){}", YELLOW, tag, NC);
                skipped_count += 1;
                continue;
            }
            
            println!("{}Deploying version: {}{}", BLUE, tag, NC);
            
            let status = Command::new("mike")
                .args(["deploy", tag, "--branch", "gh-pages"])
                .status()
                .expect("Failed to deploy version with mike");
                
            if status.success() {
                deployed_count += 1;
            } else {
                eprintln!("{}Error: Failed to deploy version {}.{}", RED, tag, NC);
            }
        }
        
        (deployed_count, skipped_count)
    }
    
    fn set_latest_alias(&self) {
        if self.main_tags.is_empty() {
            return;
        }
        
        let latest_tag = &self.main_tags[self.main_tags.len() - 1];
        println!("\n{}Setting 'latest' alias to: {}{}", BLUE, latest_tag, NC);
        
        // Set the tag as latest
        let status = Command::new("mike")
            .args(["deploy", latest_tag, "latest", "--branch", "gh-pages", "--update-aliases"])
            .status()
            .expect("Failed to set latest alias");
            
        if !status.success() {
            eprintln!("{}Error: Failed to set {} as latest.{}", RED, latest_tag, NC);
            return;
        }
        
        // Set default to latest
        let status = Command::new("mike")
            .args(["set-default", "latest", "--branch", "gh-pages"])
            .status()
            .expect("Failed to set default version");
            
        if !status.success() {
            eprintln!("{}Error: Failed to set default version.{}", RED, NC);
        }
    }
    
    fn push_gh_pages(&self) {
        println!("{}Pushing gh-pages branch to origin...{}", BLUE, NC);
        
        let status = Command::new("git")
            .args(["push", "origin", "gh-pages"])
            .status()
            .expect("Failed to push gh-pages branch");
            
        if !status.success() {
            eprintln!("{}Error: Failed to push gh-pages branch.{}", RED, NC);
        }
    }
    
    fn show_completion_stats(&self, stats: (usize, usize)) {
        let (deployed_count, skipped_count) = stats;
        let total_tags = self.main_tags.len();
        
        // Fix for the temporary value issue
        let none_string = String::from("none");
        let latest_tag = self.main_tags.last().unwrap_or(&none_string);
        
        println!("\n{}Deployment complete!{}", GREEN, NC);
        println!("{}Tags processed: {}{}", GREEN, total_tags, NC);
        println!("{}  - Deployed: {}{}", GREEN, deployed_count, NC);
        
        if !self.force {
            println!("{}  - Skipped (already deployed): {}{}", GREEN, skipped_count, NC);
        }
        
        println!("{}\'latest\' is now pointing to: {}{}", GREEN, latest_tag, NC);
        println!("\n{}Note: You can use the --force (-f) option to redeploy all versions.{}", YELLOW, NC);
    }
}