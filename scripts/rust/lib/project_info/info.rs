//! Project information display.

use std::fs;
use std::io;
use std::path::PathBuf;

/// Displays project structure and configuration info.
pub struct Info {
    project_root: PathBuf,
}

impl Info {
    pub fn new(project_root: PathBuf) -> Self {
        Self { project_root }
    }

    /// Show project info.
    pub fn show(&self) -> io::Result<()> {
        println!("\n Project Information");
        println!("{}", "=".repeat(60));

        self.show_paths();
        self.show_config_files();
        self.show_directories();
        self.show_statistics();
        self.show_tips();

        Ok(())
    }

    fn show_paths(&self) {
        println!("\n Paths:");
        println!("  Project root:    {}", self.project_root.display());
        println!("  Docs directory:  {}/docs", self.project_root.display());
        println!("  Overrides:       {}/docs/overrides", self.project_root.display());
        println!("  Stylesheets:     {}/docs/stylesheets", self.project_root.display());
    }

    fn show_config_files(&self) {
        println!("\n Configuration Files:");

        let zensical_path = self.project_root.join("zensical.toml");
        let mkdocs_path = self.project_root.join("mkdocs.yml");

        if zensical_path.exists() {
            println!("   zensical.toml  (primary - Zensical config)");
        } else {
            println!("   zensical.toml  (missing)");
        }

        if mkdocs_path.exists() {
            println!("   mkdocs.yml     (legacy - MkDocs config)");
        } else {
            println!("   mkdocs.yml     (missing)");
        }
    }

    fn show_directories(&self) {
        println!("\n Key Directories:");

        let key_dirs = [
            ("docs", "Documentation source files"),
            ("docs/overrides", "Theme overrides and partials"),
            ("docs/overrides/partials", "Custom partial templates"),
            ("docs/stylesheets", "Custom CSS styles"),
            ("docs/assets", "Static assets (images, etc.)"),
            ("scripts/rust", "Rust CLI tools source"),
            ("config/zensical", "Modular config files"),
        ];

        for (dir, desc) in key_dirs {
            let path = self.project_root.join(dir);
            if path.exists() {
                println!("   {}  - {}", dir, desc);
            } else {
                println!("   {}  - {} (missing)", dir, desc);
            }
        }
    }

    fn show_statistics(&self) {
        let docs_path = self.project_root.join("docs");
        if docs_path.exists() {
            let md_count = Self::count_files(&docs_path, "md");
            println!("\n Statistics:");
            println!("  Markdown files:  {}", md_count);
        }
    }

    fn show_tips(&self) {
        println!("\n Tips for Agents:");
        println!("  - Use 'validate' to check configuration syntax");
        println!("  - Use 'nav-check' to find orphaned pages");
        println!("  - Use 'build' to verify all pages compile correctly");
        println!("  - Primary config is zensical.toml (preferred over mkdocs.yml)");
    }

    fn count_files(dir: &PathBuf, ext: &str) -> usize {
        let mut count = 0;
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    count += Self::count_files(&path, ext);
                } else if path.extension().map_or(false, |e| e == ext) {
                    count += 1;
                }
            }
        }
        count
    }
}
