# Usage Guide

Learn how to use Terminal Jarvis effectively to manage and run AI coding tools.

## Interactive Mode (Recommended)

```console
$ terminal-jarvis
```

Get the complete interface with:


- Beautiful ASCII art welcome screen
- Real-time tool status dashboard
- Quick tool selection and launching
- Built-in management options
- Smart guidance and tips

## Direct Commands

### Tool Management

```console
$ terminal-jarvis install claude
$ terminal-jarvis update               # Update all tools
$ terminal-jarvis list                # Show tool status
$ terminal-jarvis info claude         # Tool details
```

### Running Tools

```console
$ terminal-jarvis run claude --prompt "Refactor this function"
$ terminal-jarvis run gemini --file src/main.rs
$ terminal-jarvis run qwen --analyze
$ terminal-jarvis run opencode --generate
$ terminal-jarvis run llxprt --help
```

### Quick Tool Launch

```console
$ terminal-jarvis claude
$ terminal-jarvis gemini
$ terminal-jarvis qwen
```

## Tool Installation Workflow

### Installing Individual Tools

```console
$ terminal-jarvis install claude
```

### Installing Multiple Tools

```console
$ terminal-jarvis
```

### Updating Tools

```console
$ terminal-jarvis update

$ terminal-jarvis update claude
```

## Working with AI Tools

### Tool Information

```console
$ terminal-jarvis info claude
```

### Authentication Flows

Terminal Jarvis handles authentication intelligently:


- **Browser-based auth**: Automatically detected and handled
- **API key auth**: Prompted when needed with clear instructions
- **Session continuation**: Returns to your workflow after auth
- **Graceful handling**: No cryptic error messages

### Session Management

```console
$ terminal-jarvis claude
```

## Advanced Features

### Configuration Management

```console
$ terminal-jarvis config

$ terminal-jarvis config edit

$ terminal-jarvis config reset
```

### Theme Selection

```console
$ terminal-jarvis
```

### Tool Status Dashboard

```console
$ terminal-jarvis list
```

## Common Workflows

### First-Time Setup

```console
$ npm install -g terminal-jarvis

$ terminal-jarvis
```

### Daily Usage

```console
$ terminal-jarvis claude    # Launch Claude
$ terminal-jarvis gemini    # Launch Gemini
$ terminal-jarvis qwen      # Launch Qwen

$ terminal-jarvis list

$ terminal-jarvis update
```

### Multi-Tool Workflows

```console
$ terminal-jarvis claude --refactor

$ terminal-jarvis gemini --generate

$ terminal-jarvis qwen --analyze

$ terminal-jarvis opencode
```

## Tips and Best Practices

### Performance

- **Update regularly**: Keep tools updated for best performance
- **Session management**: Terminal Jarvis caches tool states
- **Concurrent updates**: Update all tools at once with `terminal-jarvis update`

### Troubleshooting

```console
$ source ~/.bashrc  # or ~/.zshrc

$ terminal-jarvis info <tool>

$ npm --version    # Node.js installed?
$ cargo --version  # Rust installed (macOS)?
```

### Keyboard Shortcuts (Interactive Mode)

- **Arrow Keys**: Navigate menu options
- **Enter**: Select option
- **Esc**: Go back / Exit
- **Ctrl+C**: Force quit

## Tool-Specific Usage

### Claude

```console
$ terminal-jarvis claude
$ terminal-jarvis run claude --prompt "Your request"
```

**Best for**: Complex reasoning, code refactoring, architectural decisions

### Gemini

```console
$ terminal-jarvis gemini
$ terminal-jarvis run gemini --query "Your question"
```

**Best for**: Multi-modal tasks, code generation, natural language processing

### Qwen

```console
$ terminal-jarvis qwen
$ terminal-jarvis run qwen --analyze
```

**Best for**: Code completion, multi-language support, intelligent suggestions

### OpenCode

```console
$ terminal-jarvis opencode
```

**Best for**: Terminal-native workflows, interactive code generation

### Other Tools

For complete information on all 10 supported tools, see the [AI Tools Guide](ai-tools.md).

## Getting Help

```console
$ terminal-jarvis --help

$ terminal-jarvis install --help
$ terminal-jarvis run --help
$ terminal-jarvis update --help

$ terminal-jarvis info <tool-name>
```

## Next Steps

- [Configuration Guide](configuration.md) - Customize Terminal Jarvis
- [AI Tools Guide](ai-tools.md) - Explore all supported tools
- [Known Limitations](../details/limitations.md) - Current issues and workarounds
