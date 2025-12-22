# Usage Guide

Learn how to use Terminal Jarvis effectively to manage and run AI coding tools.

## Interactive Mode (Recommended)

```bash
# Launch the full T.JARVIS experience
terminal-jarvis
```

Get the complete interface with:


- Beautiful ASCII art welcome screen
- Real-time tool status dashboard
- Quick tool selection and launching
- Built-in management options
- Smart guidance and tips

## Direct Commands

### Tool Management

```bash
terminal-jarvis install claude
terminal-jarvis update
terminal-jarvis list
terminal-jarvis info claude
```

### Running Tools

```bash
terminal-jarvis run claude --prompt "Refactor this function"
terminal-jarvis run gemini --file src/main.rs
terminal-jarvis run qwen --analyze
terminal-jarvis run opencode --generate
terminal-jarvis run llxprt --help
```

### Quick Tool Launch

Launch tools by name to enter an interactive session:

```bash
terminal-jarvis claude
terminal-jarvis gemini
terminal-jarvis qwen
```

## Tool Installation Workflow

### Installing Individual Tools

```bash
terminal-jarvis install claude
```

Terminal Jarvis will check system prerequisites, download and install the tool, verify installation, and provide next steps.

### Installing Multiple Tools

```bash
# Use interactive mode for batch installation
terminal-jarvis

# Then select "Install Tools" from the menu
# Choose multiple tools to install at once
```

### Updating Tools

```bash
# Update all installed tools
terminal-jarvis update

# Update specific tool
terminal-jarvis update claude
```

## Working with AI Tools

### Tool Information

```bash
# Get detailed information about a tool
terminal-jarvis info claude

# Shows:
# - Installation status
# - Version information
# - Authentication requirements
# - Available commands
# - Configuration options
```

### Authentication Flows

Terminal Jarvis handles authentication intelligently:


- **Browser-based auth**: Automatically detected and handled
- **API key auth**: Prompted when needed with clear instructions
- **Session continuation**: Returns to your workflow after auth
- **Graceful handling**: No cryptic error messages

### Session Management

```bash
# Start a coding session with Claude
terminal-jarvis claude

# Terminal Jarvis tracks:
# - Session state
# - Authentication status
# - Tool availability
# - Context preservation
```

## Advanced Features

### Configuration Management

```bash
# View current configuration
terminal-jarvis config

# Edit configuration
terminal-jarvis config edit

# Reset to defaults
terminal-jarvis config reset
```

### Theme Selection

```bash
# Terminal Jarvis supports multiple themes:
# - T.JARVIS Theme (default, professional blue)
# - Classic Theme (traditional grayscale)
# - Matrix Theme (green-on-black)

# Theme can be changed in interactive mode
terminal-jarvis
# Select "Settings" → "Change Theme"
```

### Tool Status Dashboard

```bash
# Check all tool statuses
terminal-jarvis list

# Shows for each tool:
# ✓ Installed and ready
# ✗ Not installed
# ⚠ Needs authentication
# ℹ Additional configuration required
```

## Common Workflows

### First-Time Setup

```bash
# 1. Install Terminal Jarvis
npm install -g terminal-jarvis

# 2. Launch interactive mode
terminal-jarvis

# 3. Install your preferred AI tools
# Select "Install Tools" from menu

# 4. Set up authentication
# Follow prompts for API keys
```

### Daily Usage

```bash
# Quick access to tools
terminal-jarvis claude    # Launch Claude
terminal-jarvis gemini    # Launch Gemini
terminal-jarvis qwen      # Launch Qwen

# Check what's available
terminal-jarvis list

# Update tools regularly
terminal-jarvis update
```

### Multi-Tool Workflows

```bash
# Use different tools for different tasks:

# Complex refactoring
terminal-jarvis claude --refactor

# Quick code generation
terminal-jarvis gemini --generate

# Code analysis
terminal-jarvis qwen --analyze

# Terminal-native workflows
terminal-jarvis opencode
```

## Tips and Best Practices

### Performance

- **Update regularly**: Keep tools updated for best performance
- **Session management**: Terminal Jarvis caches tool states
- **Concurrent updates**: Update all tools at once with `terminal-jarvis update`

### Troubleshooting

```bash
# Tool not found after installation?
# Restart your terminal or:
source ~/.bashrc  # or ~/.zshrc

# Authentication issues?
terminal-jarvis info <tool>
# Check the "Authentication" section for setup instructions

# Installation failed?
# Check prerequisites:
npm --version    # Node.js installed?
cargo --version  # Rust installed (macOS)?
```

### Keyboard Shortcuts (Interactive Mode)

- **Arrow Keys**: Navigate menu options
- **Enter**: Select option
- **Esc**: Go back / Exit
- **Ctrl+C**: Force quit

## Tool-Specific Usage

### Claude

```bash
terminal-jarvis claude
# or
terminal-jarvis run claude --prompt "Your request"
```

**Best for**: Complex reasoning, code refactoring, architectural decisions

### Gemini

```bash
terminal-jarvis gemini
# or  
terminal-jarvis run gemini --query "Your question"
```

**Best for**: Multi-modal tasks, code generation, natural language processing

### Qwen

```bash
terminal-jarvis qwen
# or
terminal-jarvis run qwen --analyze
```

**Best for**: Code completion, multi-language support, intelligent suggestions

### OpenCode

```bash
terminal-jarvis opencode
```

**Best for**: Terminal-native workflows, interactive code generation

### Other Tools

For complete information on all 10 supported tools, see the [AI Tools Guide](ai-tools.md).

## Getting Help

```bash
# General help
terminal-jarvis --help

# Command-specific help
terminal-jarvis install --help
terminal-jarvis run --help
terminal-jarvis update --help

# Tool information
terminal-jarvis info <tool-name>
```

## Next Steps

- [Configuration Guide](configuration.md) - Customize Terminal Jarvis
- [AI Tools Guide](ai-tools.md) - Explore all supported tools
- [Known Limitations](../details/limitations.md) - Current issues and workarounds
