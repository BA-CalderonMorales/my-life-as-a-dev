//! Info Command - Show project structure and configuration info
//!
//! This command displays useful information about the project structure,
//! configuration files, and directory layout for understanding the project.

use std::fs;
use std::io;
use std::path::PathBuf;

use super::{Command, CommandContext};

/// Command to show project information
pub struct InfoCommand {
    project_root: PathBuf,
}

impl InfoCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
        }
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
}

impl Command for InfoCommand {
    fn name(&self) -> &'static str {
        "info"
    }

    fn description(&self) -> &'static str {
        "Show project structure and config info"
    }

    fn execute(&self) -> io::Result<()> {
        println!("\n Project Information");
        println!("{}", "=".repeat(60));

        println!("\n Paths:");
        println!("  Project root:    {}", self.project_root.display());
        println!("  Docs directory:  {}/docs", self.project_root.display());
        println!("  Overrides:       {}/docs/overrides", self.project_root.display());
        println!("  Stylesheets:     {}/docs/stylesheets", self.project_root.display());

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

        println!("\n Key Directories:");
        let key_dirs = [
            ("docs", "Documentation source files"),
            ("docs/overrides", "Theme overrides and partials"),
            ("docs/overrides/partials", "Custom partial templates"),
            ("docs/assets", "Static assets (images, CSS, JS)"),
            ("scripts/rust", "Rust CLI tools source"),
            ("config/zensical", "Modular config files"),
        ];

        for (dir, desc) in key_dirs.iter() {
            let path = self.project_root.join(dir);
            if path.exists() {
                println!("  [ok] {}  - {}", dir, desc);
            } else {
                println!("  [missing] {}  - {}", dir, desc);
            }
        }

        // Count markdown files
        let docs_path = self.project_root.join("docs");
        if docs_path.exists() {
            let md_count = Self::count_files_with_extension(&docs_path, "md");
            println!("\n Statistics:");
            println!("  Markdown files:  {}", md_count);
        }

        println!("\n Tips:");
        println!("  - Use 'validate' to check configuration syntax");
        println!("  - Use 'nav-check' to find orphaned pages");
        println!("  - Use 'build' to verify all pages compile correctly");
        println!("  - Config files in config/zensical/ auto-merge on serve/build");

        Ok(())
    }
}
