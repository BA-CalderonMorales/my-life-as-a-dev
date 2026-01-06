//! Version detection from gh-pages.

use std::process::Command;

use super::colors::*;

/// Manages version detection from deployed gh-pages.
pub struct Versions;

impl Versions {
    /// Get list of already deployed versions.
    pub fn get_deployed() -> Vec<String> {
        // Check if gh-pages exists
        let output = Command::new("git")
            .args(["rev-parse", "--verify", "gh-pages"])
            .output()
            .expect("Failed to verify gh-pages");

        if !output.status.success() {
            println!("{}No gh-pages branch found. Will deploy all versions.{}", YELLOW, NC);
            return Vec::new();
        }

        println!("{}Checking for deployed versions in gh-pages branch...{}", BLUE, NC);

        // Get directories from gh-pages
        let output = Command::new("git")
            .args(["ls-tree", "--name-only", "gh-pages"])
            .output()
            .expect("Failed to list gh-pages contents");

        if !output.status.success() {
            println!("{}Failed to list gh-pages contents. Will deploy all versions.{}", YELLOW, NC);
            return Vec::new();
        }

        let mut versions: Vec<String> = String::from_utf8_lossy(&output.stdout)
            .lines()
            .filter(|entry| {
                let e = entry.trim();
                e.starts_with('v') && e.chars().skip(1).any(|c| c.is_ascii_digit())
            })
            .map(|s| s.to_string())
            .collect();

        // Also check versions.json as backup
        let json_versions = Self::get_from_json();
        for v in json_versions {
            if !versions.contains(&v) {
                versions.push(v);
            }
        }

        if !versions.is_empty() {
            println!("{}Found {} already deployed versions:{}", GREEN, versions.len(), NC);
            for v in &versions {
                println!("  {}", v);
            }
        } else {
            println!("{}No previously deployed versions detected.{}", YELLOW, NC);
        }

        versions
    }

    fn get_from_json() -> Vec<String> {
        let output = Command::new("git")
            .args(["show", "gh-pages:versions.json"])
            .output();

        match output {
            Ok(output) if output.status.success() => {
                Self::parse_versions_json(&String::from_utf8_lossy(&output.stdout))
            }
            _ => Vec::new(),
        }
    }

    fn parse_versions_json(content: &str) -> Vec<String> {
        let mut versions = Vec::new();

        for line in content.lines() {
            for pattern in &[r#""version":"#, r#""name":"#, r#""id":"#] {
                if let Some(pos) = line.find(pattern) {
                    let start = pos + pattern.len();
                    if let Some(end) = line[start..].find('"') {
                        let version = line[start..(start + end)].trim();
                        if version.starts_with('v') || version.chars().next().map_or(false, |c| c.is_ascii_digit()) {
                            versions.push(version.to_string());
                        }
                    }
                }
            }
        }

        versions
    }
}
