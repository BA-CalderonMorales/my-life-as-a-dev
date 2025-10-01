# Testing Strategy

This document outlines the comprehensive testing approach to ensure core functionality remains stable as Terminal Jarvis evolves.

## Testing Scripts

Terminal Jarvis uses multiple testing scripts for different scenarios:

### `smoke-test.sh`

Quick validation of core functionality:

```bash
./scripts/smoke-test.sh
```

**What it tests**:

- CLI help commands
- Tool listing
- Configuration loading
- Version consistency
- Basic command parsing

**When to use**: Before commits, quick validation

### `test-core-functionality.sh`

Comprehensive test suite (33 tests):

```bash
./scripts/test-core-functionality.sh
```

**What it tests**:

- All 10 AI tools are available
- Installation commands work
- Configuration system loads properly
- NPM package consistency
- Version synchronization
- Tool detection mechanisms

**When to use**: Before releases, major changes

### `local-ci.sh`

Full CI pipeline validation:

```bash
./scripts/cicd/local-ci.sh
```

**What it does**:

- Code formatting (`cargo fmt`)
- Linting (`cargo clippy`)
- Test suite execution
- Version consistency validation
- Release binary build
- NPM package build

**When to use**: Pre-deployment, comprehensive validation

## Test-Driven Bugfix Workflow

When fixing bugs, Terminal Jarvis follows TDD:

1. **Reproduce the bug** with a failing test
2. **Write test case** that captures the issue
3. **Fix the bug** until test passes
4. **Add regression test** to prevent recurrence
5. **Document the fix** in CHANGELOG.md

Example workflow:

```bash
# 1. Add test to test-core-functionality.sh
run_test "Test 34: Reproduce bug XYZ" \
    "terminal-jarvis command-that-fails"

# 2. Fix the bug in source code

# 3. Verify fix
./scripts/test-core-functionality.sh

# 4. Commit with test
git add scripts/test-core-functionality.sh src/
git commit -m "fix: resolve issue XYZ with regression test"
```

## Core Functionality Guarantees

### 1. Tool Management

- All 10 AI tools are available: claude, gemini, qwen, opencode, llxprt, codex, crush, goose, amp, aider
- All tools use consistent installation methods (NPM, curl, or uv)
- Tool listing shows proper status and requirements
- Install/update commands work for each tool

### 2. Configuration System

- Default configuration loads properly
- All tools have install/update commands
- Example configuration file is maintained
- Version consistency across Cargo.toml and package.json

### 3. CLI Interface

- Help commands work for all subcommands
- Error handling for invalid inputs
- Command structure remains stable
- Interactive mode functions correctly

### 4. Package Management

- NPM packages install from correct sources
- Concurrent updates work properly
- Individual tool updates function correctly
- Tool verification after installation

### 5. Authentication and Environment Management

- Browser opening prevention in headless/CI environments
- Environment detection (CI, Codespaces, SSH, containers)
- API key validation and guidance
- Authentication behavior integration testing

### 6. Terminal State and Tool Integration

- OpenCode input focus works immediately on fresh installs
- Terminal state preparation doesn't interfere with tool initialization
- Minimal terminal clearing sequences prevent race conditions
- Tool-specific launch optimizations

## Homebrew Testing Infrastructure

Terminal Jarvis includes comprehensive Homebrew Formula testing:

### Local Tap Testing

```bash
# Test Homebrew Formula locally
./scripts/test-homebrew-formula.sh
```

**What it tests**:

- Formula syntax validation
- Cross-platform archive creation (macOS/Linux)
- SHA256 checksum verification
- Binary permissions preservation
- Installation workflow

### Multi-Platform Build System

```bash
# Build for multiple platforms
./scripts/utils/build-multiplatform.sh
```

**Supported platforms**:

- macOS ARM64 (Apple Silicon)
- macOS x86_64 (Intel)
- Linux x86_64
- Linux ARM64

## Integration with Development Workflow

### Pre-commit Testing

```bash
# Quick validation before commits
./scripts/smoke-test.sh
```

### Pre-release Testing

```bash
# Comprehensive validation before releases
./scripts/test-core-functionality.sh
```

### Full Release Pipeline

```bash
# Complete CI/CD with testing
./scripts/cicd/local-cicd.sh
```

## Regression Prevention Strategy

1. **Automated Testing**: All core functionality is validated automatically
2. **Version Consistency**: Prevents mismatched versions across files
3. **Configuration Validation**: Ensures example configs stay in sync
4. **Package Management**: Validates NPM package consistency
5. **CLI Stability**: Protects against breaking command structure changes

## Adding New Tests

When adding new functionality, extend `scripts/test-core-functionality.sh`:

```bash
# Add new test
run_test "Test N: New feature description" \
    "command_to_test_new_feature"
```

This ensures that new features are protected against future regressions.

## Test Philosophy

**Core Principle**: Every bug fix should include a test that would have caught it.

**Testing Pyramid**:

1. **Unit Tests**: Fast, isolated, test individual functions
2. **Integration Tests**: Test module interactions
3. **System Tests**: Test complete workflows end-to-end
4. **Smoke Tests**: Quick validation of critical paths

**Quality Gates**:

- All tests must pass before merging
- Code coverage should not decrease
- Performance regressions are caught
- Breaking changes require explicit approval

## Continuous Integration

Terminal Jarvis uses GitHub Actions for CI:

- Run on every pull request
- Run on push to main branch
- Test on multiple platforms (Ubuntu, macOS, Windows)
- Validate version consistency
- Check code formatting and linting

## Performance Testing

### Benchmarks

```bash
# Measure tool detection performance
time terminal-jarvis list

# Measure installation time
time terminal-jarvis install claude

# Measure update performance
time terminal-jarvis update
```

### Optimization Targets

- Tool detection: < 100ms (cached)
- Configuration loading: < 50ms
- Interactive mode startup: < 200ms

## Security Testing

- Validate API key handling
- Check for credential leaks in logs
- Verify secure storage practices
- Test permission handling

## Next Steps

- [Contributing Guide](contributions.md) - How to contribute tests
- [Architecture Guide](architecture.md) - Understand the codebase
- [Maintainers Guide](maintainers.md) - Release process and validation
