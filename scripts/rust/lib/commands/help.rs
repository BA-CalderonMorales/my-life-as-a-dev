//! Help Command - Display CLI help information
//!
//! This command shows detailed help about all available commands
//! and their usage.

use std::io;

use super::Command;

/// Command to display help information
pub struct HelpCommand;

impl HelpCommand {
    pub fn new() -> Self {
        Self
    }
}

impl Default for HelpCommand {
    fn default() -> Self {
        Self::new()
    }
}

impl Command for HelpCommand {
    fn name(&self) -> &'static str {
        "help"
    }

    fn description(&self) -> &'static str {
        "Show command help information"
    }

    fn aliases(&self) -> Vec<&'static str> {
        vec!["--help", "-h"]
    }

    fn execute(&self) -> io::Result<()> {
        println!("\nDocumentation CLI Tool Help");
        println!("===========================\n");
        println!("Usage: doc-cli [COMMAND] [OPTIONS]");

        println!("\nPrimary Commands (Zensical):");
        println!("  serve                Start Zensical development server (port 8001)");
        println!("                       Modern static site generator, 20x faster builds");
        println!("  build                Build site with Zensical");
        println!("  kill                 Stop running Zensical/MkDocs processes");
        println!("                       Kills processes by name and frees ports 8000/8001");

        println!("\nAgent & Validation Commands:");
        println!("  info                 Show project structure and configuration info");
        println!("                       Useful for understanding the project layout");
        println!("  validate             Validate site configuration (zensical.toml)");
        println!("                       Checks for syntax errors and missing files");
        println!("  nav-check            Check for markdown files not in navigation");
        println!("                       Reports pages that may be orphaned");

        println!("\nLegacy Commands (MkDocs):");
        println!("  startup              Start MkDocs development environment");
        println!("                       Sets up MkDocs with mike for versioned documentation");
        println!("    Options:");
        println!("      --local           Run in local mode (required outside Codespaces)");
        println!("      --clean           Use full rebuilds instead of dirty mode");
        println!("      --draft-version VERSION   View a specific version not yet deployed");

        println!("\nVersion & Deploy:");
        println!("  bump-version         Bump the documentation version");
        println!("  deploy [VERSION]     Deploy a versioned release to GitHub Pages");
        println!("                       If VERSION omitted, prompts interactively");
        println!("    Options:");
        println!("      --push           Push to remote after deploy");
        println!("      --no-push        Skip pushing (default: prompts)");
        println!("  update [VERSION]     One-shot version update/deploy helper");
        println!("                       Defaults to alias 'latest' and push enabled");
        println!("    Options:");
        println!("      --alias NAME     Alias to assign (default: latest)");
        println!("      --push, -p       Push to remote after deploy (default)");
        println!("      --no-push        Build/update without pushing");
        println!("  help                 Show this help message");

        println!("\nConfiguration:");
        println!("  Config files are in config/zensical/ (7 domain files)");
        println!("  Changes auto-merge to zensical.toml before serve/build");

        println!("\nExamples:");
        println!("  ./doc-cli serve          # Start dev server");
        println!("  ./doc-cli kill           # Stop server");
        println!("  ./doc-cli kill && ./doc-cli serve   # Restart");
        println!("  ./doc-cli build          # Build for production");
        println!("  ./doc-cli deploy         # Interactive versioned deploy");
        println!("  ./doc-cli deploy 0.3.2 --push  # Deploy specific version");
        println!("  ./doc-cli update 0.4.6 --alias latest --push");

        Ok(())
    }
}
