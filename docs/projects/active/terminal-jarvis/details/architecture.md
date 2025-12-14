# Architecture and Technical Details

This document provides a comprehensive technical overview of Terminal Jarvis's architecture, design patterns, and internal structure.

## Project Structure

The project follows a domain-based modular architecture designed for maintainability, extensibility, and clear separation of concerns:

```
src/
├── main.rs                    # Entry point - minimal code, delegates to CLI
├── lib.rs                     # Library entry point for module organization
├── cli.rs                     # Clean, expressive CLI interface definitions
├── installation_arguments.rs # Installation commands and NPM validation
├── progress_utils.rs          # Theme-integrated messaging and progress indicators
│
├── cli_logic/                 # Business logic domain (9 focused modules)
│   ├── mod.rs                 # Module coordination and re-exports
│   ├── cli_logic_entry_point.rs        # Main CLI logic entry point
│   ├── cli_logic_interactive.rs        # Interactive T.JARVIS interface
│   ├── cli_logic_tool_execution.rs     # Tool execution workflows
│   ├── cli_logic_update_operations.rs  # Tool update management
│   ├── cli_logic_list_operations.rs    # Tool listing operations
│   ├── cli_logic_info_operations.rs    # Tool information display
│   ├── cli_logic_config_management.rs  # Configuration management
│   ├── cli_logic_template_operations.rs # Template system operations
│   └── cli_logic_utilities.rs          # Shared utility functions
│
├── auth_manager/              # Authentication domain (5 focused modules)
│   ├── mod.rs                 # Module coordination and re-exports
│   ├── auth_entry_point.rs            # Authentication system entry point
│   ├── auth_environment_detection.rs  # Environment detection logic
│   ├── auth_environment_setup.rs      # Environment configuration
│   ├── auth_api_key_management.rs     # API key handling
│   └── auth_warning_system.rs         # Browser prevention warnings
│
├── config/                    # Configuration domain (5 focused modules)
│   ├── mod.rs                 # Module coordination and re-exports
│   ├── config_entry_point.rs          # Configuration system entry point
│   ├── config_structures.rs           # TOML configuration structures
│   ├── config_file_operations.rs      # File I/O operations
│   ├── config_manager.rs              # Configuration management logic
│   └── config_version_cache.rs        # Version caching system
│
├── services/                  # External integrations domain (5 focused modules)
│   ├── mod.rs                 # Module coordination and re-exports
│   ├── services_entry_point.rs        # Service layer entry point
│   ├── services_package_operations.rs # Package management operations
│   ├── services_npm_operations.rs     # NPM-specific operations
│   ├── services_github_integration.rs # GitHub CLI integration
│   └── services_tool_configuration.rs # Tool configuration mapping
│
├── theme/                     # UI theming domain (7 focused modules)
│   ├── mod.rs                 # Module coordination and re-exports
│   ├── theme_entry_point.rs           # Theme system entry point
│   ├── theme_definitions.rs           # Theme color definitions
│   ├── theme_config.rs                # Theme configuration management
│   ├── theme_global_config.rs         # Global theme state
│   ├── theme_background_layout.rs     # Background and layout styling
│   ├── theme_text_formatting.rs       # Text formatting utilities
│   └── theme_utilities.rs             # Theme utility functions
│
├── tools/                     # Tool management domain (6 focused modules)
│   ├── mod.rs                 # Module coordination and re-exports
│   ├── tools_entry_point.rs           # Tool system entry point
│   ├── tools_detection.rs             # Tool detection and verification
│   ├── tools_command_mapping.rs       # Command-to-tool mapping
│   ├── tools_execution_engine.rs      # Tool execution engine
│   ├── tools_process_management.rs    # Process lifecycle management
│   └── tools_startup_guidance.rs      # Tool startup guidance system
│
└── api/                       # API framework domain (4 focused modules)
    ├── mod.rs                 # Module coordination and re-exports
    ├── api_base.rs            # Base API route configurations
    ├── api_client.rs          # HTTP client abstraction layer
    └── api_tool_operations.rs # API tool operation endpoints
```

## Architecture Philosophy

### Domain Architecture

- **`main.rs` & `lib.rs`**: Minimal entry points that delegate to domain modules
- **`cli.rs`**: Expressive command definitions with optional subcommands (defaults to interactive mode)
- **`cli_logic/`**: Complete business logic domain including the interactive T.JARVIS interface, tool execution workflows, and operation management
- **`auth_manager/`**: Authentication domain with environment detection, browser prevention, and API key management
- **`config/`**: Configuration domain handling TOML file operations, structure management, and version caching
- **`services/`**: External integrations domain for package management, NPM operations, and GitHub CLI integration
- **`theme/`**: UI theming domain with color definitions, global state management, and formatting utilities
- **`tools/`**: Tool management domain covering detection, command mapping, execution, and process lifecycle
- **`api/`**: API framework domain for future web integrations (currently unused)

### Design Principles

1. **Domain-Driven Design**: Each module represents a distinct business domain
2. **Single Responsibility**: Modules handle one aspect of functionality
3. **Clear Dependencies**: Explicit imports, minimal coupling
4. **Testability**: Pure functions, dependency injection patterns
5. **Maintainability**: Small, focused files (~200-300 lines each)

## Configuration System

Terminal Jarvis uses a **modular configuration system** stored in `config/tools/`:

```
config/
├── tools/
│   ├── claude.toml      # Anthropic Claude configuration
│   ├── gemini.toml      # Google Gemini configuration
│   ├── qwen.toml        # Qwen coding assistant configuration
│   ├── opencode.toml
│   ├── llxprt.toml
│   ├── codex.toml
│   ├── crush.toml
│   ├── goose.toml
│   ├── amp.toml
│   └── aider.toml
└── config.toml          # Global Terminal Jarvis settings
```

### Tool Configuration Structure

Each tool configuration file contains:

```toml
[tool]
display_name = "Tool Name"
config_key = "tool-key"
description = "Tool description"
cli_command = "tool-command"
requires_npm = true
status = "stable"

[tool.install]
command = "npm"
args = ["install", "-g", "package-name"]
verify_command = "tool --version"

[tool.auth]
env_vars = ["TOOL_API_KEY"]
setup_url = "https://tool-setup-url"
auth_instructions = "Setup instructions"
```

### Benefits of Modular Configuration

- **Automatic Discovery**: New tools added to `config/tools/` are automatically available
- **Clear Separation**: Per-tool install/auth/feature metadata
- **Reduced Drift**: Documentation and implementation stay in sync
- **Database Ready**: Structure supports future database integration

## NPM Package Structure

```
npm/terminal-jarvis/
├── package.json           # NPM package configuration
├── bin/
│   └── terminal-jarvis   # Binary wrapper
├── src/
│   └── index.ts          # TypeScript entry point
├── dist/                  # Compiled JavaScript
└── biome.json            # Biome linting configuration
```

### Package Architecture

- **Rust Binary**: Pre-compiled for immediate functionality
- **TypeScript Wrapper**: NPM integration layer
- **Zero Dependencies**: Self-contained, no runtime dependencies

## Theme System Architecture (v0.0.56+)

### Core Theme Components

**`theme.rs`**: Theme definitions with complete ANSI color palettes

- **T.JARVIS Theme**: Professional blue-based corporate theme with cyan accents
- **Classic Theme**: Traditional grayscale terminal aesthetic 
- **Matrix Theme**: Green-on-black retro computing style
- **Color Management**: Comprehensive ANSI escape code handling

**`theme_config.rs`**: Global theme state and configuration management

- **Runtime Theme Switching**: Dynamic theme changes without restart
- **Theme Persistence**: User preferences maintained across sessions
- **Global State**: Centralized theme state accessible throughout application

**`progress_utils.rs`**: Theme-integrated messaging system

- **Consistent Colors**: All messages use current theme's color palette
- **Professional Presentation**: Success, warning, and error messages with themed colors
- **T.JARVIS Branding**: Integrated T.JARVIS advisory system

## Authentication System

### Environment Detection

The authentication manager detects various environments:


- **CI/CD Systems**: GitHub Actions, GitLab CI, CircleCI, Travis CI
- **Cloud Environments**: Codespaces, Gitpod, Cloud9
- **SSH Sessions**: Remote terminal sessions
- **Containers**: Docker, Podman environments
- **Headless Systems**: No display server available

### Browser Prevention

When headless environments are detected:

1. Sets `NO_BROWSER` environment variables
2. Displays clear warnings about authentication requirements
3. Provides API key setup instructions
4. Prevents hanging on browser-based auth flows

### API Key Management

- Validates environment variables before tool launch
- Provides setup URLs and instructions
- Graceful handling of missing credentials
- Integration with tool-specific auth flows

## Tool Execution Engine

### Execution Flow

1. **Pre-flight Checks**: Verify tool installation and authentication
2. **Environment Setup**: Configure NO_BROWSER flags if needed
3. **Process Spawn**: Launch tool with proper stdio handling
4. **Session Management**: Track tool state and handle signals
5. **Continuation Support**: Seamlessly resume after auth flows
6. **Cleanup**: Proper process termination and resource cleanup

### Special Tool Handling

**OpenCode**: Requires initial delay for terminal state preparation

```rust
// OpenCode-specific initialization
if tool == "opencode" {
    tokio::time::sleep(Duration::from_millis(500)).await;
}
```

**Gemini**: API key validation before execution

**Qwen**: Dashboard/scope detection and API key management

## Installation System

### Multi-Method Installation Support

Terminal Jarvis supports three installation methods:

1. **NPM-based**: Standard npm install commands
2. **curl-based**: Publisher-provided installation scripts (Goose)
3. **uv-based**: Python package installation (Aider)

### Installation Flow

```rust
1. Check prerequisites (npm, curl, uv availability)
2. Execute installation command
3. Verify installation success
4. Cache tool status
5. Provide next steps
```

### Validation

- Verifies package existence on NPM registry
- Checks binary availability post-install
- Tests version commands
- Updates internal tool state

## Adding New Tools

### Steps to Add a Tool

1. **Create tool configuration** in `config/tools/`:

```toml
[tool]
display_name = "New Tool"
config_key = "newtool"
description = "New AI coding tool"
cli_command = "newtool"
requires_npm = true
status = "testing"

[tool.install]
command = "npm"
args = ["install", "-g", "newtool-package"]
verify_command = "newtool --version"

[tool.auth]
env_vars = ["NEWTOOL_API_KEY"]
setup_url = "https://example.com/newtool/setup"
auth_instructions = "Visit setup URL to get API key"
```

2. **Tool automatically discovered**: No code changes needed!

3. **Test the integration**:

```bash
terminal-jarvis list        # Should show new tool
terminal-jarvis info newtool
terminal-jarvis install newtool
```

This modular approach ensures new tools integrate cleanly with detection, info display, and execution while keeping changes isolated.

## Testing Strategy

### Test Coverage

Terminal Jarvis has 33 comprehensive tests covering:

1. **Tool Management**: Installation, updates, detection
2. **Configuration System**: TOML parsing, validation
3. **CLI Interface**: Command parsing, help output
4. **Authentication**: Environment detection, browser prevention
5. **Package Management**: NPM operations, version checks

### Test Scripts

- **`smoke-test.sh`**: Quick validation of core functionality
- **`test-core-functionality.sh`**: Comprehensive test suite
- **`local-ci.sh`**: Full CI pipeline validation

## Performance Considerations

### Caching

- **Tool Status**: Cached after first detection
- **Version Information**: Cached with configurable TTL
- **Configuration**: Loaded once and cached in memory

### Concurrent Operations

- **Tool Updates**: Parallel updates for multiple tools
- **Installation**: Concurrent prerequisite checks
- **Detection**: Parallel tool verification

### Resource Management

- **Process Cleanup**: Proper signal handling and termination
- **File Descriptors**: Careful stdio management
- **Memory**: Efficient data structures, minimal allocations

## Future Architecture Plans

### Database Integration

- Move from TOML files to database storage
- Support for tool usage analytics
- User preference storage
- Session history tracking

### API Layer

The `api/` domain is prepared for:


- RESTful API endpoints
- Tool management via HTTP
- Remote tool execution
- Web dashboard integration

### Plugin System

Future support for:


- Custom tool definitions
- User-contributed integrations
- Dynamic tool loading
- Extension marketplace

## Development Guidelines

### Module Organization

- Keep files focused and small (200-300 lines)
- Use `mod.rs` for module coordination
- Clear re-exports from `mod.rs`
- Consistent naming: `{module}_{domain}_{operation}.rs`

### Error Handling

- Use `anyhow::Result` for error propagation
- Provide context with `.context()`
- User-friendly error messages
- Graceful degradation where possible

### Code Style

- Run `cargo fmt` before commits
- Pass `cargo clippy` with no warnings
- Add doc comments for public APIs
- Follow Rust naming conventions

## Next Steps

- [Testing Guide](testing.md) - Testing strategies and workflows
- [Contributing Guide](contributions.md) - How to contribute to Terminal Jarvis
- [Configuration Guide](../quick_start/configuration.md) - Customize Terminal Jarvis
