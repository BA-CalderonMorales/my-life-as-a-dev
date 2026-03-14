//! Project information display.

use std::io;
use std::path::{Path, PathBuf};

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
        println!(
            "  Overrides:       {}/docs/overrides",
            self.project_root.display()
        );
        println!(
            "  Stylesheets:     {}/docs/assets/css",
            self.project_root.display()
        );
    }

    fn show_config_files(&self) {
        println!("\n Configuration Files:");

        let zensical_path = self.project_root.join("zensical.toml");
        let mkdocs_path = self.project_root.join("mkdocs.yml");
        let config_dir = self.project_root.join("config").join("zensical");

        if zensical_path.exists() {
            println!("  [ok] zensical.toml  (primary - auto-generated)");
        } else {
            println!("  [missing] zensical.toml");
        }

        if config_dir.exists() {
            let config_count = Self::count_files_with_extension(&config_dir, "toml");
            println!("  [ok] config/zensical/  ({} config files)", config_count);
        } else {
            println!("  [missing] config/zensical/");
        }

        if mkdocs_path.exists() {
            println!("  [ok] mkdocs.yml     (legacy - MkDocs config)");
        } else {
            println!("  [missing] mkdocs.yml");
        }
    }

    fn show_directories(&self) {
        println!("\n Key Directories:");

        let key_dirs = [
            ("docs", "Documentation source files"),
            ("docs/overrides", "Theme overrides and partials"),
            ("docs/overrides/partials", "Custom partial templates"),
            ("docs/assets", "Static assets (images, etc.)"),
            ("docs/assets/css", "Site stylesheets"),
            ("scripts/rust", "Rust CLI tools source"),
            ("config/zensical", "Modular config files"),
        ];

        for (dir, desc) in key_dirs {
            let path = self.project_root.join(dir);
            if path.exists() {
                println!("  [ok] {}  - {}", dir, desc);
            } else {
                println!("  [missing] {}  - {}", dir, desc);
            }
        }
    }

    fn show_statistics(&self) {
        let docs_path = self.project_root.join("docs");
        if docs_path.exists() {
            let md_count = Self::count_files_with_extension(&docs_path, "md");
            println!("\n Statistics:");
            println!("  Markdown files:  {}", md_count);
        }
    }

    fn show_tips(&self) {
        println!("\n Tips:");
        println!("  - Use 'validate' to check configuration syntax");
        println!("  - Use 'nav-check' to find orphaned pages");
        println!("  - Use 'build' to verify all pages compile correctly");
        println!("  - Config files in config/zensical/ auto-merge on serve/build");
    }

    fn count_files_with_extension(dir: &Path, ext: &str) -> usize {
        let mut count = 0;
        if let Ok(entries) = std::fs::read_dir(dir) {
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
}
