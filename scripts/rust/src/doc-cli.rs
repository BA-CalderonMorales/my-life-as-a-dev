//! Zensical Documentation CLI Tool - Entry Point
//!
//! This is a minimal entry point. All logic lives in `lib/cli/`.
//!
//! # Architecture
//!
//! ```text
//! doc-cli.rs (you are here)
//!     │
//!     └── lib/cli/mod.rs     -> App struct, interactive mode
//!             │
//!             └── lib/commands/  -> Command pattern implementations
//! ```
//!
//! # Adding a New Command
//!
//! 1. Create `lib/commands/my_command.rs`
//! 2. Implement the `Command` trait
//! 3. Register in `CommandRegistry::new()`
//!
//! No changes needed to this file!

use std::io::ErrorKind;

use doc_tools::cli::App;

fn main() {
    reset_sigpipe();

    if let Err(e) = App::run() {
        if e.kind() != ErrorKind::BrokenPipe {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}

/// Reset SIGPIPE to default behavior (terminate on broken pipe).
/// Prevents panics when output is piped to commands like `head`.
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
