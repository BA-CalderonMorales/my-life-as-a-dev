//! Deploy all versions module.
//!
//! # Structure
//!
//! - `colors.rs` - Terminal color constants
//! - `git.rs` - Git operations (tags, branches)
//! - `versions.rs` - Version detection from gh-pages
//! - `mike.rs` - Mike command wrapper
//! - `ui.rs` - User interface for deployment selection

mod colors;
mod git;
mod mike;
mod ui;
mod versions;

use std::env;

pub use colors::*;
pub use ui::DeploymentUI;

/// Main entry point for deploying all versions.
#[allow(dead_code)]
pub fn main() {
    let args: Vec<String> = env::args().collect();
    let mut force = false;
    let mut interactive = true;

    for arg in &args[1..] {
        match arg.as_str() {
            "-f" | "--force" => {
                force = true;
                interactive = false;
            }
            "-n" | "--non-interactive" => {
                interactive = false;
            }
            _ => {
                eprintln!("{}Unknown option: {}{}", RED, arg, NC);
                eprintln!("Usage: deploy-all-versions [-f|--force] [-n|--non-interactive]");
                std::process::exit(1);
            }
        }
    }

    if interactive {
        force = DeploymentUI::select_mode();
    }

    let deployer = Deployer::new(force);
    deployer.run();
}

/// Prompt the user to choose between regular and force deployment.
pub fn select_deployment_mode() -> bool {
    DeploymentUI::select_mode()
}

/// Handles deployment of all versions.
pub struct Deployer {
    force: bool,
    current_branch: String,
}

impl Deployer {
    /// Creates a new Deployer instance.
    pub fn new(force: bool) -> Self {
        Self {
            force,
            current_branch: git::Git::current_branch(),
        }
    }

    /// Runs the deployment process.
    pub fn run(&self) {
        git::Git::fetch_tags_and_branch();

        let main_tags = git::Git::get_tags_from_main(&self.current_branch);

        let deployed_versions = if self.force {
            Vec::new()
        } else {
            versions::Versions::get_deployed()
        };

        if main_tags.is_empty() {
            println!("{}No tags found in main branch. Nothing to deploy.{}", RED, NC);
            return;
        }

        let (deployed, skipped) = self.deploy_versions(&main_tags, &deployed_versions);

        if let Some(latest) = main_tags.last() {
            mike::Mike::set_latest(latest);
            mike::Mike::push();
            DeploymentUI::show_stats(deployed, skipped, main_tags.len(), latest, self.force);
        }
    }

    fn deploy_versions(&self, tags: &[String], deployed: &[String]) -> (usize, usize) {
        println!("{}Deploying versions to gh-pages branch...{}", BLUE, NC);

        mike::Mike::ensure_installed();

        if self.force {
            println!("{}Force mode: all versions will be deployed.{}", YELLOW, NC);
        }

        let mut deployed_count = 0;
        let mut skipped_count = 0;

        for tag in tags {
            if !self.force && deployed.contains(tag) {
                println!("{}Skipping {} (already deployed){}", YELLOW, tag, NC);
                skipped_count += 1;
                continue;
            }

            if mike::Mike::deploy(tag) {
                deployed_count += 1;
            } else {
                std::process::exit(1);
            }
        }

        (deployed_count, skipped_count)
    }
}
