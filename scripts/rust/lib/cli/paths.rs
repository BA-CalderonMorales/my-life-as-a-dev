//! Path detection utilities.
//!
//! Detects project root and script paths based on how the CLI was invoked.

use std::env;
use std::path::PathBuf;

/// Detects project root and script paths based on execution context.
///
/// Supports multiple invocation patterns:
/// - From project root: `./doc-cli`
/// - From cargo build: `scripts/rust/target/release/doc-cli`
pub struct PathDetector;

impl PathDetector {
    /// Detect project root and script paths.
    ///
    /// Returns `(project_root, script_path)` tuple.
    pub fn detect() -> (PathBuf, PathBuf) {
        let current_dir = env::current_dir().expect("Failed to get current directory");
        let current_exe = env::current_exe().expect("Failed to get current executable path");

        // Running from project root (./doc-cli)
        if current_exe.file_name().unwrap_or_default() == "doc-cli"
            && current_dir.join("zensical.toml").exists()
        {
            let script_path = current_dir.join("scripts").join("rust");
            return (current_dir, script_path);
        }

        // Running from cargo build output
        if let Some(project_root) = Self::detect_from_cargo_output(&current_exe) {
            let scripts_rust = current_exe
                .parent()
                .and_then(|p| p.parent())
                .and_then(|p| p.parent())
                .unwrap_or(&current_dir);
            return (project_root, scripts_rust.to_path_buf());
        }

        // Fallback: assume current directory is project root
        let script_path = current_dir.join("scripts").join("rust");
        (current_dir, script_path)
    }

    /// Try to detect project root from cargo build output path.
    fn detect_from_cargo_output(exe_path: &PathBuf) -> Option<PathBuf> {
        let exe_dir = exe_path.parent()?;

        // Must be in target/release or target/debug
        if !exe_dir.ends_with("target/release") && !exe_dir.ends_with("target/debug") {
            return None;
        }

        // Walk up: target/{release,debug} -> target -> scripts/rust -> scripts -> project_root
        exe_dir
            .parent()
            .and_then(|p| p.parent())
            .and_then(|p| p.parent())
            .and_then(|p| p.parent())
            .map(|p| p.to_path_buf())
    }
}
