# Contributing to Terminal Jarvis

We welcome contributions from the community! This guide provides everything you need to know to contribute effectively.

## Quick Start for Contributors

Ready to contribute? Follow these steps:

1. **Join the [Terminal Jarvis Discord](https://discord.gg/WteQm6MTZW)**
2. **Discuss your contribution** in `#features` or `#bugfix` channels
3. **Fork the repository**
4. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
5. **Follow our contribution guidelines** (detailed below)
6. **Ensure tests pass** (`cargo test`)
7. **Use our PR template** for submitting changes

## Contribution Types

We welcome various types of contributions:

### Code Contributions

- New AI tool integrations
- Bug fixes and stability improvements
- Performance enhancements
- Session continuation improvements
- Authentication workflow fixes

### Documentation

- README improvements
- API documentation
- Installation guides
- Usage examples and tutorials

### Testing

- Unit and integration tests
- Bug reproduction test cases
- CI/CD improvements
- Cross-platform testing

### User Experience

- Interactive interface improvements
- ASCII art and visual enhancements
- Error message clarity
- Command-line ergonomics

## Contribution Process

### 1. Discord Discussion (MANDATORY)

**All contributions must start with a Discord discussion.**

Why?

- Prevents duplicate work
- Ensures alignment with project goals
- Gets early feedback on approach
- Builds community engagement

What to discuss:


- Feature proposal and rationale
- Implementation approach
- Testing strategy
- Breaking changes (if any)

### 2. Fork and Branch

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/terminal-jarvis.git
cd terminal-jarvis

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

### 3. Follow Development Standards

**Rust Code**:


- Must pass `cargo clippy --all-targets --all-features -- -D warnings`
- Must be formatted with `cargo fmt --all`
- Use `anyhow::Result` for error handling
- Add doc comments for public functions

**TypeScript Code**:


- Use Biome for linting and formatting, NOT ESLint
- Run `npm run lint` and `npm run format` before committing

**Commit Messages**:

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for new AI tool
fix: resolve authentication timeout issue
docs: update installation instructions
test: add tests for tool detection
```

### 4. Test Your Changes

```bash
# Run all tests
cargo test

# Check code formatting
cargo fmt --all

# Run linting
cargo clippy --all-targets --all-features -- -D warnings

# Test NPM package (if applicable)
cd npm/terminal-jarvis && npm run build
```

### 5. Create Pull Request

- Use the provided PR template
- Select appropriate PR type (docs, feature, bugfix, etc.)
- Link Discord discussion
- Include comprehensive testing information

## Development Environment Setup

### Recommended: GitHub Codespaces

Click "Code" → "Codespaces" → "Create codespace" for instant setup with:


- Rust 1.87 pre-installed
- Node.js 20 ready
- All dependencies configured
- VS Code integration

### Local Setup

Install Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Install Node.js 20+ using nvm or your preferred method.

Clone and build:

```bash
git clone https://github.com/BA-CalderonMorales/terminal-jarvis.git
cd terminal-jarvis
cargo build
```

## Code Quality Rules

### Test-Driven Development

When fixing bugs:

1. Write a test that reproduces the bug
2. Fix the bug
3. Verify the test passes
4. Add regression test

### Code Organization

- Keep files small and focused (200-300 lines)
- Follow the domain-based module structure
- Use clear, descriptive names
- Add comments for complex logic only

### Error Handling

```rust
// Good: Descriptive error messages
.context("Failed to install tool: NPM not available")?

// Bad: Generic errors
.unwrap()
```

## Adding New AI Tools

Want to add a new tool? Here's how:

1. **Create tool configuration** in `config/tools/`:

```toml
[tool]
display_name = "New Tool"
config_key = "newtool"
description = "Description of the tool"
cli_command = "newtool"
requires_npm = true
status = "testing"

[tool.install]
command = "npm"
args = ["install", "-g", "newtool-package"]
verify_command = "newtool --version"

[tool.auth]
env_vars = ["NEWTOOL_API_KEY"]
setup_url = "https://newtool.com/setup"
auth_instructions = "Get your API key from..."
```

2. **Test the integration**:

```bash
terminal-jarvis list
terminal-jarvis info newtool
terminal-jarvis install newtool
```

3. **Add tests** to `test-core-functionality.sh`

4. **Update documentation** in this project

## Important Limitations for Contributors

### Distribution Access

Contributors do NOT have access to:


- NPM registry publishing
- Crates.io publishing
- Homebrew formula updates
- GitHub release creation

**Maintainers handle all publishing and distribution after PR approval.**

### Version Management

- Do NOT manually update version numbers
- Maintainers handle version bumps and CHANGELOG.md updates
- Focus on code quality and functionality in your PR

### Testing Constraints

- Test locally with development builds
- Cannot test published package distribution
- Focus on unit/integration tests for your changes

## Pull Request Template

When creating a PR, include:

```markdown
## Type of Change

- [ ] Documentation update
- [ ] Feature addition
- [ ] Bug fix
- [ ] Performance improvement
- [ ] Refactoring
- [ ] Test addition

## Description

[Clear description of what changed and why]

## Discord Discussion

Link: [Discord thread URL]

## Testing Performed

- [ ] Local testing completed
- [ ] All tests pass (`cargo test`)
- [ ] Code formatted (`cargo fmt`)
- [ ] Linting passes (`cargo clippy`)

## Breaking Changes

[List any breaking changes, or state "None"]
```

## Effective Contribution Tips

### Start Small

- Begin with documentation improvements or small bug fixes
- Understand the codebase before attempting major features
- Ask questions in Discord - the community is helpful!

### Focus Areas for New Contributors

- **Documentation**: README clarity, installation guides, usage examples
- **Testing**: Add test coverage for existing functionality
- **Bug Reports**: Help identify and reproduce issues
- **Tool Integration**: Add support for new AI coding tools
- **User Experience**: Improve interactive interface and error messages

### Getting Help

- **Discord**: Real-time help in `#development` channel
- **GitHub Issues**: Browse existing issues for contribution ideas
- **Architecture Guide**: Read [Architecture](architecture.md) for technical deep dive
- **Testing Guide**: See [Testing](testing.md) for testing approaches

## Recognition

Contributors are recognized in:


- GitHub contributor graphs
- Release notes for significant contributions
- Discord contributor role
- README acknowledgments (for major contributions)

## Code of Conduct

Be respectful, inclusive, and collaborative. We follow GitHub's Community Guidelines.

## Useful Links

- **[Discord Community](https://discord.gg/WteQm6MTZW)** - Primary communication channel
- **[Architecture Guide](architecture.md)** - Technical deep dive
- **[Testing Guide](testing.md)** - Testing strategies and frameworks
- **[Installation Guide](../quick_start/installation.md)** - Platform-specific setup
- **[Known Limitations](limitations.md)** - Current issues and workarounds

---

**Ready to contribute? Join our Discord community and let's build something amazing together!**
