# Known Limitations and Issues

This document outlines current limitations, known issues, and workarounds for Terminal Jarvis.

## Authentication Flow Challenges

### Issue: Tool-Specific Auth Handling

Some AI tools use browser-based authentication flows that can be challenging in terminal environments.

**Affected Tools**:


- Claude (`/auth` command)
- Gemini (`/config` command)  
- Qwen (dashboard authentication)

**Current Behavior**:

Terminal Jarvis detects when tools are performing authentication and displays:

```
[INFO] [tool] session ended - likely due to authentication, configuration, or user exit
```

**Why This Happens**:


- Tools may exit after authentication setup
- Browser windows opened for login
- Normal workflow for certain commands

**Workaround**:

1. Complete the authentication in your browser
2. Relaunch the tool with `terminal-jarvis <tool-name>`
3. Terminal Jarvis remembers your authentication state

**Status**: Working as designed. Future improvements may include better detection of authentication vs errors.

## Platform-Specific Requirements

### macOS Prerequisites

**Requirement**: Rust toolchain must be installed before using Terminal Jarvis

**Details**: Some tools require compilation or Rust-specific dependencies on macOS

**Solution**: Install Rust before Terminal Jarvis:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
npm install -g terminal-jarvis
```

**Why**: macOS system security and binary compilation requirements

**Status**: Documented limitation. See [Installation Guide](../quick_start/installation.md#macos-prerequisites) for complete setup instructions.

### Windows Support

**Current Status**: Terminal Jarvis works on Windows via WSL (Windows Subsystem for Linux)

**Limitations**:


- Native Windows PowerShell support is limited
- Some tools may not work natively on Windows
- Best experience is through WSL2

**Recommended Setup**:

```bash
# In WSL2
npm install -g terminal-jarvis
terminal-jarvis
```

**Future Plans**: Improved native Windows support in roadmap

## Performance Considerations

### Package Size

- **Current NPM package**: ~1.2MB compressed / ~2.9MB unpacked
- **Future optimization**: Binary compression and lazy loading planned

See [Installation Guide](../quick_start/installation.md#package-information) for detailed package information.

### Tool Detection

- **Multi-method verification** may cause slight delays during initial tool detection
- **Tools are cached** after first detection to improve subsequent performance
- **Typical delay**: 100-200ms on first run, < 50ms cached

**Workaround**: Tool status is cached, so repeated operations are fast

## Tool-Specific Limitations

### OpenCode

**Issue**: Requires shell environment refresh after installation

**Symptom**: "command not found" after `terminal-jarvis install opencode`

**Solution**:

```bash
source ~/.bashrc  # or ~/.zshrc
# or simply restart your terminal
```

**Why**: OpenCode modifies PATH, which requires shell reload

### Gemini

**Issue**: API key validation before first use

**Solution**: Set `GEMINI_API_KEY` environment variable:

```bash
export GEMINI_API_KEY="your-key-here"
terminal-jarvis gemini
```

### Qwen

**Issue**: Dashboard vs Scope detection

**Symptom**: Qwen may ask about authentication method

**Solution**: Follow prompts to select Dashboard or provide API key

### Aider

**Issue**: Requires Python 3.12 and `uv` package manager

**Solution**: Install prerequisites:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
terminal-jarvis install aider
```

## Configuration Limitations

### Project-Specific Configs

**Current**: Project-level `terminal-jarvis.toml` supported but not well documented

**Workaround**: Use user-wide config at `~/.config/terminal-jarvis/config.toml`

**Future**: Better project-level configuration documentation and UI

### Theme Customization

**Current**: Three built-in themes (T.JARVIS, Classic, Matrix)

**Limitation**: Custom themes require manual TOML editing

**Future**: Theme marketplace and easy customization UI planned

## Terminal Compatibility

### Unicode Support

**Requirement**: Terminal must support Unicode for best experience

**Affected**: ASCII art, progress indicators, emoji

**Workaround**: Most modern terminals support Unicode by default

### Color Support

**Requirement**: 256-color terminal recommended

**Degradation**: Falls back to basic colors if not supported

**Test**: `terminal-jarvis` will display correctly if colors work

## Network and Connectivity

### Offline Mode

**Current**: Terminal Jarvis requires internet for:


- Tool installation
- Tool updates
- API key validation (for some tools)

**Limitation**: No offline mode currently

**Future**: Planned offline mode with cached tool information

### Proxy Support

**Current**: Respects system proxy settings via environment variables

**Configuration**:

```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
```

**Limitation**: Some tools may not respect proxy settings

## Distribution Channel Differences

### NPM vs Cargo vs Homebrew

**Behavioral Differences**:


- **NPM**: Includes TypeScript wrapper, NPX support
- **Cargo**: Pure Rust binary, fastest startup
- **Homebrew**: System-integrated, automatic updates

**Recommendation**: Use NPM for most users, Cargo for Rust developers, Homebrew for macOS/Linux package manager users

## Rate Limiting

### AI Tool API Limits

**Issue**: Each AI tool has its own rate limits

**Not Controlled by Terminal Jarvis**: Rate limits are enforced by tool providers

**Workaround**: Switch between tools when hitting rate limits

**Future**: Terminal Jarvis may add intelligent rate limit handling and tool switching

## Security Considerations

### API Key Storage

**Current**: Environment variables only

**Limitation**: No encrypted credential storage yet

**Best Practice**:


- Use `.env` files (add to `.gitignore`)
- Set session-specific variables
- Rotate keys regularly

**Future**: Secure credential storage planned

### Tool Verification

**Current**: Tools installed from official sources

**Limitation**: No cryptographic signature verification

**Future**: GPG signature verification for all tools planned

## Concurrency Limitations

### Simultaneous Tool Execution

**Current**: One tool at a time recommended

**Issue**: Multiple tools may interfere with each other

**Workaround**: Use separate terminal windows/tabs

**Future**: Better multi-tool session management

## Known Bugs

### Fresh Install Issues in Codespaces/NVM Environments (v0.0.73-v0.0.74)

**Issue**: [#39](https://github.com/BA-CalderonMorales/terminal-jarvis/issues/39) - Fresh installations may fail with npm EACCES permission errors when installing tools like Claude.

**Symptom**:
```
npm EACCES: permission denied
```

**Root Cause**:
- NVM-installed npm isn't in sudo's PATH
- Database setup fails to find `config/tools` directory when run outside project root

**Workaround**:
1. Use `npx terminal-jarvis` instead of global install
2. Configure npm to use user-writable directories (see Installation Guide)
3. Run from within a cloned terminal-jarvis directory for development

**Status**: Being addressed in [#40](https://github.com/BA-CalderonMorales/terminal-jarvis/issues/40)

---

### Binary Size Discrepancy: macOS vs Linux (v0.0.73+)

**Issue**: [#38](https://github.com/BA-CalderonMorales/terminal-jarvis/issues/38) - macOS binary (~26.7 MB) is approximately 3x larger than Linux equivalent (~8.67 MB).

**Impact**: Larger download size for macOS users

**Investigation Areas**:
- Linker settings differences
- Debug symbol inclusion
- Universal binary configurations

**Status**: Under investigation

---

### NVM PATH Issues (Fixed in v0.0.73)

**Issue**: [#37](https://github.com/BA-CalderonMorales/terminal-jarvis/issues/37) - Tool installation failed silently when npm was installed via NVM.

**Root Cause**: NVM-installed npm wasn't in sudo's PATH, and error messages were suppressed.

**Resolution**: Fixed in v0.0.73. Users on older versions should upgrade:
```bash
npm update -g terminal-jarvis
```

---

If you encounter other issues:

1. Check this document for known limitations
2. Search [GitHub Issues](https://github.com/BA-CalderonMorales/terminal-jarvis/issues)
3. Report new issues with reproduction steps

## Workarounds Summary

| Issue | Workaround |
|-------|-----------|
| Command not found after install | `source ~/.bashrc` or restart terminal |
| Authentication timeouts | Complete auth in browser, relaunch tool |
| macOS Rust requirement | Install Rust before Terminal Jarvis |
| OpenCode PATH issues | Restart terminal or source shell config |
| API key errors | Set environment variables correctly |

## Reporting New Issues

When reporting issues, please include:

1. **Terminal Jarvis version**: `terminal-jarvis --version`
2. **Operating system**: macOS, Linux, Windows/WSL
3. **Tool affected**: Which AI tool (if applicable)
4. **Steps to reproduce**: Exact commands run
5. **Expected vs actual behavior**
6. **Error messages**: Full error output

Report issues at: [GitHub Issues](https://github.com/BA-CalderonMorales/terminal-jarvis/issues)

## Future Improvements

Many limitations listed here are being actively addressed. Check the [Roadmap](roadmap.md) for planned improvements.

---

**Last Updated**: January 2026
