//! Interactive menu for CLI.
//!
//! Displays numbered command list and handles user input.

use std::io::{self, Write};

use crate::commands::CommandRegistry;

/// Displays the interactive menu and handles user selection.
///
/// Returns the selected command name (or alias).
pub fn run(registry: &CommandRegistry) -> io::Result<String> {
    println!("\nAvailable commands:");

    let menu_items = registry.menu_items();
    for (cmd, num) in &menu_items {
        println!("  {}. {:12} - {}", num, cmd.name(), cmd.description());
    }
    println!("  h. help          - Show command help information");
    println!();
    println!("Tip: For local development: ./doc-cli serve");
    println!("Tip: To restart: ./doc-cli kill && ./doc-cli serve");
    println!();
    print!(
        "Enter your choice (1-{} or h) or command name: ",
        menu_items.len()
    );
    io::stdout().flush()?;

    let mut choice = String::new();
    io::stdin().read_line(&mut choice)?;
    let choice = choice.trim();

    // Try number first
    if let Ok(num) = choice.parse::<usize>() {
        if num >= 1 && num <= menu_items.len() {
            return Ok(menu_items[num - 1].0.name().to_string());
        }
    }

    // "h" for help
    if choice == "h" {
        return Ok("help".to_string());
    }

    Ok(choice.to_string())
}
