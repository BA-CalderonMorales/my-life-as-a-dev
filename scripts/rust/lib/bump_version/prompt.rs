//! User prompts for version bumping.

use std::io::{self, Write, stdin};

use super::colors::*;

/// Version bump prompts.
pub struct Prompt;

impl Prompt {
    /// Prompt user for bump type (major, minor, patch).
    pub fn bump_type(major: u32, minor: u32, patch: u32) -> u8 {
        println!("\n{}What kind of version bump do you want to make?{}", YELLOW, NC);
        println!("{}1){} Major ({}.0.0)", BLUE, NC, major + 1);
        println!("{}2){} Minor ({}.{}.0)", BLUE, NC, major, minor + 1);
        println!("{}3){} Patch ({}.{}.{})", BLUE, NC, major, minor, patch + 1);

        loop {
            print!("{}Enter choice [1-3]: {}", YELLOW, NC);
            io::stdout().flush().ok();

            let mut input = String::new();
            if stdin().read_line(&mut input).is_err() {
                continue;
            }

            match input.trim() {
                "1" | "2" | "3" => return input.trim().parse().unwrap(),
                _ => println!("\n{}Invalid option. Please enter 1, 2, or 3.{}", YELLOW, NC),
            }
        }
    }

    /// Confirm the version bump.
    pub fn confirm() -> bool {
        print!("Proceed with this version? (y/n): ");
        io::stdout().flush().ok();

        let mut confirm = String::new();
        io::stdin().read_line(&mut confirm).unwrap_or_default();

        confirm.trim().eq_ignore_ascii_case("y")
    }
}
