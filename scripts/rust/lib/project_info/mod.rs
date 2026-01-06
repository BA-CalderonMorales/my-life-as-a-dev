//! Project information and navigation checking

use std::fs;
use std::io;
use std::path::PathBuf;

/// Provides project information and navigation utilities
pub struct ProjectInfo {
    project_root: PathBuf,
}

impl ProjectInfo {
    /// Create a new ProjectInfo
    pub fn new(project_root: PathBuf) -> Self {
        Self { project_root }
    }

    /// Show project info - useful for agents to understand the project structure
    pub fn show(&self) -> io::Result<()> {
        println!("\n📁 Project Information");
        println!("{}", "=".repeat(60));

        println!("\n📍 Paths:");
        println!("  Project root:    {}", self.project_root.display());
        println!("  Docs directory:  {}/docs", self.project_root.display());
        println!("  Overrides:       {}/docs/overrides", self.project_root.display());
        println!("  Stylesheets:     {}/docs/stylesheets", self.project_root.display());

        println!("\n📄 Configuration Files:");
        let zensical_path = self.project_root.join("zensical.toml");
        let mkdocs_path = self.project_root.join("mkdocs.yml");

        if zensical_path.exists() {
            println!("  ✅ zensical.toml  (primary - Zensical config)");
        } else {
            println!("  ❌ zensical.toml  (missing)");
        }

        if mkdocs_path.exists() {
            println!("  ✅ mkdocs.yml     (legacy - MkDocs config)");
        } else {
            println!("  ❌ mkdocs.yml     (missing)");
        }

        println!("\n📂 Key Directories:");
        let key_dirs = [
            ("docs", "Documentation source files"),
            ("docs/overrides", "Theme overrides and partials"),
            ("docs/overrides/partials", "Custom partial templates"),
            ("docs/stylesheets", "Custom CSS styles"),
            ("docs/assets", "Static assets (images, etc.)"),
            ("scripts/rust", "Rust CLI tools source"),
            ("config/zensical", "Modular config files"),
        ];

        for (dir, desc) in key_dirs.iter() {
            let path = self.project_root.join(dir);
            if path.exists() {
                println!("  ✅ {}  - {}", dir, desc);
            } else {
                println!("  ❌ {}  - {} (missing)", dir, desc);
            }
        }

        // Count markdown files
        let docs_path = self.project_root.join("docs");
        if docs_path.exists() {
            let md_count = Self::count_files_with_extension(&docs_path, "md");
            println!("\n📊 Statistics:");
            println!("  Markdown files:  {}", md_count);
        }

        println!("\n💡 Tips for Agents:");
        println!("  - Use 'validate' to check configuration syntax");
        println!("  - Use 'nav-check' to find orphaned pages");
        println!("  - Use 'build' to verify all pages compile correctly");
        println!("  - Primary config is zensical.toml (preferred over mkdocs.yml)");

        Ok(())
    }

    /// Count files with a specific extension recursively
    fn count_files_with_extension(dir: &PathBuf, ext: &str) -> usize {
        let mut count = 0;
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    count += Self::count_files_with_extension(&path, ext);
                } else if path.extension().map_or(false, |e| e == ext) {
                    count += 1;
                }
            }
        }
        count
    }

    /// Check for pages not in navigation
    pub fn nav_check(&self) -> io::Result<()> {
        println!("\n🔍 Checking Navigation Coverage");
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
        println!("\n📄 Found {} markdown files in docs/", all_md_files.len());

        // Read navigation from zensical.toml
        let zensical_path = self.project_root.join("zensical.toml");
        let nav_files: Vec<String> = if zensical_path.exists() {
            let content = fs::read_to_string(&zensical_path)?;
            Self::extract_nav_files(&content)
        } else {
            Vec::new()
        };

        println!("📋 Found {} files referenced in navigation", nav_files.len());

        // Find files not in navigation
        let mut orphaned: Vec<String> = Vec::new();
        let excluded_patterns = ["404.md", "print_page.md"];

        for file in &all_md_files {
            let file_normalized = file.replace('\\', "/");

            let is_in_nav = nav_files.iter().any(|nav_file| {
                let nav_normalized = nav_file.replace('\\', "/");
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
            println!("✅ All markdown files are included in navigation!");
        } else {
            println!("⚠️  Found {} files not in navigation:", orphaned.len());
            for file in &orphaned {
                println!("   - {}", file);
            }
            println!("\n💡 To fix: Add these files to the nav section in zensical.toml");
        }

        Ok(())
    }

    /// Collect all markdown files recursively
    fn collect_md_files(dir: &PathBuf, base: &PathBuf) -> Vec<String> {
        let mut files = Vec::new();
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
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
}
