# Supported AI Coding Tools

Terminal Jarvis supports a comprehensive suite of AI coding tools with seamless installation, updates, and execution. This guide is the authoritative reference for all supported tools.

!!! info "Configuration Source"
    The definitive source of truth is the modular configs in `config/tools/*.toml` and the CLI output from `terminal-jarvis list` and `terminal-jarvis info <tool>`.

## Complete Tool Overview

Terminal Jarvis currently supports **10 AI coding tools**:


- claude
- gemini
- qwen
- opencode
- llxprt
- codex
- crush
- goose
- amp
- aider

## Tool Status Indicators

- **Stable** - Production-ready, thoroughly tested
- **Testing** - Feature-complete, seeking community feedback  
- **New** - Recently added, actively being integrated

## Detailed Tool Information

### Claude (Anthropic)

**Status**: Stable  
**GitHub**: [anthropics/claude-code](https://github.com/anthropics/claude-code)  
**Installation**: `npm install -g @anthropic-ai/claude-code`

**Key Features**:


- Advanced reasoning capabilities
- Code analysis and refactoring
- Architectural design assistance
- Natural language understanding

**Authentication**: Requires `ANTHROPIC_API_KEY`  
**Setup**: Get your API key from [Anthropic Console](https://console.anthropic.com)

---

### Gemini (Google)

**Status**: Stable  
**GitHub**: [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)  
**Installation**: `npm install -g @google/gemini-cli`

**Key Features**:


- Multi-modal AI capabilities
- Code generation
- Natural language processing
- Image and text understanding

**Authentication**: Requires `GEMINI_API_KEY`  
**Setup**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

---

### Qwen (Alibaba)

**Status**: Stable  
**GitHub**: [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code)  
**Installation**: `npm install -g @qwen-code/qwen-code@latest`

**Key Features**:


- Code completion
- Multi-language support
- Intelligent suggestions
- Context-aware assistance

**Authentication**: Requires `DASHSCOPE_API_KEY`  
**Setup**: Get your API key from [DashScope](https://dashscope.aliyun.com)

---

### OpenCode (OpenCode AI)

**Status**: Testing  
**GitHub**: [sst/opencode](https://github.com/sst/opencode)  
**Installation**: `npm install -g opencode-ai@latest`

**Key Features**:


- Terminal-native interface
- Code generation
- Interactive workflows
- Fast iteration cycles

**Authentication**: May require API key setup  
**Setup**: Follow prompts during first launch

---

### LLXprt (VybeStack)

**Status**: Testing  
**GitHub**: [acoliver/llxprt-code](https://github.com/acoliver/llxprt-code)  
**Installation**: `npm install -g @vybestack/llxprt-code`

!!! warning "Package Name"
    Use `@vybestack/llxprt-code` exactly. Avoid similarly named packages.

**Key Features**:


- Multi-provider support
- Flexible AI backends
- Extensible architecture
- Provider switching

**Authentication**: Varies by backend provider  
**Setup**: Configure preferred AI provider

---

### Codex (OpenAI)

**Status**: Testing/Legacy  
**GitHub**: [openai/codex](https://github.com/openai/codex)  
**Installation**: `npm install -g @openai/codex`

**Key Features**:


- Local AI processing
- Code completion
- OpenAI integration
- Development assistant

**Authentication**: Requires `OPENAI_API_KEY`  
**Setup**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

---

### Crush (Charm)

**Status**: New  
**GitHub**: [charmbracelet/crush](https://github.com/charmbracelet/crush)  
**Installation**: `npm install -g @charmland/crush`

**Key Features**:


- LSP protocol support
- Multi-model AI
- MCP (Model Context Protocol) integration
- Beautiful TUI interface

**Authentication**: Configuration depends on selected models  
**Setup**: Interactive setup on first launch

---

### Goose (Block)

**Status**: Stable  
**GitHub**: [block/goose](https://github.com/block/goose)  
**Installation**: `curl -fsSL https://github.com/block/goose/releases/download/stable/download_cli.sh | bash`

!!! info "Installation Method"
    Goose uses a publisher-provided installation script, not NPM.

**Key Features**:


- Terminal-native workflows
- Code analysis
- Refactoring assistance
- Project-wide operations

**Authentication**: Works out of the box (may support optional API keys)  
**Setup**: Run `goose` after installation

---

### Amp (Sourcegraph)

**Status**: Stable  
**GitHub**: [sourcegraph/amp](https://github.com/sourcegraph/amp)  
**Installation**: `npm install -g @sourcegraph/amp`

**Key Features**:


- Code search integration
- Sourcegraph connectivity
- Repository analysis
- Codebase understanding

**Authentication**: May require Sourcegraph account  
**Setup**: Follow prompts during first launch

---

### Aider (Aider Chat)

**Status**: Stable  
**GitHub**: [paul-gauthier/aider](https://github.com/paul-gauthier/aider)  
**Installation**: `uv tool install --force --python python3.12 --with pip aider-chat@latest`

!!! info "Installation Method"
    Aider uses `uv` (Python package installer), not NPM.

**Key Features**:


- AI pair programming
- Git integration
- Interactive coding sessions
- Context-aware suggestions

**Authentication**: Requires `OPENAI_API_KEY`  
**Setup**: Set environment variable before running

---

## Quick Reference Table

| Tool        | Package name (if NPM)         | Install command                               | Status   |
| ----------- | ----------------------------- | --------------------------------------------- | -------- |
| claude      | `@anthropic-ai/claude-code`   | `npm install -g @anthropic-ai/claude-code`    | Stable   |
| gemini      | `@google/gemini-cli`          | `npm install -g @google/gemini-cli`           | Stable   |
| qwen        | `@qwen-code/qwen-code`        | `npm install -g @qwen-code/qwen-code@latest`  | Stable   |
| opencode    | `opencode-ai`                 | `npm install -g opencode-ai@latest`           | Testing  |
| llxprt      | `@vybestack/llxprt-code`      | `npm install -g @vybestack/llxprt-code`       | Testing  |
| codex       | `@openai/codex`               | `npm install -g @openai/codex`                | Testing  |
| crush       | `@charmland/crush`            | `npm install -g @charmland/crush`             | New      |
| goose       | n/a (curl)                    | `curl ... \| bash` (see above)                | Stable   |
| amp         | `@sourcegraph/amp`            | `npm install -g @sourcegraph/amp`             | Stable   |
| aider       | n/a (uv)                      | `uv tool install ... aider-chat@latest`       | Stable   |

## Quick Usage with Terminal Jarvis

### Tool Management

```bash
terminal-jarvis install claude
terminal-jarvis install crush
terminal-jarvis install goose
terminal-jarvis install amp
terminal-jarvis install aider
terminal-jarvis update
terminal-jarvis list
terminal-jarvis info claude
```

## Installation Verification

After installing any tool, verify it works correctly:

```bash
# Test basic functionality
claude --version
gemini --version
qwen --version
opencode --version
llxprt --version
codex --version
crush --version
goose --version
amp --version
aider --version

# Or test help commands if version fails
claude --help
gemini --help
# ... etc
```

## Terminal Jarvis Configuration Consistency

Terminal Jarvis uses a modular configuration system. Each tool has its own TOML file under `config/tools/` (for example, `config/tools/claude.toml`, `config/tools/gemini.toml`, etc.). The app automatically discovers and loads these definitions.

**Benefits**:


- Automatic discovery of new tools added to `config/tools/`
- Clear separation of per-tool install/auth/feature metadata
- Reduced drift between docs and implementation

**To see exact configuration**:

```bash
terminal-jarvis info <tool>
```

## Common Installation Issues

### Command Not Found After Installation

**Solution**: Restart terminal or run:

```bash
source ~/.bashrc  # or ~/.zshrc
```

### Permission Errors During Installation

**Solution**: Use Node Version Manager (nvm) instead of system Node.js:

Install nvm first, then:

```bash
nvm install node
npm install -g [package-name]
```

### Wrong Package Installed

**Solution**: Always use the exact package names from the tables above.

!!! danger "Critical"
    Use `@vybestack/llxprt-code` for llxprt. Avoid similarly named packages that map to other tools.

### Authentication/Configuration Issues

Terminal Jarvis v0.0.44+ handles authentication gracefully. You'll see `[INFO] [tool] session ended` instead of error messages for normal authentication flows like `/auth` or `/config` commands.

## Security and Maintenance

### API Key Security

- Store API keys in environment variables, never in code
- Use `.env` files (add to `.gitignore`)
- Rotate keys regularly
- Use project-specific keys when possible

### Tool Updates

```bash
# Update all tools at once
terminal-jarvis update

# Update specific tool
terminal-jarvis update claude
```

### Verifying Tool Integrity

All tools are installed from official sources:


- NPM packages from official publishers
- GitHub releases (for Goose)
- Python packages via `uv` (for Aider)

Always verify:

```bash
# Check installed version
terminal-jarvis info <tool>

# Verify package source
npm info <package-name>
```

## Adding New Tools

Want to see a tool added to Terminal Jarvis? Check out:


- [Contributing Guide](../details/contributions.md)
- [Architecture Guide](../details/architecture.md)

The modular configuration system makes it easy to add new tools without touching core code!

## Next Steps

- [Installation Guide](installation.md) - Set up Terminal Jarvis
- [Usage Guide](usage.md) - Learn how to use the tools
- [Configuration Guide](configuration.md) - Customize tool behavior
- [Known Limitations](../details/limitations.md) - Current issues and workarounds
