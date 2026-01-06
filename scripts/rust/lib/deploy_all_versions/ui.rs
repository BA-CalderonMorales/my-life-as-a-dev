//! User interface for deployment selection.

use std::io::{self, Write};
use std::thread;
use std::time::Duration;

use super::colors::*;

/// Deployment mode selection UI.
pub struct DeploymentUI;

impl DeploymentUI {
    /// Prompt user to select deployment mode.
    /// Returns true for force deploy, false for smart deploy.
    pub fn select_mode() -> bool {
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

        print!("\n{}Please enter your choice [1/2]: {}", BLUE, NC);
        io::stdout().flush().ok();
        thread::sleep(Duration::from_millis(100));

        let mut choice = String::new();
        match io::stdin().read_line(&mut choice) {
            Ok(_) => match choice.trim() {
                "1" => {
                    println!("\n{}Smart deploy selected.{}\n", GREEN, NC);
                    false
                }
                "2" => {
                    println!("\n{}Force deploy selected.{}\n", YELLOW, NC);
                    true
                }
                _ => {
                    println!("{}Invalid choice. Defaulting to Smart Deploy.{}\n", RED, NC);
                    false
                }
            },
            Err(_) => {
                println!("{}Error reading input. Defaulting to Smart Deploy.{}\n", RED, NC);
                false
            }
        }
    }

    /// Show completion stats.
    pub fn show_stats(deployed: usize, skipped: usize, total: usize, latest: &str, force: bool) {
        println!("\n{}Deployment complete!{}", GREEN, NC);
        println!("{}Tags processed: {}{}", GREEN, total, NC);
        println!("{}  - Deployed: {}{}", GREEN, deployed, NC);

        if !force {
            println!("{}  - Skipped (already deployed): {}{}", GREEN, skipped, NC);
        }

        println!("{}'latest' is now pointing to: {}{}", GREEN, latest, NC);
        println!("\n{}Note: Use --force (-f) to redeploy all versions.{}", YELLOW, NC);
    }
}
