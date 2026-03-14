//! Config validation utilities.

use std::io;
use std::path::{Path, PathBuf};

/// Validates site configuration.
pub struct Validator {
    project_root: PathBuf,
}

impl Validator {
    pub fn new(project_root: PathBuf) -> Self {
        Self { project_root }
    }

    /// Validate site configuration.
    pub fn validate(&self) -> io::Result<()> {
        println!("\n Validating Site Configuration");
        println!("{}", "=".repeat(60));

        let mut errors = Vec::new();
        let mut warnings = Vec::new();

        self.check_zensical_toml(&mut errors, &mut warnings);
        self.check_config_directory();
        self.check_docs_directory(&mut errors, &mut warnings);
        self.check_stylesheets();

        self.show_summary(&errors, &warnings);

        if !errors.is_empty() {
            std::process::exit(1);
        }

        Ok(())
    }

    fn check_zensical_toml(&self, errors: &mut Vec<String>, warnings: &mut Vec<String>) {
        let path = self.project_root.join("zensical.toml");

        if !path.exists() {
            errors.push("zensical.toml not found".to_string());
            return;
        }

        println!("\n Checking zensical.toml...");

        match std::fs::read_to_string(&path) {
            Ok(content) => {
                if content.contains("[project]") {
                    println!("  [ok] [project] section found");
                } else {
                    errors.push("Missing [project] section in zensical.toml".to_string());
                }

                if content.contains("site_name") {
                    println!("  [ok] site_name defined");
                } else {
                    errors.push("Missing site_name in zensical.toml".to_string());
                }

                if content.contains("nav = [") || content.contains("[[project.nav]]") {
                    println!("  [ok] Navigation structure defined");
                } else {
                    warnings.push("No navigation structure in zensical.toml".to_string());
                }
            }
            Err(e) => {
                errors.push(format!("Failed to read zensical.toml: {}", e));
            }
        }
    }

    fn check_config_directory(&self) {
        let config_dir = self.project_root.join("config").join("zensical");

        if config_dir.exists() {
            let config_count = Self::count_files_with_extension(&config_dir, "toml");
            println!("\n Checking config/zensical/...");
            println!("  [ok] Found {} config files", config_count);
        }
    }

    fn check_docs_directory(&self, errors: &mut Vec<String>, warnings: &mut Vec<String>) {
        let docs_path = self.project_root.join("docs");

        if !docs_path.exists() {
            errors.push("docs directory not found".to_string());
            return;
        }

        println!("\n Checking docs directory...");

        let index_path = docs_path.join("index.md");
        if index_path.exists() {
            println!("  [ok] docs/index.md exists");
        } else {
            errors.push("Missing docs/index.md (home page)".to_string());
        }

        let overrides_path = docs_path.join("overrides");
        if overrides_path.exists() {
            println!("  [ok] docs/overrides directory exists");
        } else {
            warnings.push("Missing docs/overrides directory".to_string());
        }
    }

    fn check_stylesheets(&self) {
        let css_path = self.project_root.join("docs/assets/css/theme.css");
        if css_path.exists() {
            println!("\n Checking stylesheets...");
            println!("  [ok] CSS files exist in docs/assets/css/");
        }
    }

    fn show_summary(&self, errors: &[String], warnings: &[String]) {
        println!("\n{}", "=".repeat(60));

        if errors.is_empty() && warnings.is_empty() {
            println!("[ok] Validation passed! No issues found.");
        } else {
            if !errors.is_empty() {
                println!("[error] Errors ({}):", errors.len());
                for err in errors {
                    println!("   - {}", err);
                }
            }
            if !warnings.is_empty() {
                println!("[warning] Warnings ({}):", warnings.len());
                for warn in warnings {
                    println!("   - {}", warn);
                }
            }
        }
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
