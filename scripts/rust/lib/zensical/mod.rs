//! Zensical server management module.
//!
//! # Structure
//!
//! - `server.rs` - Server start/build operations
//! - `process.rs` - Process management (kill)

mod process;
mod server;

use std::io;
use std::path::PathBuf;

pub use process::ProcessManager;
pub use server::Server;

/// Manages Zensical server operations.
///
/// Provides a unified interface for serve, build, and kill.
pub struct ZensicalManager {
    server: Server,
}

impl ZensicalManager {
    /// Create a new ZensicalManager.
    pub fn new(project_root: PathBuf) -> Self {
        Self {
            server: Server::new(project_root),
        }
    }

    /// Get the path to zensical binary.
    pub fn get_zensical_path(&self) -> String {
        self.server.get_zensical_path()
    }

    /// Start the Zensical development server.
    pub fn serve(&self) -> io::Result<()> {
        self.server.serve()
    }

    /// Build the site with Zensical.
    pub fn build(&self) -> io::Result<()> {
        self.server.build()
    }

    /// Kill any running Zensical/MkDocs processes.
    pub fn kill(&self) -> io::Result<()> {
        let killed_count = ProcessManager::kill_all()?;

        if killed_count > 0 {
            println!("\n Stopped {} process(es)", killed_count);
        } else {
            println!("\n No running Zensical/MkDocs processes found");
        }

        Ok(())
    }

    /// Check if Zensical is currently running.
    pub fn is_running(&self) -> bool {
        self.server.is_running()
    }

    /// Restart the server (kill then serve).
    pub fn restart(&self) -> io::Result<()> {
        self.kill()?;
        std::thread::sleep(std::time::Duration::from_millis(1000));
        self.serve()
    }
}
