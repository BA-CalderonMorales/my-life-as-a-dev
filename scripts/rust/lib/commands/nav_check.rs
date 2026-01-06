//! NavCheck Command - Check for pages not in navigation
//!
//! This command scans the docs/ directory for markdown files and compares
//! them against the navigation structure in zensical.toml to find orphaned pages.

use std::fs;
use std::io;
use std::path::PathBuf;

use super::{Command, CommandContext};

/// Command to check for pages not in navigation
pub struct NavCheckCommand {
    project_root: PathBuf,
}

impl NavCheckCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
        }
    }

    /// Collect all markdown files recursively
    fn collect_md_files(dir: &PathBuf, base: &PathBuf) -> Vec<String> {
        let mut files = Vec::new();
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    // Skip overrides and assets directories
                    let dir_name = path.file_name().unwrap_or_default().to_string_lossy();
                    if dir_name != "overrides" && dir_name != "assets" && dir_name != ".icons" {
                        files.extend(Self::collect_md_files(&path, base));
                    }
                } else if path.extension().map_or(false, |e| e == "md") {
                    if let Ok(rel_path) = path.strip_prefix(base) {
                        files.push(rel_path.to_string_lossy().to_string());
                    }
                }
            }
        }
        files
    }

    /// Extract file paths from navigation in TOML content
    fn extract_nav_files(content: &str) -> Vec<String> {
        let mut files = Vec::new();
        // Simple extraction - look for .md files in quotes
        for line in content.lines() {
            let line = line.trim();
            // Look for patterns like: "path/to/file.md"
            if line.contains(".md") {
                // Extract the path between quotes
                if let Some(start) = line.find('"') {
                    if let Some(end) = line.rfind('"') {
                        if end > start {
                            let path = &line[start + 1..end];
                            if path.ends_with(".md") {
                                files.push(path.to_string());
                            }
                        }
                    }
                }
            }
        }
        files
    }
}

impl Command for NavCheckCommand {
    fn name(&self) -> &'static str {
        "nav-check"
    }

    fn description(&self) -> &'static str {
        "Check for pages not in navigation"
    }

    fn aliases(&self) -> Vec<&'static str> {
        vec!["nav_check"]
    }

    fn execute(&self) -> io::Result<()> {
        println!("\n Checking Navigation Coverage");
        println!("{}", "=".repeat(60));

        let docs_path = self.project_root.join("docs");
        if !docs_path.exists() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                "docs directory not found",
            ));
        }

        // Collect all markdown files
        let all_md_files = Self::collect_md_files(&docs_path, &docs_path);
        println!("\n Found {} markdown files in docs/", all_md_files.len());

        // Read navigation from zensical.toml
        let zensical_path = self.project_root.join("zensical.toml");
        let nav_files: Vec<String> = if zensical_path.exists() {
            let content = fs::read_to_string(&zensical_path)?;
            Self::extract_nav_files(&content)
        } else {
            Vec::new()
        };

        println!(" Found {} files referenced in navigation", nav_files.len());

        // Find files not in navigation
        let mut orphaned: Vec<String> = Vec::new();
        let excluded_patterns = ["404.md", "print_page.md"];

        for file in &all_md_files {
            // Normalize path separators for comparison
            let file_normalized = file.replace('\\', "/");

            let is_in_nav = nav_files.iter().any(|nav_file| {
                let nav_normalized = nav_file.replace('\\', "/");
                // Check exact match or if file matches the nav path
                file_normalized == nav_normalized
                    || file_normalized.ends_with(&nav_normalized)
                    || nav_normalized.ends_with(&file_normalized)
            });

            let is_excluded = excluded_patterns.iter().any(|pat| file.ends_with(pat));

            if !is_in_nav && !is_excluded {
                orphaned.push(file.clone());
            }
        }

        println!("\n{}", "=".repeat(60));
        if orphaned.is_empty() {
            println!("[ok] All markdown files are included in navigation!");
        } else {
            println!("[warning] Found {} files not in navigation:", orphaned.len());
            for file in &orphaned {
                println!("   - {}", file);
            }
            println!("\n Tip: Add these files to the nav section in config/zensical/03-navigation.toml");
        }

        Ok(())
    }
}
