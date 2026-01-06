//! Navigation coverage checking.

use std::fs;
use std::io;
use std::path::PathBuf;

/// Checks for markdown files not in navigation.
pub struct NavChecker {
    project_root: PathBuf,
}

impl NavChecker {
    pub fn new(project_root: PathBuf) -> Self {
        Self { project_root }
    }

    /// Check for pages not in navigation.
    pub fn check(&self) -> io::Result<()> {
        println!("\n Checking Navigation Coverage");
        println!("{}", "=".repeat(60));

        let docs_path = self.project_root.join("docs");
        if !docs_path.exists() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                "docs directory not found",
            ));
        }

        let all_md_files = self.collect_md_files(&docs_path, &docs_path);
        println!("\n Found {} markdown files in docs/", all_md_files.len());

        let nav_files = self.extract_nav_files();
        println!(" Found {} files referenced in navigation", nav_files.len());

        let orphaned = self.find_orphaned(&all_md_files, &nav_files);

        self.show_results(&orphaned);

        Ok(())
    }

    fn collect_md_files(&self, dir: &PathBuf, base: &PathBuf) -> Vec<String> {
        let mut files = Vec::new();

        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();

                if path.is_dir() {
                    let dir_name = path.file_name().unwrap_or_default().to_string_lossy();
                    if dir_name != "overrides" && dir_name != "assets" && dir_name != ".icons" {
                        files.extend(self.collect_md_files(&path, base));
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

    fn extract_nav_files(&self) -> Vec<String> {
        let zensical_path = self.project_root.join("zensical.toml");

        if !zensical_path.exists() {
            return Vec::new();
        }

        let content = match fs::read_to_string(&zensical_path) {
            Ok(c) => c,
            Err(_) => return Vec::new(),
        };

        let mut files = Vec::new();

        for line in content.lines() {
            let line = line.trim();
            if line.contains(".md") {
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

    fn find_orphaned(&self, all_files: &[String], nav_files: &[String]) -> Vec<String> {
        let excluded_patterns = ["404.md", "print_page.md"];

        all_files
            .iter()
            .filter(|file| {
                let file_normalized = file.replace('\\', "/");

                let is_in_nav = nav_files.iter().any(|nav_file| {
                    let nav_normalized = nav_file.replace('\\', "/");
                    file_normalized == nav_normalized
                        || file_normalized.ends_with(&nav_normalized)
                        || nav_normalized.ends_with(&file_normalized)
                });

                let is_excluded = excluded_patterns.iter().any(|pat| file.ends_with(pat));

                !is_in_nav && !is_excluded
            })
            .cloned()
            .collect()
    }

    fn show_results(&self, orphaned: &[String]) {
        println!("\n{}", "=".repeat(60));

        if orphaned.is_empty() {
            println!(" All markdown files are included in navigation!");
        } else {
            println!(" Found {} files not in navigation:", orphaned.len());
            for file in orphaned {
                println!("   - {}", file);
            }
            println!("\n To fix: Add these files to the nav section in zensical.toml");
        }
    }
}
