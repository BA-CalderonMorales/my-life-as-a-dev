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
    ///
    /// Bare invocation opens the interactive menu, which stays open until the
    /// operator types `exit` (or `quit`): each round picks one command, runs
    /// it, then returns to the menu. With arguments, the named command runs
    /// once and the process exits.
    fn execute(&self) -> io::Result<()> {
        Self::print_header();

        if self.args.len() > 1 {
            return self.execute_command(&self.args[1].clone());
        }

        loop {
            let choice = menu::run(&self.registry)?;
            if matches!(choice.as_str(), "exit" | "quit") {
                println!("Leaving doc-cli.");
                break;
            }
            match self.registry.find(&choice) {
                Some(cmd) => cmd.execute()?,
                None => {
                    eprintln!("Unknown command: {}", choice);
                    eprintln!("Type 'exit' to leave, or pick from the menu.");
                }
            }
            println!();
        }
        Ok(())
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
