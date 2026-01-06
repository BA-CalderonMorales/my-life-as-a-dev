//! Git operations for deployment.

use std::process::Command;

use super::colors::*;

/// Git operations for version deployment.
pub struct Git;

impl Git {
    /// Get the current branch name.
    pub fn current_branch() -> String {
        let output = Command::new("git")
            .args(["rev-parse", "--abbrev-ref", "HEAD"])
            .output()
            .expect("Failed to get current branch");

        String::from_utf8_lossy(&output.stdout).trim().to_string()
    }

    /// Fetch tags and gh-pages branch.
    pub fn fetch_tags_and_branch() {
        println!("{}Fetching tags and gh-pages branch...{}", BLUE, NC);

        let status = Command::new("git")
            .args(["fetch", "--tags"])
            .status()
            .expect("Failed to fetch git tags");

        if !status.success() {
            eprintln!("{}Error: Failed to fetch git tags.{}", RED, NC);
        }

        let output = Command::new("git")
            .args(["fetch", "origin", "gh-pages:gh-pages"])
            .output()
            .expect("Failed to fetch gh-pages branch");

        if !output.status.success() {
            println!("{}Warning: gh-pages branch doesn't exist yet. It will be created.{}", YELLOW, NC);
        }
    }

    /// Get all tags from main branch.
    pub fn get_tags_from_main(current_branch: &str) -> Vec<String> {
        println!("{}Temporarily switching to main branch to get accurate tags...{}", BLUE, NC);

        // Switch to main
        let status = Command::new("git")
            .args(["checkout", "main"])
            .status()
            .expect("Failed to switch to main branch");

        if !status.success() {
            eprintln!("{}Error: Cannot switch to main branch.{}", RED, NC);
            std::process::exit(1);
        }

        // Get tags
        let output = Command::new("git")
            .args(["tag", "--sort=v:refname"])
            .output()
            .expect("Failed to get git tags");

        let tags: Vec<String> = String::from_utf8_lossy(&output.stdout)
            .lines()
            .filter(|s| !s.is_empty())
            .map(|s| s.to_string())
            .collect();

        println!("{}Found {} tags in main branch.{}", GREEN, tags.len(), NC);

        // Switch back
        println!("{}Switching back to original branch ({})...{}", BLUE, current_branch, NC);
        let status = Command::new("git")
            .args(["checkout", current_branch])
            .status()
            .expect("Failed to switch back");

        if !status.success() {
            eprintln!("{}Error: Failed to switch back to original branch.{}", RED, NC);
            std::process::exit(1);
        }

        tags
    }
}
