//! Zensical Documentation CLI Tool
//!
//! This is the entry point for the doc-cli tool. It uses the Command Pattern
//! to delegate all functionality to individual command implementations in lib/commands/.
//!
//! Architecture:
//! - doc-cli.rs (this file): Thin entry point, handles args and dispatches
//! - lib/commands/mod.rs: Command trait (interface) and registry
//! - lib/commands/*.rs: Individual command implementations
//! - lib/config/: Config management service
//! - lib/project_info/: Project info service
//! - lib/zensical/: Zensical server management service

use std::env;
use std::io::{self, ErrorKind, Write};
use std::path::PathBuf;

// Import the command pattern infrastructure
use doc_tools::commands::{CommandContext, CommandRegistry};

fn main() {
    // Handle broken pipe gracefully (e.g., when piping to `head`)
    reset_sigpipe();

    let cli = DocCli::new();
    if let Err(e) = cli.run() {
        // Don't print error for broken pipe - just exit cleanly
        if e.kind() != ErrorKind::BrokenPipe {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}

/// Reset SIGPIPE to default behavior (terminate on broken pipe)
/// This prevents panics when output is piped to commands like `head`
#[cfg(unix)]
fn reset_sigpipe() {
    unsafe {
        libc::signal(libc::SIGPIPE, libc::SIG_DFL);
    }
}

#[cfg(not(unix))]
fn reset_sigpipe() {
    // No-op on non-Unix systems
}

/// Main CLI application - thin wrapper around Command Pattern
struct DocCli {
    registry: CommandRegistry,
    args: Vec<String>,
}

impl DocCli {
    /// Create a new DocCli instance
    fn new() -> Self {
        let args: Vec<String> = env::args().collect();

        // Handle --help early
        if args.iter().any(|a| a == "--help" || a == "-h") {
            Self::print_header();
            if let Some(cmd) = Self::create_registry(&args).find("help") {
                let _ = cmd.execute();
            }
            std::process::exit(0);
        }

        let registry = Self::create_registry(&args);

        DocCli { registry, args }
    }

    /// Detect project paths and create command registry
    fn create_registry(args: &[String]) -> CommandRegistry {
        let (project_root, script_path) = Self::detect_paths();

        // Extract extra args (skip program name and command)
        let extra_args: Vec<String> = if args.len() > 2 {
            args[2..].to_vec()
        } else {
            vec![]
        };

        let ctx = CommandContext::new(project_root, script_path, extra_args);
        CommandRegistry::new(ctx)
    }

    /// Detect project root and script paths based on execution context
    fn detect_paths() -> (PathBuf, PathBuf) {
        let current_dir = env::current_dir().expect("Failed to get current directory");
        let current_exe = env::current_exe().expect("Failed to get current executable path");

        // Running from project root (./doc-cli)
        if current_exe.file_name().unwrap_or_default() == "doc-cli"
            && current_dir.join("zensical.toml").exists()
        {
            let script_path = current_dir.join("scripts").join("rust");
            return (current_dir, script_path);
        }

        // Running from cargo build output (scripts/rust/target/release/doc-cli)
        if let Some(project_root) = Self::detect_from_cargo_output(&current_exe) {
            let scripts_rust = current_exe
                .parent() // target/release
                .and_then(|p| p.parent()) // target
                .and_then(|p| p.parent()) // scripts/rust
                .unwrap_or(&current_dir);
            return (project_root, scripts_rust.to_path_buf());
        }

        // Fallback: assume current directory is project root
        let script_path = current_dir.join("scripts").join("rust");
        (current_dir, script_path)
    }

    /// Try to detect project root from cargo build output path
    fn detect_from_cargo_output(exe_path: &PathBuf) -> Option<PathBuf> {
        let exe_dir = exe_path.parent()?;

        // Must be in target/release or target/debug
        if !exe_dir.ends_with("target/release") && !exe_dir.ends_with("target/debug") {
            return None;
        }

        // Walk up: target/{release,debug} -> target -> scripts/rust -> scripts -> project_root
        exe_dir
            .parent() // target
            .and_then(|p| p.parent()) // scripts/rust
            .and_then(|p| p.parent()) // scripts
            .and_then(|p| p.parent()) // project_root
            .map(|p| p.to_path_buf())
    }

    /// Main execution method
    fn run(&self) -> io::Result<()> {
        Self::print_header();

        if self.args.len() <= 1 {
            self.interactive_mode()
        } else {
            self.execute_command(&self.args[1])
        }
    }

    /// Print the CLI header
    fn print_header() {
        println!("\n{}", "=".repeat(60));
        println!("Zensical Documentation CLI Tool");
        println!("{}", "=".repeat(60));
    }

    /// Interactive menu mode
    fn interactive_mode(&self) -> io::Result<()> {
        println!("\nAvailable commands:");

        // Get menu items from registry
        let menu_items = self.registry.menu_items();
        for (cmd, num) in &menu_items {
            println!("  {}. {:12} - {}", num, cmd.name(), cmd.description());
        }
        println!("  h. help          - Show command help information");
        println!();
        println!("Tip: For local development: ./doc-cli serve");
        println!("Tip: To restart: ./doc-cli kill && ./doc-cli serve");
        println!();
        print!("Enter your choice (1-{} or h) or command name: ", menu_items.len());
        io::stdout().flush()?;

        let mut choice = String::new();
        io::stdin().read_line(&mut choice)?;
        let choice = choice.trim();

        // Try to match by number first
        if let Ok(num) = choice.parse::<usize>() {
            if num >= 1 && num <= menu_items.len() {
                let cmd_name = menu_items[num - 1].0.name();
                return self.execute_command(cmd_name);
            }
        }

        // Match "h" for help
        if choice == "h" {
            return self.execute_command("help");
        }

        // Try to match by command name
        self.execute_command(choice)
    }

    /// Execute a specific command by name
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
