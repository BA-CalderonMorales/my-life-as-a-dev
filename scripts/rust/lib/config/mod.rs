//! Configuration management - merging and validation

use std::fs;
use std::io;
use std::path::PathBuf;
use std::process::{Command, Stdio};

/// Manages Zensical configuration files
pub struct ConfigManager {
    project_root: PathBuf,
}

impl ConfigManager {
    /// Create a new ConfigManager
    pub fn new(project_root: PathBuf) -> Self {
        Self { project_root }
    }

    /// Check if config files in config/zensical/ are newer than zensical.toml
    pub fn needs_merge(&self) -> bool {
        let config_dir = self.project_root.join("config").join("zensical");
        let zensical_toml = self.project_root.join("zensical.toml");

        // If config dir doesn't exist, no merge needed
        if !config_dir.exists() {
            return false;
        }

        // If zensical.toml doesn't exist but config dir does, need merge
        if !zensical_toml.exists() {
            return true;
        }

        // Get zensical.toml modification time
        let zensical_mtime = match fs::metadata(&zensical_toml) {
            Ok(meta) => match meta.modified() {
                Ok(time) => time,
                Err(_) => return true,
            },
            Err(_) => return true,
        };

        // Check all .toml files in config/zensical/
        let entries = match fs::read_dir(&config_dir) {
            Ok(entries) => entries,
            Err(_) => return false,
        };

        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("toml") {
                if let Ok(meta) = fs::metadata(&path) {
                    if let Ok(mtime) = meta.modified() {
                        if mtime > zensical_mtime {
                            return true;
                        }
                    }
                }
            }
        }

        false
    }

    /// Run the merge script to regenerate zensical.toml from config files
    pub fn merge(&self) -> io::Result<()> {
        println!("\n🔄 Config files changed, merging configuration...\n");

        let merge_script = self
            .project_root
            .join("scripts")
            .join("python")
            .join("merge_zensical_config.py");

        if !merge_script.exists() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("Merge script not found: {}", merge_script.display()),
            ));
        }

        // Try uv run first
        let status = Command::new("uv")
            .current_dir(&self.project_root)
            .args(&["run", "python", merge_script.to_str().unwrap()])
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status();

        match status {
            Ok(s) if s.success() => {
                println!("\n✅ Configuration merged successfully\n");
                Ok(())
            }
            Ok(s) => Err(io::Error::new(
                io::ErrorKind::Other,
                format!("Config merge failed with exit code: {}", s),
            )),
            Err(_) => {
                // Fallback to direct python
                let venv_python = self.project_root.join(".venv").join("bin").join("python");
                let python_cmd = if venv_python.exists() {
                    venv_python.to_string_lossy().to_string()
                } else {
                    "python3".to_string()
                };

                let status = Command::new(&python_cmd)
                    .current_dir(&self.project_root)
                    .arg(merge_script.to_str().unwrap())
                    .stdin(Stdio::inherit())
                    .stdout(Stdio::inherit())
                    .stderr(Stdio::inherit())
                    .status()?;

                if status.success() {
                    println!("\n✅ Configuration merged successfully\n");
                    Ok(())
                } else {
                    Err(io::Error::new(
                        io::ErrorKind::Other,
                        format!("Config merge failed with exit code: {}", status),
                    ))
                }
            }
        }
    }

    /// Ensure config is up-to-date before running zensical commands
    pub fn ensure_merged(&self) -> io::Result<()> {
        if self.needs_merge() {
            self.merge()?;
        }
        Ok(())
    }

    /// Validate site configuration
    pub fn validate(&self) -> io::Result<()> {
        println!("\n🔍 Validating Site Configuration");
        println!("{}", "=".repeat(60));

        let mut errors = Vec::new();
        let mut warnings = Vec::new();

        // Check zensical.toml exists and is readable
        let zensical_path = self.project_root.join("zensical.toml");
        if zensical_path.exists() {
            println!("\n📄 Checking zensical.toml...");
            match fs::read_to_string(&zensical_path) {
                Ok(content) => {
                    if content.contains("[project]") {
                        println!("  ✅ [project] section found");
                    } else {
                        errors.push("Missing [project] section in zensical.toml".to_string());
                    }

                    if content.contains("site_name") {
                        println!("  ✅ site_name defined");
                    } else {
                        errors.push("Missing site_name in zensical.toml".to_string());
                    }

                    if content.contains("nav = [") {
                        println!("  ✅ Navigation structure defined");
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

        // Check docs directory
        let docs_path = self.project_root.join("docs");
        if docs_path.exists() {
            println!("\n📁 Checking docs directory...");

            let index_path = docs_path.join("index.md");
            if index_path.exists() {
                println!("  ✅ docs/index.md exists");
            } else {
                errors.push("Missing docs/index.md (home page)".to_string());
            }

            let overrides_path = docs_path.join("overrides");
            if overrides_path.exists() {
                println!("  ✅ docs/overrides directory exists");
            } else {
                warnings.push("Missing docs/overrides directory".to_string());
            }
        } else {
            errors.push("docs directory not found".to_string());
        }

        // Check custom CSS
        let css_path = self.project_root.join("docs/assets/css/theme.css");
        if css_path.exists() {
            println!("\n🎨 Checking stylesheets...");
            println!("  ✅ CSS files exist in docs/assets/css/");
        }

        // Summary
        println!("\n{}", "=".repeat(60));
        if errors.is_empty() && warnings.is_empty() {
            println!("✅ Validation passed! No issues found.");
        } else {
            if !errors.is_empty() {
                println!("❌ Errors ({}):", errors.len());
                for err in &errors {
                    println!("   - {}", err);
                }
            }
            if !warnings.is_empty() {
                println!("⚠️  Warnings ({}):", warnings.len());
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
