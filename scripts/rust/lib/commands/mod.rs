//! Command Pattern interface for doc-cli
//!
//! This module defines the Command trait that all CLI commands must implement,
//! providing a consistent interface for command execution.

use std::io;
use std::path::PathBuf;

// Re-export all command implementations
pub mod build;
pub mod bump_version;
pub mod deploy;
pub mod help;
pub mod info;
pub mod kill;
pub mod nav_check;
pub mod serve;
pub mod startup;
pub mod validate;

/// The Command trait - interface for all CLI commands
///
/// Each command must implement this trait to be executable by the CLI.
/// This provides a consistent contract for:
/// - Command metadata (name, description)
/// - Execution logic
/// - Argument handling
pub trait Command {
    /// Returns the primary name of the command (e.g., "serve", "build")
    fn name(&self) -> &'static str;

    /// Returns a brief description of what the command does
    fn description(&self) -> &'static str;

    /// Returns alternative names/aliases for the command (e.g., ["stop"] for "kill")
    fn aliases(&self) -> Vec<&'static str> {
        vec![]
    }

    /// Execute the command
    fn execute(&self) -> io::Result<()>;
}

/// Context passed to commands containing shared state
#[derive(Clone)]
pub struct CommandContext {
    /// Root directory of the project
    pub project_root: PathBuf,
    /// Path to the scripts/rust directory
    pub script_path: PathBuf,
    /// Command-line arguments (excluding program name and command)
    pub args: Vec<String>,
}

impl CommandContext {
    /// Create a new CommandContext
    pub fn new(project_root: PathBuf, script_path: PathBuf, args: Vec<String>) -> Self {
        Self {
            project_root,
            script_path,
            args,
        }
    }
}

/// Registry of all available commands
pub struct CommandRegistry {
    commands: Vec<Box<dyn Command>>,
}

impl CommandRegistry {
    /// Create a new registry with all available commands
    pub fn new(ctx: CommandContext) -> Self {
        let commands: Vec<Box<dyn Command>> = vec![
            Box::new(serve::ServeCommand::new(ctx.clone())),
            Box::new(build::BuildCommand::new(ctx.clone())),
            Box::new(kill::KillCommand::new(ctx.clone())),
            Box::new(info::InfoCommand::new(ctx.clone())),
            Box::new(validate::ValidateCommand::new(ctx.clone())),
            Box::new(nav_check::NavCheckCommand::new(ctx.clone())),
            Box::new(bump_version::BumpVersionCommand::new(ctx.clone())),
            Box::new(deploy::DeployCommand::new(ctx.clone())),
            Box::new(startup::StartupCommand::new(ctx.clone())),
            Box::new(help::HelpCommand::new()),
        ];

        Self { commands }
    }

    /// Find a command by name or alias
    pub fn find(&self, name: &str) -> Option<&dyn Command> {
        for cmd in &self.commands {
            if cmd.name() == name {
                return Some(cmd.as_ref());
            }
            if cmd.aliases().contains(&name) {
                return Some(cmd.as_ref());
            }
        }
        None
    }

    /// Get all commands for menu display
    pub fn all(&self) -> &[Box<dyn Command>] {
        &self.commands
    }

    /// Get menu items (commands that should appear in interactive menu)
    pub fn menu_items(&self) -> Vec<(&dyn Command, usize)> {
        self.commands
            .iter()
            .filter(|c| c.name() != "help" && c.name() != "startup")
            .enumerate()
            .map(|(i, c)| (c.as_ref(), i + 1))
            .collect()
    }
}
