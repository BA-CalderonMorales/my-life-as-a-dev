//! Project information and navigation checking module.
//!
//! # Structure
//!
//! - `info.rs` - Project structure display
//! - `nav.rs` - Navigation coverage checking

mod info;
mod nav;

use std::io;
use std::path::PathBuf;

pub use info::Info;
pub use nav::NavChecker;

/// Provides project information and navigation utilities.
pub struct ProjectInfo {
    info: Info,
    nav_checker: NavChecker,
}

impl ProjectInfo {
    /// Create a new ProjectInfo.
    pub fn new(project_root: PathBuf) -> Self {
        Self {
            info: Info::new(project_root.clone()),
            nav_checker: NavChecker::new(project_root),
        }
    }

    /// Show project info.
    pub fn show(&self) -> io::Result<()> {
        self.info.show()
    }

    /// Check for pages not in navigation.
    pub fn nav_check(&self) -> io::Result<()> {
        self.nav_checker.check()
    }
}
