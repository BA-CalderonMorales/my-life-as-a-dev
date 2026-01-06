//! Config validation utilities.

use std::fs;
use std::io;
use std::path::PathBuf;

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

        match fs::read_to_string(&path) {
            Ok(content) => {
                if content.contains("[project]") {
                    println!("   [project] section found");
                } else {
                    errors.push("Missing [project] section in zensical.toml".to_string());
                }

                if content.contains("site_name") {
                    println!("   site_name defined");
                } else {
                    errors.push("Missing site_name in zensical.toml".to_string());
                }

                if content.contains("nav = [") {
                    println!("   Navigation structure defined");
                } else {
                    warnings.push("No navigation structure in zensical.toml".to_string());
                }
            }
            Err(e) => {
                errors.push(format!("Failed to read zensical.toml: {}", e));
            }
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
            println!("   docs/index.md exists");
        } else {
            errors.push("Missing docs/index.md (home page)".to_string());
        }

        let overrides_path = docs_path.join("overrides");
        if overrides_path.exists() {
            println!("   docs/overrides directory exists");
        } else {
            warnings.push("Missing docs/overrides directory".to_string());
        }
    }

    fn check_stylesheets(&self) {
        let css_path = self.project_root.join("docs/assets/css/theme.css");
        if css_path.exists() {
            println!("\n Checking stylesheets...");
            println!("   CSS files exist in docs/assets/css/");
        }
    }

    fn show_summary(&self, errors: &[String], warnings: &[String]) {
        println!("\n{}", "=".repeat(60));

        if errors.is_empty() && warnings.is_empty() {
            println!(" Validation passed! No issues found.");
        } else {
            if !errors.is_empty() {
                println!(" Errors ({}):", errors.len());
                for err in errors {
                    println!("   - {}", err);
                }
            }
            if !warnings.is_empty() {
                println!(" Warnings ({}):", warnings.len());
                for warn in warnings {
                    println!("   - {}", warn);
                }
            }
        }
    }
}
