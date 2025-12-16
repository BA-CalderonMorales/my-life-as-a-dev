use std::env;
use std::fs;
use std::io::{self, Write};
use std::path::PathBuf;
use std::process::{Command, Stdio};

fn main() {
    let mut app = DocCli::new();
    if let Err(e) = app.run() {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
}

// DocCli struct to handle all documentation utilities
struct DocCli {
    project_root: PathBuf,
    script_path: PathBuf,
    args: Vec<String>,
}

impl DocCli {
    // Create a new DocCli instance
    fn new() -> Self {
        let args: Vec<String> = env::args().collect();

        // Get current working directory and executable path
        let current_dir = env::current_dir().expect("Failed to get current directory");
        let current_exe = env::current_exe().expect("Failed to get current executable path");

        // Determine paths based on where we're running from
        let (project_root, script_path) = if current_exe.file_name().unwrap_or_default()
            == "doc-cli.exe"
            && current_dir.ends_with("my-life-as-a-dev")
        {
            // Running ./doc-cli.exe from project root
            let script_path = current_dir.join("scripts").join("rust");
            (current_dir, script_path)
        } else if current_exe
            .parent()
            .unwrap_or(&current_dir)
            .ends_with("target/release")
            || current_exe
                .parent()
                .unwrap_or(&current_dir)
                .ends_with("target/debug")
        {
            // Running from cargo build output: exe at scripts/rust/target/{release,debug}/doc-cli
            // Derive script_path = scripts/rust and project_root = repo root
            let exe_dir = current_exe.parent().unwrap_or(&current_dir); // .../target/{release,debug}
            let target_dir = exe_dir.parent().unwrap_or(exe_dir); // .../target
            let scripts_rust = target_dir.parent().unwrap_or(target_dir); // .../scripts/rust
            let project_root = scripts_rust
                .parent()
                .and_then(|p| p.parent())
                .unwrap_or(scripts_rust)
                .to_path_buf(); // repo root
            (project_root, scripts_rust.to_path_buf())
        } else {
            // Fallback: try to detect based on current directory
            if current_dir.ends_with("scripts/rust") || current_dir.ends_with("scripts\\rust") {
                let project_root = current_dir
                    .parent()
                    .and_then(|p| p.parent())
                    .unwrap_or(&current_dir)
                    .to_path_buf();
                (project_root, current_dir)
            } else {
                // Last resort: assume we're in project root
                let script_path = current_dir.join("scripts").join("rust");
                (current_dir.clone(), script_path)
            }
        };

        // Process command line arguments
        let mut filtered_args = Vec::new();

        for arg in &args {
            if arg == "--help" || arg == "-h" {
                // Handle help flag immediately
                let _ = Self::show_help();
                std::process::exit(0);
            } else {
                filtered_args.push(arg.clone());
            }
        }

        DocCli {
            args: filtered_args,
            script_path,
            project_root,
        }
    }

    // Main execution method
    fn run(&mut self) -> std::io::Result<()> {
        self.print_header();

        if self.args.len() <= 1 {
            self.print_menu()?;
            self.handle_user_choice()
        } else {
            let command = &self.args[1];
            self.handle_command(command)
        }
    }

    // Print header with tool name
    fn print_header(&self) {
        println!("\n{}", "=".repeat(60));
        println!("Zensical Documentation CLI Tool");
        println!("{}", "=".repeat(60));
    }

    // Print the main menu
    fn print_menu(&self) -> std::io::Result<()> {
        println!("\nAvailable commands:");
        println!("  1. serve         - Start Zensical development server");
        println!("  2. build         - Build site with Zensical");
        println!("  3. bump-version  - Bump the documentation version");
        println!("  4. deploy        - Deploy all versions to GitHub Pages");
        println!("  5. info          - Show project structure and config info");
        println!("  6. validate      - Validate site configuration");
        println!("  7. nav-check     - Check for pages not in navigation");
        println!("  h. help          - Show command help information");
        println!();
        println!("Tip: For local development: ./doc-cli serve");
        println!("Tip: Agent commands: info, validate, nav-check");
        println!();
        print!("Enter your choice (1-7 or h) or command name: ");
        io::stdout().flush()?;
        Ok(())
    }

    // Handle user choice from the menu
    fn handle_user_choice(&mut self) -> std::io::Result<()> {
        let mut choice = String::new();
        io::stdin()
            .read_line(&mut choice)
            .expect("Failed to read input");
        let choice = choice.trim();

        match choice {
            "1" | "serve" => self.handle_command("serve"),
            "2" | "build" => self.handle_command("build"),
            "3" | "bump-version" => self.handle_command("bump-version"),
            "4" | "deploy" => self.handle_command("deploy"),
            "5" | "info" => self.handle_command("info"),
            "6" | "validate" => self.handle_command("validate"),
            "7" | "nav-check" => self.handle_command("nav-check"),
            "h" | "help" => {
                Self::show_help()?;
                Ok(())
            }
            _ => {
                println!("Invalid choice: {}. Please try again.", choice);
                self.print_menu()?;
                self.handle_user_choice()
            }
        }
    }

    // Handle a specific command
    fn handle_command(&self, command: &str) -> std::io::Result<()> {
        match command {
            "serve" => self.run_zensical_serve(),
            "build" => self.run_zensical_build(),
            "mkdocs-serve" | "mkdocs_serve" | "startup" => self.run_startup(),
            "bump-version" | "bump_version" => self.run_bump_version(),
            "deploy" | "deploy-all-versions" | "deploy_all_versions" => {
                self.run_deploy_all_versions()
            }
            "info" => self.run_info(),
            "validate" => self.run_validate(),
            "nav-check" | "nav_check" => self.run_nav_check(),
            "help" | "--help" | "-h" => {
                Self::show_help()?;
                Ok(())
            }
            _ => {
                eprintln!("Unknown command: {}", command);
                eprintln!("Available commands: serve, build, info, validate, nav-check, bump-version, deploy, help");
                eprintln!("Use 'doc-cli help' to see more details about available commands.");
                std::process::exit(1);
            }
        }
    }

    // Show help information
    fn show_help() -> std::io::Result<()> {
        println!("\nDocumentation CLI Tool Help");
        println!("===========================\n");
        println!("Usage: doc-cli [COMMAND] [OPTIONS]");
        println!("\nPrimary Commands (Zensical):");
        println!("  serve                Start Zensical development server (port 8001)");
        println!("                       Modern static site generator, 20x faster builds");
        println!("  build                Build site with Zensical");
        println!();
        println!("Agent & Validation Commands:");
        println!("  info                 Show project structure and configuration info");
        println!("                       Useful for understanding the project layout");
        println!("  validate             Validate site configuration (zensical.toml)");
        println!("                       Checks for syntax errors and missing files");
        println!("  nav-check            Check for markdown files not in navigation");
        println!("                       Reports pages that may be orphaned");
        println!();
        println!("Legacy Commands (MkDocs):");
        println!("  mkdocs-serve         Start MkDocs development environment");
        println!("                       Sets up MkDocs with mike for versioned documentation");
        println!("    Options:");
        println!("      --local           Run in local mode (required outside Codespaces)");
        println!("      --clean           Use full rebuilds instead of dirty mode");
        println!("                        (slower but reliable when hot reload misbehaves)");
        println!(
            "      --draft-version VERSION   View a specific version not yet deployed to gh-pages"
        );
        println!();
        println!("Version & Deploy:");
        println!("  bump-version         Bump the documentation version");
        println!("  deploy               Deploy all versions of the documentation");
        println!("  help                 Show this help message");
        println!();
        println!("Configuration:");
        println!("  Primary config: zensical.toml (recommended for new development)");
        println!("  Legacy config:  mkdocs.yml (for MkDocs compatibility)");
        Ok(())
    }

    // Helper method to find rustc
    fn find_rustc(&self) -> Result<String, String> {
        // Try rustc directly first
        if Command::new("rustc").arg("--version").output().is_ok() {
            return Ok("rustc".to_string());
        }

        // Try common installation paths
        let common_paths = [
            "/usr/bin/rustc",
            "/usr/local/bin/rustc",
            "/opt/homebrew/bin/rustc",
        ];

        for path in &common_paths {
            if std::path::Path::new(path).exists() {
                return Ok(path.to_string());
            }
        }

        // Try to find via which command
        if let Ok(output) = Command::new("which").arg("rustc").output() {
            let path_string = String::from_utf8_lossy(&output.stdout);
            let path = path_string.trim();
            if !path.is_empty() && std::path::Path::new(path).exists() {
                return Ok(path.to_string());
            }
        }

        Err("rustc not found".to_string())
    }

    // Helper method to build a Rust binary
    fn build_rust_binary(&self, source_file: &str, binary_name: &str) -> Result<(), String> {
        let binary_path = self
            .script_path
            .join(format!("target/release/{}", binary_name));

        // Look for source file in the lib/ directory structure
        let source_path = self
            .script_path
            .join("lib")
            .join(source_file)
            .join("mod.rs");

        if !source_path.exists() {
            return Err(format!("Source file not found: {}", source_path.display()));
        }

        println!("{} binary not found. Building it first...", binary_name);

        // Ensure target directory exists
        std::fs::create_dir_all(self.script_path.join("target/release"))
            .map_err(|e| format!("Failed to create target directory: {}", e))?;

        // Find rustc
        let rustc_cmd = self.find_rustc().map_err(|_| {
            format!(
                "rustc not found. Please install Rust:\n\
                 - Visit https://rustup.rs/ to install Rust\n\
                 - Or install via package manager:\n\
                   Ubuntu/Debian: sudo apt install rustc\n\
                   Fedora: sudo dnf install rust\n\
                   Arch: sudo pacman -S rust\n\
                 - Make sure rustc is in your PATH"
            )
        })?;

        // Build the binary
        let status = Command::new(&rustc_cmd)
            .current_dir(&self.script_path)
            .args(&[
                "-o",
                binary_path.to_str().unwrap(),
                source_path.to_str().unwrap(),
            ])
            .status()
            .map_err(|e| format!("Failed to execute rustc: {}", e))?;

        if !status.success() {
            return Err(format!("Failed to build {} binary", binary_name));
        }

        Ok(())
    }

    // Execute the startup functionality
    fn run_startup(&self) -> std::io::Result<()> {
        println!("\n🚀 Running startup script...\n");

        let binary_path = self.script_path.join("target/release/startup");

        if !binary_path.exists() {
            if let Err(e) = self.build_rust_binary("startup", "startup") {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    format!("Failed to build startup binary: {}", e),
                ));
            }
        }

        // Get command line arguments (skip the first two: "doc-cli" and "startup")
        let mut args = Vec::new();
        let mut draft_version = None;
        let mut local_mode = false;
        let mut codespaces = false;

        if self.args.len() > 2 {
            let mut i = 2;
            while i < self.args.len() {
                if self.args[i] == "--draft-version" && i + 1 < self.args.len() {
                    draft_version = Some(self.args[i + 1].clone());
                    // Skip both the flag and its value
                    i += 2;
                } else if self.args[i] == "--local" {
                    local_mode = true;
                    i += 1;
                } else if self.args[i] == "--codespaces" {
                    codespaces = true;
                    i += 1;
                } else {
                    args.push(self.args[i].clone());
                    i += 1;
                }
            }
        }

        // Change to project root for environment setup
        env::set_current_dir(&self.project_root).map_err(|e| {
            std::io::Error::new(
                std::io::ErrorKind::NotFound,
                format!("Failed to change to project root directory: {}", e),
            )
        })?;

        // Set up command with explicit interactive I/O handling
        let mut cmd = Command::new(&binary_path);

        // Add draft version if specified
        if let Some(version) = draft_version {
            cmd.args(&["--draft-version", &version]);
            println!("Using draft version: {}", version);
        }

        // Add local mode if specified
        if local_mode {
            cmd.arg("--local");
        }

        // Add codespaces mode if specified
        if codespaces {
            cmd.arg("--codespaces");
        }

        // Add any other passed arguments
        if !args.is_empty() {
            cmd.args(&args);
        }

        // Explicitly inherit stdio for interactive use
        cmd.stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit());

        // Run the command and wait for completion
        let status = cmd.status()?;

        if !status.success() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Startup script failed with exit code: {}", status),
            ));
        }

        Ok(())
    }

    // Execute the bump-version functionality
    fn run_bump_version(&self) -> std::io::Result<()> {
        use std::io::{self, Write};

        println!("\n🔄 Running version bump script...\n");

        let binary_name = "bump_version";
        let binary_path = self
            .script_path
            .join(format!("target/release/{}", binary_name));

        if !binary_path.exists() {
            self.build_rust_binary(binary_name, binary_name)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
        }

        // Change to project root for git operations
        env::set_current_dir(&self.project_root)?;

        // Flush stdout before running the command
        io::stdout().flush()?;

        // Use the standard Command API with inherited stdio
        let status = Command::new(&binary_path)
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()?;

        if !status.success() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Bump version script failed with exit code: {}", status),
            ));
        }

        Ok(())
    }

    // Execute the deploy-all-versions functionality
    fn run_deploy_all_versions(&self) -> std::io::Result<()> {
        println!("\n🚀 Running deploy-all-versions script...\n");

        let binary_name = "deploy_all_versions";
        let binary_path = self
            .script_path
            .join(format!("target/release/{}", binary_name));

        if !binary_path.exists() {
            self.build_rust_binary(binary_name, binary_name)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
        }

        // Get command line arguments (skip the first two: "doc-cli" and "deploy")
        let mut args = Vec::new();
        if self.args.len() > 2 {
            args.extend_from_slice(&self.args[2..]);
        }

        // Change to project root for git operations
        env::set_current_dir(&self.project_root)?;

        // Set up command with explicit interactive I/O handling
        let mut cmd = Command::new(&binary_path);

        // Add any passed arguments
        if !args.is_empty() {
            cmd.args(&args);
        }

        // Explicitly inherit stdio for interactive use
        cmd.stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit());

        // Run the command and wait for completion
        let status = cmd.status()?;

        if !status.success() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!(
                    "Deploy-all-versions script failed with exit code: {}",
                    status
                ),
            ));
        }

        Ok(())
    }

    // Execute zensical serve command
    fn run_zensical_serve(&self) -> std::io::Result<()> {
        println!("\n🚀 Starting Zensical development server...\n");

        // Change to project root
        env::set_current_dir(&self.project_root)?;

        // Run zensical serve with default port 8001
        let status = Command::new("zensical")
            .args(&["serve", "-a", "0.0.0.0:8001"])
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()?;

        if !status.success() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Zensical serve failed with exit code: {}", status),
            ));
        }

        Ok(())
    }

    // Execute zensical build command
    fn run_zensical_build(&self) -> std::io::Result<()> {
        println!("\n🔨 Building site with Zensical...\n");

        // Change to project root
        env::set_current_dir(&self.project_root)?;

        // Run zensical build
        let status = Command::new("zensical")
            .arg("build")
            .stdin(Stdio::inherit())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()?;

        if !status.success() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Zensical build failed with exit code: {}", status),
            ));
        }

        println!("\n✅ Zensical build complete!");
        Ok(())
    }

    // Show project info - useful for agents to understand the project structure
    fn run_info(&self) -> std::io::Result<()> {
        println!("\n📁 Project Information");
        println!("{}", "=".repeat(60));
        
        println!("\n📍 Paths:");
        println!("  Project root:    {}", self.project_root.display());
        println!("  Docs directory:  {}/docs", self.project_root.display());
        println!("  Overrides:       {}/docs/overrides", self.project_root.display());
        println!("  Stylesheets:     {}/docs/stylesheets", self.project_root.display());
        
        println!("\n📄 Configuration Files:");
        let zensical_path = self.project_root.join("zensical.toml");
        let mkdocs_path = self.project_root.join("mkdocs.yml");
        
        if zensical_path.exists() {
            println!("  ✅ zensical.toml  (primary - Zensical config)");
        } else {
            println!("  ❌ zensical.toml  (missing)");
        }
        
        if mkdocs_path.exists() {
            println!("  ✅ mkdocs.yml     (legacy - MkDocs config)");
        } else {
            println!("  ❌ mkdocs.yml     (missing)");
        }
        
        println!("\n📂 Key Directories:");
        let key_dirs = [
            ("docs", "Documentation source files"),
            ("docs/overrides", "Theme overrides and partials"),
            ("docs/overrides/partials", "Custom partial templates"),
            ("docs/stylesheets", "Custom CSS styles"),
            ("docs/assets", "Static assets (images, etc.)"),
            ("scripts/rust", "Rust CLI tools source"),
        ];
        
        for (dir, desc) in key_dirs.iter() {
            let path = self.project_root.join(dir);
            if path.exists() {
                println!("  ✅ {}  - {}", dir, desc);
            } else {
                println!("  ❌ {}  - {} (missing)", dir, desc);
            }
        }
        
        // Count markdown files
        let docs_path = self.project_root.join("docs");
        if docs_path.exists() {
            let md_count = Self::count_files_with_extension(&docs_path, "md");
            println!("\n📊 Statistics:");
            println!("  Markdown files:  {}", md_count);
        }
        
        println!("\n💡 Tips for Agents:");
        println!("  - Use 'validate' to check configuration syntax");
        println!("  - Use 'nav-check' to find orphaned pages");
        println!("  - Use 'build' to verify all pages compile correctly");
        println!("  - Primary config is zensical.toml (preferred over mkdocs.yml)");
        
        Ok(())
    }
    
    // Count files with a specific extension recursively
    fn count_files_with_extension(dir: &PathBuf, ext: &str) -> usize {
        let mut count = 0;
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    count += Self::count_files_with_extension(&path, ext);
                } else if path.extension().map_or(false, |e| e == ext) {
                    count += 1;
                }
            }
        }
        count
    }
    
    // Validate site configuration
    fn run_validate(&self) -> std::io::Result<()> {
        println!("\n🔍 Validating Site Configuration");
        println!("{}", "=".repeat(60));
        
        let mut errors = Vec::new();
        let mut warnings = Vec::new();
        
        // Check zensical.toml exists and is readable
        let zensical_path = self.project_root.join("zensical.toml");
        if zensical_path.exists() {
            println!("\n📄 Checking zensical.toml...");
            match fs::read_to_string(&zensical_path) {
                Ok(content) => {
                    // Basic TOML syntax check - look for common issues
                    if content.contains("[project]") {
                        println!("  ✅ [project] section found");
                    } else {
                        errors.push("Missing [project] section in zensical.toml".to_string());
                    }
                    
                    if content.contains("site_name") {
                        println!("  ✅ site_name defined");
                    } else {
                        errors.push("Missing site_name in zensical.toml".to_string());
                    }
                    
                    if content.contains("nav = [") {
                        println!("  ✅ Navigation structure defined");
                    } else {
                        warnings.push("No navigation structure in zensical.toml".to_string());
                    }
                }
                Err(e) => {
                    errors.push(format!("Failed to read zensical.toml: {}", e));
                }
            }
        } else {
            errors.push("zensical.toml not found".to_string());
        }
        
        // Check docs directory
        let docs_path = self.project_root.join("docs");
        if docs_path.exists() {
            println!("\n📁 Checking docs directory...");
            
            let index_path = docs_path.join("index.md");
            if index_path.exists() {
                println!("  ✅ docs/index.md exists");
            } else {
                errors.push("Missing docs/index.md (home page)".to_string());
            }
            
            let overrides_path = docs_path.join("overrides");
            if overrides_path.exists() {
                println!("  ✅ docs/overrides directory exists");
            } else {
                warnings.push("Missing docs/overrides directory".to_string());
            }
        } else {
            errors.push("docs directory not found".to_string());
        }
        
        // Check custom CSS
        let css_path = self.project_root.join("docs/stylesheets/custom.css");
        if css_path.exists() {
            println!("\n🎨 Checking stylesheets...");
            println!("  ✅ custom.css exists");
        }
        
        // Summary
        println!("\n{}", "=".repeat(60));
        if errors.is_empty() && warnings.is_empty() {
            println!("✅ Validation passed! No issues found.");
        } else {
            if !errors.is_empty() {
                println!("❌ Errors ({}):", errors.len());
                for err in &errors {
                    println!("   - {}", err);
                }
            }
            if !warnings.is_empty() {
                println!("⚠️  Warnings ({}):", warnings.len());
                for warn in &warnings {
                    println!("   - {}", warn);
                }
            }
        }
        
        if !errors.is_empty() {
            std::process::exit(1);
        }
        
        Ok(())
    }
    
    // Check for pages not in navigation
    fn run_nav_check(&self) -> std::io::Result<()> {
        println!("\n🔍 Checking Navigation Coverage");
        println!("{}", "=".repeat(60));
        
        let docs_path = self.project_root.join("docs");
        if !docs_path.exists() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                "docs directory not found",
            ));
        }
        
        // Collect all markdown files
        let all_md_files = Self::collect_md_files(&docs_path, &docs_path);
        println!("\n📄 Found {} markdown files in docs/", all_md_files.len());
        
        // Read navigation from zensical.toml
        let zensical_path = self.project_root.join("zensical.toml");
        let nav_files: Vec<String> = if zensical_path.exists() {
            let content = fs::read_to_string(&zensical_path)?;
            Self::extract_nav_files(&content)
        } else {
            Vec::new()
        };
        
        println!("📋 Found {} files referenced in navigation", nav_files.len());
        
        // Find files not in navigation
        let mut orphaned: Vec<String> = Vec::new();
        let excluded_patterns = ["404.md", "print_page.md"];
        
        for file in &all_md_files {
            // Normalize path separators for comparison
            let file_normalized = file.replace('\\', "/");
            
            let is_in_nav = nav_files.iter().any(|nav_file| {
                let nav_normalized = nav_file.replace('\\', "/");
                // Check exact match or if file matches the nav path
                file_normalized == nav_normalized || 
                file_normalized.ends_with(&nav_normalized) ||
                nav_normalized.ends_with(&file_normalized)
            });
            
            let is_excluded = excluded_patterns.iter().any(|pat| file.ends_with(pat));
            
            if !is_in_nav && !is_excluded {
                orphaned.push(file.clone());
            }
        }
        
        println!("\n{}", "=".repeat(60));
        if orphaned.is_empty() {
            println!("✅ All markdown files are included in navigation!");
        } else {
            println!("⚠️  Found {} files not in navigation:", orphaned.len());
            for file in &orphaned {
                println!("   - {}", file);
            }
            println!("\n💡 To fix: Add these files to the nav section in zensical.toml");
        }
        
        Ok(())
    }
    
    // Collect all markdown files recursively
    fn collect_md_files(dir: &PathBuf, base: &PathBuf) -> Vec<String> {
        let mut files = Vec::new();
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    // Skip overrides and assets directories
                    let dir_name = path.file_name().unwrap_or_default().to_string_lossy();
                    if dir_name != "overrides" && dir_name != "assets" && dir_name != ".icons" {
                        files.extend(Self::collect_md_files(&path, base));
                    }
                } else if path.extension().map_or(false, |e| e == "md") {
                    if let Ok(rel_path) = path.strip_prefix(base) {
                        files.push(rel_path.to_string_lossy().to_string());
                    }
                }
            }
        }
        files
    }
    
    // Extract file paths from navigation in TOML content
    fn extract_nav_files(content: &str) -> Vec<String> {
        let mut files = Vec::new();
        // Simple regex-like extraction - look for .md files in quotes
        for line in content.lines() {
            let line = line.trim();
            // Look for patterns like: "path/to/file.md"
            if line.contains(".md") {
                // Extract the path between quotes
                if let Some(start) = line.find('"') {
                    if let Some(end) = line.rfind('"') {
                        if end > start {
                            let path = &line[start + 1..end];
                            if path.ends_with(".md") {
                                files.push(path.to_string());
                            }
                        }
                    }
                }
            }
        }
        files
    }
}
