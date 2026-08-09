---
comments: true
---

# Configuration Guide

Customize Terminal Jarvis behavior through configuration files and modular tool definitions.

## Configuration Locations (in priority order)

- `./terminal-jarvis.toml` (project-specific)
- `~/.config/terminal-jarvis/config.toml` (user-wide)

## Tool Configuration Architecture

Terminal Jarvis uses a modular configuration system with individual tool definitions stored in the `config/tools/` directory:

```
config/
├── tools/           # Individual tool configurations
│   ├── aider.toml
│   ├── amp.toml
│   ├── claude.toml  # Anthropic Claude configuration
│   ├── codex.toml
│   ├── crush.toml
│   ├── gemini.toml  # Google Gemini configuration
│   ├── goose.toml
│   ├── llxprt.toml
│   ├── opencode.toml
│   └── qwen.toml    # Qwen coding assistant
└── config.toml      # Global Terminal Jarvis settings
```

## Tool Definition Structure

Each tool configuration in `config/tools/` follows this structure:

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

## Configuration Examples

### Claude Configuration

```toml
[tool]
display_name = "Claude"
config_key = "claude"
description = "Anthropic's Claude for advanced reasoning and code assistance"
cli_command = "claude"
requires_npm = true
status = "stable"

[tool.install]
command = "npm"
args = ["install", "-g", "@anthropic-ai/claude-code"]
verify_command = "claude --version"

[tool.auth]
env_vars = ["ANTHROPIC_API_KEY"]
setup_url = "https://console.anthropic.com"
auth_instructions = "Get your API key from Anthropic Console"
```

### Gemini Configuration

```toml
[tool]
display_name = "Gemini"
config_key = "gemini"
description = "Google's Gemini for multi-modal AI assistance"
cli_command = "gemini"
requires_npm = true
status = "stable"

[tool.install]
command = "npm"
args = ["install", "-g", "@google/gemini-cli"]
verify_command = "gemini --version"

[tool.auth]
env_vars = ["GEMINI_API_KEY"]
setup_url = "https://makersuite.google.com/app/apikey"
auth_instructions = "Get your API key from Google AI Studio"
```

### Goose Configuration (curl-based)

```toml
[tool]
display_name = "Goose"
config_key = "goose"
description = "Block's Goose AI coding assistant"
cli_command = "goose"
requires_npm = false
status = "stable"

[tool.install]
command = "curl"
args = ["-fsSL", "https://github.com/block/goose/releases/download/stable/download_cli.sh"]
pipe_to = "bash"
verify_command = "goose --version"

[tool.auth]
env_vars = []
setup_url = ""
auth_instructions = "Goose works out of the box"
```

### Aider Configuration (uv-based)

```toml
[tool]
display_name = "Aider"
config_key = "aider"
description = "AI pair programming in your terminal"
cli_command = "aider"
requires_npm = false
status = "stable"

[tool.install]
command = "uv"
args = ["tool", "install", "--force", "--python", "python3.12", "--with", "pip", "aider-chat@latest"]
verify_command = "aider --version"

[tool.auth]
env_vars = ["OPENAI_API_KEY"]
setup_url = "https://platform.openai.com/api-keys"
auth_instructions = "Set OPENAI_API_KEY environment variable"
```

## Global Configuration

### config.toml Structure

```toml
[general]
theme = "t.jarvis"  # Options: "t.jarvis", "classic", "matrix"
auto_update = true
check_updates = true

[tools]
# Tool-specific overrides (optional)
claude.enabled = true
gemini.enabled = true
qwen.enabled = true

[ui]
show_ascii_art = true
colored_output = true
```

## Environment Variables

Terminal Jarvis respects these environment variables:

### Authentication

```bash
# Claude
export ANTHROPIC_API_KEY="your-key-here"

# Gemini
export GEMINI_API_KEY="your-key-here"

# Qwen
export DASHSCOPE_API_KEY="your-key-here"

# Codex
export OPENAI_API_KEY="your-key-here"

# Aider
export OPENAI_API_KEY="your-key-here"
```

### Tool Behavior

```bash
# Prevent browser opening in headless/CI environments
export CODEX_NO_BROWSER=1
export GEMINI_NO_BROWSER=1

# Custom configuration directory
export TERMINAL_JARVIS_CONFIG_DIR="$HOME/.config/terminal-jarvis"
```

## Customization

### Adding Custom Tool Configurations

1. Create a new TOML file in `config/tools/`:

```bash
touch config/tools/my-tool.toml
```

2. Define the tool structure:

```toml
[tool]
display_name = "My Tool"
config_key = "my-tool"
description = "Custom AI tool"
cli_command = "my-tool"
requires_npm = true
status = "testing"

[tool.install]
command = "npm"
args = ["install", "-g", "my-tool-package"]
verify_command = "my-tool --version"

[tool.auth]
env_vars = ["MY_TOOL_API_KEY"]
setup_url = "https://my-tool.com/setup"
auth_instructions = "Get your API key from My Tool"
```

3. Terminal Jarvis will automatically discover the new tool.

### Theme Configuration

Create a custom theme by modifying the global config:

```toml
[ui]
theme = "custom"

[ui.colors]
primary = "#00FF00"
secondary = "#0000FF"
accent = "#FF0000"
success = "#00FF00"
warning = "#FFA500"
error = "#FF0000"
```

## Configuration Commands

```bash
# View current configuration
terminal-jarvis config

# Edit configuration file
terminal-jarvis config edit

# Reset to defaults
terminal-jarvis config reset

# Validate configuration
terminal-jarvis config validate
```

## Tool Information

To see the exact configuration for any tool:

```bash
terminal-jarvis info <tool>
```

This displays:


- Installation status
- Configuration key
- CLI command
- Install command
- Authentication requirements
- Setup instructions

## Configuration Consistency

Terminal Jarvis uses a modular configuration system with these benefits:


- **Automatic discovery**: New tools added to `config/tools/` are automatically available
- **Clear separation**: Per-tool install/auth/feature metadata
- **Reduced drift**: Documentation and implementation stay in sync
- **Easy maintenance**: Add or modify tools without touching core code

## Troubleshooting Configuration

### Configuration Not Loading

```bash
# Check configuration file location
terminal-jarvis config --path

# Validate configuration syntax
terminal-jarvis config validate
```

### Tool Not Appearing

```bash
# Verify tool configuration exists
ls ~/.config/terminal-jarvis/config/tools/

# Check tool is properly defined
terminal-jarvis info <tool-name>
```

### Authentication Issues

```bash
# Check environment variables
echo $ANTHROPIC_API_KEY
echo $GEMINI_API_KEY

# View authentication requirements
terminal-jarvis info <tool-name>
```

## Best Practices

### Security

- **Never commit API keys**: Use environment variables or `.env` files
- **Use `.gitignore`**: Add `terminal-jarvis.toml` to project `.gitignore` if it contains secrets
- **Rotate keys regularly**: Update API keys periodically

### Organization

- **Project-specific configs**: Use `./terminal-jarvis.toml` for project overrides
- **User-wide defaults**: Set preferences in `~/.config/terminal-jarvis/config.toml`
- **Version control**: Commit tool selections but not credentials

### Performance

- **Disable unused tools**: Set `enabled = false` for tools you don't use
- **Auto-updates**: Enable `auto_update = true` for convenience
- **Cache settings**: Terminal Jarvis caches tool states for faster startups

## Next Steps

- [Usage Guide](usage.md) - Learn how to use Terminal Jarvis effectively
- [AI Tools Guide](ai-tools.md) - Explore all supported tools
- [Architecture](../details/architecture.md) - Understand the technical internals
