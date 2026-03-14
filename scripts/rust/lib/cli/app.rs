//! Core CLI application.

use std::env;
use std::io;

use crate::commands::{CommandContext, CommandRegistry};

use super::menu;
use super::paths::PathDetector;

/// Main CLI application.
///
/// Thin coordinator that delegates to:
/// - `PathDetector` for path detection
/// - `CommandRegistry` for command lookup
/// - `menu` module for interactive mode
pub struct App {
    registry: CommandRegistry,
    args: Vec<String>,
}

impl App {
    /// Run the CLI application.
    ///
    /// Main entry point - call from `main()`.
    pub fn run() -> io::Result<()> {
        let app = Self::new();
        app.execute()
    }

    /// Create a new App instance.
    fn new() -> Self {
        let args: Vec<String> = env::args().collect();
        let registry = Self::create_registry(&args);

        // Handle --help early
        if args.iter().any(|a| a == "--help" || a == "-h") {
            Self::print_header();
            if let Some(cmd) = registry.find("help") {
                let _ = cmd.execute();
            }
            std::process::exit(0);
        }

        App { registry, args }
    }

    /// Main execution - dispatch to command or interactive mode.
    fn execute(&self) -> io::Result<()> {
        Self::print_header();

        let command_name = if self.args.len() <= 1 {
            menu::run(&self.registry)?
        } else {
            self.args[1].clone()
        };

        self.execute_command(&command_name)
    }

    /// Create the command registry with detected paths.
    fn create_registry(args: &[String]) -> CommandRegistry {
        let (project_root, script_path) = PathDetector::detect();

        let extra_args: Vec<String> = if args.len() > 2 {
            args[2..].to_vec()
        } else {
            vec![]
        };

        let ctx = CommandContext::new(project_root, script_path, extra_args);
        CommandRegistry::new(ctx)
    }

    /// Print the CLI header.
    fn print_header() {
        println!("\n{}", "=".repeat(60));
        println!("Zensical Documentation CLI Tool");
        println!("{}", "=".repeat(60));
    }

    /// Execute a command by name or alias.
    fn execute_command(&self, name: &str) -> io::Result<()> {
        match self.registry.find(name) {
            Some(cmd) => cmd.execute(),
            None => {
                eprintln!("Unknown command: {}", name);
                eprintln!("\nAvailable commands:");
                for cmd in self.registry.all() {
                    eprintln!("  {:14} - {}", cmd.name(), cmd.description());
                }
                eprintln!("\nUse './doc-cli help' for more details.");
                std::process::exit(1);
            }
        }
    }
}
