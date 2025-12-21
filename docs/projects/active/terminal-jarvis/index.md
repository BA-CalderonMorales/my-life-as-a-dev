# Terminal Jarvis

**A unified command center for AI coding tools**

Terminal Jarvis manages and orchestrates 10+ AI coding assistants from one beautiful terminal interface. Switch seamlessly between Claude, Gemini, Qwen, and more—all with intelligent authentication handling and a delightful developer experience.

!!! tip "Quick Start"
    ```console
    $ npx terminal-jarvis
    ```

## Overview

Developers working with multiple AI CLI tools face fragmentation: rate limits across providers, context switching between different interfaces, inconsistent command syntax, and no unified workflow. Terminal Jarvis solves this by providing a single, elegant interface to manage all your AI coding assistants.

## Why Terminal Jarvis?

**The Problem**:


- Juggling 5-10 different AI tool CLIs
- Remembering syntax for each tool
- Managing authentication across providers
- Hitting rate limits and needing to switch tools
- Inconsistent user experiences

**The Solution**:

Terminal Jarvis provides:


- **Unified Interface**: One command for all tools
- **Smart Authentication**: Handles API keys and browser auth gracefully
- **Intelligent Management**: Install, update, and run tools effortlessly
- **Beautiful UX**: Thoughtfully designed terminal interface
- **Zero Config**: Works out of the box, customize if you want

## Supported AI Tools

Terminal Jarvis currently supports **10 AI coding tools**:

| Tool | Provider | Status |
|------|----------|--------|
| **Claude** | Anthropic | Stable |
| **Gemini** | Google | Stable |
| **Qwen** | Alibaba | Stable |
| **Goose** | Block | Stable |
| **Amp** | Sourcegraph | Stable |
| **Aider** | Aider Chat | Stable |
| **OpenCode** | OpenCode AI | Testing |
| **LLXprt** | VybeStack | Testing |
| **Codex** | OpenAI | Testing |
| **Crush** | Charm | New |

See the complete [AI Tools Guide](quick_start/ai-tools.md) for detailed information.

## Key Features

### Multi-Tool Orchestration

- Seamlessly switch between 10+ AI coding tools
- Unified command syntax across all tools
- Intelligent tool selection and recommendations

### Smart Authentication

- Automatic browser auth detection
- API key management and validation
- Graceful handling of auth flows
- Session continuation after authentication

### Beautiful Terminal UI

- Interactive T.JARVIS interface with ASCII art
- Real-time tool status dashboard
- Theme support (T.JARVIS, Classic, Matrix)
- Responsive design for all terminal sizes

### Developer Experience

- Zero configuration required
- Multiple installation methods
- Comprehensive documentation
- Active community support

## Quick Links

<div class="grid cards" markdown>

 -   :fontawesome-brands-github:{ .lg .middle } **GitHub Repository**

    ---

    Source code, issues, and discussions

    [:octicons-arrow-right-24: View on GitHub](https://github.com/BA-CalderonMorales/terminal-jarvis)

-   :material-npm:{ .lg .middle } **NPM Package**

    ---

    Install via NPM for instant access

    [:octicons-arrow-right-24: View on NPM](https://www.npmjs.com/package/terminal-jarvis)

-   :material-language-rust:{ .lg .middle } **Crates.io**

    ---

    Rust ecosystem integration

    [:octicons-arrow-right-24: View on Crates.io](https://crates.io/crates/terminal-jarvis)

-   :material-discord:{ .lg .middle } **Discord Community**

    ---

    Join the conversation

    [:octicons-arrow-right-24: Join Discord](https://discord.gg/WteQm6MTZW)

</div>

## Installation

Choose your preferred installation method:

=== "NPM (Recommended)"

    ```console
    $ npx terminal-jarvis
    
    $ npm install -g terminal-jarvis
    $ terminal-jarvis
    ```

=== "Cargo (Rust)"

    ```console
    $ cargo install terminal-jarvis
    $ terminal-jarvis
    ```

=== "Homebrew (macOS/Linux)"

    ```console
    $ brew tap ba-calderonmorales/terminal-jarvis
    $ brew install terminal-jarvis
    $ terminal-jarvis
    ```

**For detailed platform-specific instructions and troubleshooting**, see [Installation Guide](quick_start/installation.md).

## Getting Started

### Quick Start

1. **Install Terminal Jarvis** using your preferred method above
2. **Run the interactive mode**: `terminal-jarvis`
3. **Select a tool** from the menu
4. **Start coding** with AI assistance

### Basic Usage Examples

```console
$ terminal-jarvis

$ terminal-jarvis run claude

$ terminal-jarvis list

$ terminal-jarvis update-all
```

**For comprehensive usage information**, see [Usage Guide](quick_start/usage.md).

## Documentation

### Quick Start Guides

<div class="grid cards" markdown>

-   :material-download:{ .lg .middle } **[Installation](quick_start/installation.md)**

    ---

    Platform-specific installation instructions, requirements, and troubleshooting

-   :material-console:{ .lg .middle } **[Usage](quick_start/usage.md)**

    ---

    Interactive mode, direct commands, workflows, and keyboard shortcuts

-   :material-cog:{ .lg .middle } **[Configuration](quick_start/configuration.md)**

    ---

    TOML configuration, tool definitions, environment variables, and customization

-   :material-robot:{ .lg .middle } **[AI Tools](quick_start/ai-tools.md)**

    ---

    Complete guide to all 10 supported AI tools with features and authentication

</div>

### Technical Details

<div class="grid cards" markdown>

-   :material-architecture:{ .lg .middle } **[Architecture](details/architecture.md)**

    ---

    Domain-based modular design, configuration system, and tool execution engine

-   :material-test-tube:{ .lg .middle } **[Testing](details/testing.md)**

    ---

    Test scripts, TDD workflow, core functionality guarantees, and CI/CD

-   :material-tools:{ .lg .middle } **[Maintainers](details/maintainers.md)**

    ---

    Release workflow, version management, and distribution channels

-   :material-account-group:{ .lg .middle } **[Contributing](details/contributions.md)**

    ---

    Community guidelines, Discord-first process, and code quality rules

-   :material-map-marker-path:{ .lg .middle } **[Roadmap](details/roadmap.md)**

    ---

    Near/medium/long-term goals, v1.0 criteria, and community involvement

-   :material-alert-circle:{ .lg .middle } **[Limitations](details/limitations.md)**

    ---

    Known issues, platform requirements, workarounds, and bug reporting

</div>

## Community & Support

### Get Involved

- **Discord**: Join our active community at [discord.gg/WteQm6MTZW](https://discord.gg/WteQm6MTZW)
- **GitHub Discussions**: Share ideas and ask questions
- **GitHub Issues**: Report bugs and request features
- **Contributions**: See our [Contributing Guide](details/contributions.md)

### Connect with the Team

- **Lead Developer**: Brandon Calderon-Morales
- **Project**: Open source, community-driven
- **License**: MIT License

## What's Next?

!!! info "Start Your Journey"
    - **New to Terminal Jarvis?** Start with the [Installation Guide](quick_start/installation.md)
    - **Ready to configure?** Check out [Configuration](quick_start/configuration.md)
    - **Want to contribute?** Read the [Contributing Guide](details/contributions.md)
    - **Curious about the future?** Explore the [Roadmap](details/roadmap.md)

## Project Philosophy

Terminal Jarvis is our team's love letter to the open source community. Built by developers, for developers, it embodies:


- **Developer Experience First**: Every decision prioritizes joy and productivity
- **Community-Driven**: Discord-first development with transparent roadmap
- **Open & Accessible**: MIT licensed, welcoming to all skill levels
- **Quality & Reliability**: Comprehensive testing and thoughtful design

---

*Built with* :material-heart: *by the Terminal Jarvis team*
