//! Version bumping module.
//!
//! # Structure
//!
//! - `colors.rs` - Terminal color constants
//! - `git.rs` - Git tag operations
//! - `prompt.rs` - User prompts

mod colors;
mod git;
mod prompt;

pub use colors::*;

/// Main entry point for version bumping.
#[allow(dead_code)]
pub fn main() {
    let bumper = VersionBumper::new();
    bumper.run();
}

/// Handles version bumping.
pub struct VersionBumper {
    current_version: String,
    major: u32,
    minor: u32,
    patch: u32,
}

impl VersionBumper {
    /// Creates a new VersionBumper instance.
    pub fn new() -> Self {
        let current_version = git::Git::get_latest_tag();
        let (major, minor, patch) = Self::parse_version(&current_version);

        Self {
            current_version,
            major,
            minor,
            patch,
        }
    }

    /// Runs the version bumping process.
    pub fn run(&self) {
        println!("{}MkDocs Version Bumper{}", BLUE, NC);
        println!("==============================");
        println!("{}Current version:{} {}", YELLOW, NC, self.current_version);

        let bump_type = prompt::Prompt::bump_type(self.major, self.minor, self.patch);
        let new_version = self.calculate_new_version(bump_type);

        println!("{}New version will be:{} {}", YELLOW, NC, new_version);

        if !prompt::Prompt::confirm() {
            println!("Version bump canceled.");
            return;
        }

        git::Git::create_tag(&new_version);

        println!("\n{}Version bump to {} complete!{}", GREEN, new_version, NC);
        println!("\n{}To deploy this version, run:{} doc-cli deploy", YELLOW, NC);
        println!("This will perform a smart deploy, only deploying versions that aren't already deployed.");
    }

    fn parse_version(version: &str) -> (u32, u32, u32) {
        let parts: Vec<&str> = version.split('.').collect();

        let major = parts.first().and_then(|s| s.parse().ok()).unwrap_or(0);
        let minor = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        let patch = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(0);

        (major, minor, patch)
    }

    fn calculate_new_version(&self, bump_type: u8) -> String {
        match bump_type {
            1 => format!("{}.0.0", self.major + 1),
            2 => format!("{}.{}.0", self.major, self.minor + 1),
            3 => format!("{}.{}.{}", self.major, self.minor, self.patch + 1),
            _ => panic!("Invalid bump type"),
        }
    }
}
