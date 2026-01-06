//! Validate Command - Validate site configuration
//!
//! This command validates the Zensical configuration file (zensical.toml)
//! and checks for common issues like missing sections or files.

use std::fs;
use std::io;
use std::path::PathBuf;

use super::{Command, CommandContext};

/// Command to validate site configuration
pub struct ValidateCommand {
    project_root: PathBuf,
}

impl ValidateCommand {
    pub fn new(ctx: CommandContext) -> Self {
        Self {
            project_root: ctx.project_root,
        }
    }
}

impl Command for ValidateCommand {
    fn name(&self) -> &'static str {
        "validate"
    }

    fn description(&self) -> &'static str {
        "Validate site configuration"
    }

    fn execute(&self) -> io::Result<()> {
        println!("\n Validating Site Configuration");
        println!("{}", "=".repeat(60));

        let mut errors = Vec::new();
        let mut warnings = Vec::new();

        // Check zensical.toml exists and is readable
        let zensical_path = self.project_root.join("zensical.toml");
        if zensical_path.exists() {
            println!("\n Checking zensical.toml...");
            match fs::read_to_string(&zensical_path) {
                Ok(content) => {
                    // Basic TOML syntax check - look for common issues
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

                    if content.contains("nav = [") {
                        println!("  [ok] Navigation structure defined");
                    } else {
                        warnings.push("No navigation structure in zensical.toml".to_string());
                    }
                }
                Err(e) => {
                    errors.push(format!("Failed to read zensical.toml: {}", e));
                }
            }
        } else {
            errors.push("zensical.toml not found".to_string());
        }

        // Check config/zensical/ directory
        let config_dir = self.project_root.join("config").join("zensical");
        if config_dir.exists() {
            println!("\n Checking config/zensical/...");
            let mut config_count = 0;
            if let Ok(entries) = fs::read_dir(&config_dir) {
                for entry in entries.flatten() {
                    if entry.path().extension().and_then(|s| s.to_str()) == Some("toml") {
                        config_count += 1;
                    }
                }
            }
            println!("  [ok] Found {} config files", config_count);
        }

        // Check docs directory
        let docs_path = self.project_root.join("docs");
        if docs_path.exists() {
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
        } else {
            errors.push("docs directory not found".to_string());
        }

        // Check custom CSS
        let css_path = self.project_root.join("docs/assets/css/theme.css");
        if css_path.exists() {
            println!("\n Checking stylesheets...");
            println!("  [ok] CSS files exist in docs/assets/css/");
        }

        // Summary
        println!("\n{}", "=".repeat(60));
        if errors.is_empty() && warnings.is_empty() {
            println!("[ok] Validation passed! No issues found.");
        } else {
            if !errors.is_empty() {
                println!("[error] Errors ({}):", errors.len());
                for err in &errors {
                    println!("   - {}", err);
                }
            }
            if !warnings.is_empty() {
                println!("[warning] Warnings ({}):", warnings.len());
                for warn in &warnings {
                    println!("   - {}", warn);
                }
            }
        }

        if !errors.is_empty() {
            std::process::exit(1);
        }

        Ok(())
    }
}
