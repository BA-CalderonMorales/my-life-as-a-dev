# AGENTS.md

This file provides guidelines for AI agents and LLMs working with this repository. It consolidates workflow rules, development standards, and decision-making patterns.

## Repository Context

This is a documentation consolidation hub built with MkDocs Material. It serves as a central location for personal development notes, project documentation, and technical resources. The site uses versioned documentation with `mike` and deploys to GitHub Pages.

## General Principles

- Follow Test-Driven Development where applicable. Write tests before production code and keep changes small.
- Use Python 3.10 or higher and prefer immutable patterns and small pure functions.
- Consult CLAUDE.md for architecture details, common commands, and technical setup.
- Refer to the Software Engineering Laws section below for decision-making patterns and historical context.

## Local Development Workflow

Use these Makefile targets during feature work:

- `make setup` – install Python dependencies and the local MkDocs plugin
- `make serve` – start the MkDocs development server
- `make build` – build the static site
- `make cli` – run the Rust-based documentation CLI

Run `make setup` and `make build` before pushing changes. CI uses the same commands.

## Commit Standards

Commits must use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Examples:

```
feat: add dark mode toggle
fix: handle null todo values
chore: update dependencies
```

## Pull Requests

Prefix PR titles to show intent:

- **Feature:** … → merge into `develop`
- **Bugfix:** … → merge into `develop`
- **Cleanup:** … → merge into `develop`
- **Pipeline:** … → merge into `develop`
- **Hotfix:** … → merge directly to `main`

Include a **Codex CI** section summarizing `install`, `build`, `typecheck`, and `test` results.

After merging into `develop`, automatically open a PR that merges `develop` into `main` so changes can be tested against the main branch.

## Continuous Integration

All dependencies must be installed using `make setup` in CI jobs. The Super-Linter runs on every pull request via `.github/workflows/super-linter.yml`.

Ensure we find ways to mitigate any current Super-Linter failures as we continue to make incremental changes. Failures should not cause us to break existing functionality or alter the current documentation appearance. Take a balanced approach when addressing linter issues.

## Code Style and Standards

### Documentation Standards

**CRITICAL: ABSOLUTELY NO EMOJIS**

- **NEVER use emojis** in documentation files (*.md)
- **NEVER use emojis** in code comments
- **NEVER use emojis** in commit messages
- Use plain text section headers instead of emoji prefixes
- Use Material Design icons via `:material-icon-name:` syntax if visual indicators are needed
- Keep documentation clean, professional, and emoji-free

### Python Guidelines

- **Python 3.10+** is required
- Prefer **immutable patterns** and **pure functions**
- Keep functions small and focused on a single responsibility
- Use **type hints** for function signatures
- Follow **PEP 8** style guidelines
- No mutation of data structures where possible

### Rust Guidelines

- Follow **official Rust best practices**
- Use `cargo fmt` for consistent formatting
- Run `cargo clippy` to catch common mistakes
- Organize code into modules with clear responsibilities (see `scripts/rust/lib/` structure)
- Use meaningful error messages and proper error handling

### Naming Conventions

- **Functions**: `snake_case` for Python/Rust, verb-based (e.g., `calculate_total`, `validate_payment`)
- **Types/Structs**: `PascalCase` (e.g., `PaymentRequest`, `UserProfile`)
- **Constants**: `UPPER_SNAKE_CASE` for true constants
- **Files**: `snake_case.py` or `mod.rs` for Python/Rust files

### No Comments in Code

Code should be self-documenting through clear naming and structure. Comments indicate that the code itself is not clear enough.

**Exception**: Docstrings for public APIs are acceptable when generating documentation, but the code should still be self-explanatory without them.

## Working with AI Assistants

### Expectations

When working with this codebase:

1. **Think deeply** before making any edits
2. **Understand the full context** of the code and requirements
3. **Ask clarifying questions** when requirements are ambiguous
4. **Think from first principles** - don't make assumptions
5. **Keep project docs current** - update CLAUDE.md or AGENTS.md when introducing meaningful architectural changes

### Code Changes

When suggesting or making changes:

- Respect the existing patterns and conventions
- Keep changes small and incremental
- Provide rationale for significant design decisions
- Ensure Python type hints are used where applicable
- Test changes locally before committing

### Communication

- Be explicit about trade-offs in different approaches
- Explain the reasoning behind significant design decisions
- Flag any deviations from these guidelines with justification
- Suggest improvements that align with these principles
- When unsure, ask for clarification rather than assuming

## Documentation Standards

### MkDocs Content

- Write clear, concise documentation
- Use **Markdown** with MkDocs Material extensions
- Include **code examples** where appropriate
- Use **admonitions** for warnings, tips, and notes
- Organize content logically using the `.nav.yml` structure

### Navigation Structure

- Navigation is defined in `docs/.nav.yml`
- Follow the existing hierarchy: Home → Projects/Repositories → Details
- Each repository should have: index.md, quick_start/, details/

## Version Management

- Versions are created via **Git tags** (semantic versioning: major.minor.patch)
- Use `doc-cli bump-version` or `./scripts/bump-version.sh` to create new versions
- `mike` manages multiple documentation versions on gh-pages branch
- Latest tag is automatically deployed as "latest" alias
- GitHub Actions handles automatic deployment on tag push

## Software Engineering Laws

This section summarizes classic engineering laws and their real-world implications. Review these principles when planning or reflecting on work.

### Murphy's Law

**"Anything that can go wrong, will go wrong."** Defensive coding, robust testing, and solid rollback plans help mitigate inevitable failures.

### Brook's Law

**"Adding manpower to a late software project makes it later."** More people can increase coordination overhead—refine scope and processes first.

### Hofstadter's Law

**"It always takes longer than you expect, even when you take into account Hofstadter's Law."** Pad estimates to account for hidden complexity.

### Conway's Law

**"Organizations which design systems are constrained to produce designs which are copies of the communication structures of these organizations."** Align team structure with the architecture you want.

### Postel's Law

**"Be conservative in what you send, be liberal in what you accept."** Write strict outputs, but gracefully handle varied inputs.

### Pareto Principle

**"80% of consequences come from 20% of causes."** Focus on the small fraction of code that drives most outcomes.

### The Peter Principle

**"In a hierarchy, every employee tends to rise to his level of incompetence."** Provide growth paths that value both technical and managerial expertise.

### Kerckhoffs's Principle

**"A cryptosystem should be secure even if everything about the system, except the key, is public knowledge."** Depend on key secrecy, not algorithm secrecy.

### Linus's Law

**"Given enough eyeballs, all bugs are shallow."** Encourage open collaboration and code review.

### Moore's Law

**"Transistor count doubles approximately every 18–24 months."** Hardware improves quickly, but relying on this can lead to bloat.

### Wirth's Law

**"Software gets slower faster than hardware gets faster."** Feature creep and heavy frameworks can overwhelm hardware gains.

### Ninety-ninety Rule

**"The first 90% of the code takes 10% of the time; the remaining 10% takes the other 90% of the time."** Final polishing often consumes most of the schedule.

### Knuth's Optimization Principle

**"Premature optimization is the root of all evil."** Optimize only after profiling reveals true bottlenecks.

### Norvig's Law

**"Any technology that surpasses 50% penetration will never double again."** Recognize maturity and adjust growth strategies accordingly.

## DRY Principle - Understanding Knowledge vs Code

DRY (Don't Repeat Yourself) is about not duplicating **knowledge** in the system, not about eliminating all code that looks similar.

### Not a DRY Violation

Code with similar structure but representing different business concepts:

```python
def validate_user_age(age: int) -> bool:
    return age >= 18 and age <= 100

def validate_product_rating(rating: int) -> bool:
    return rating >= 1 and rating <= 5

def validate_years_of_experience(years: int) -> bool:
    return years >= 0 and years <= 50
```

These represent completely different business rules. Abstracting them would couple unrelated concepts.

### IS a DRY Violation

Same knowledge expressed in multiple places:

```python
# In multiple files/classes
def calculate_shipping(items_total: float) -> float:
    return 0 if items_total > 50 else 5.99  # Same rule repeated everywhere
```

Should be:

```python
FREE_SHIPPING_THRESHOLD = 50
STANDARD_SHIPPING_COST = 5.99

def calculate_shipping(items_total: float) -> float:
    return 0 if items_total > FREE_SHIPPING_THRESHOLD else STANDARD_SHIPPING_COST
```

## Project-Specific Considerations

### PYTHONPATH Requirement

When running `mkdocs serve` or `mkdocs build` directly (not via Makefile), you MUST set PYTHONPATH:

```bash
# Linux/macOS
export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs serve

# Windows PowerShell
$env:PYTHONPATH="$env:PYTHONPATH;$(pwd)"; mkdocs serve
```

This ensures the custom plugin (`mkdocs_plugins/`) is discoverable.

### Custom Plugin Development

- Custom MkDocs plugins live in `mkdocs_plugins/`
- Always run `pip install -e .` after plugin code changes
- Plugin entry points are defined in `setup.py`
- Test plugins by running `make serve` and checking console output

### Rust CLI Development

- CLI source is in `scripts/rust/`
- Each subcommand is a module in `scripts/rust/lib/`
- Main entry point: `scripts/rust/src/doc-cli.rs`
- Build with: `cargo build --release` in scripts/rust/
- Binary outputs to: `scripts/rust/target/release/doc-cli`

### AI Proxy Development

- AI proxy source: `scripts/python/ai_proxy.py`
- Uses FastAPI and Azure AI Inference SDK
- Requires `GITHUB_TOKEN` environment variable
- Run with: `uv run python scripts/python/ai_proxy.py`
- Default endpoint: http://127.0.0.1:8765

## Testing Approach

This project currently does not have automated tests. When adding tests:

- Use **pytest** for Python code
- Use **cargo test** for Rust code
- Write tests that verify behavior, not implementation details
- Aim for high coverage of business logic
- Test through public APIs where possible

## AI/RAG Security and Implementation Plan

### Current Status (NOT SHIPPED)

The AI-powered per-page chat feature is **NOT currently enabled** in production builds. The code exists but is disabled to ensure proper security planning before deployment.

### Implementation Components

The repository contains the following AI-related components (currently disabled):

1. **AI Proxy** (`scripts/python/ai_proxy.py`): FastAPI service using GitHub Models via Azure AI Inference
2. **MkDocs Plugin** (`mkdocs_plugins/ai_plugin.py`): Plugin that would inject chat UI into documentation pages
3. **Frontend UI** (`docs/overrides/main.html`): Floating action button and chat panel (currently commented out)

### Security Requirements Before Enabling

Before shipping the AI chat feature, the following must be addressed:

#### 1. Secure Deployment Architecture

- **Do NOT expose tokens directly in the browser or client-side code**
- Deploy the AI proxy to a secure, dedicated server (not localhost/Codespaces only)
- Use proper authentication and rate limiting on the proxy server
- Implement request/response logging for security auditing

#### 2. Logging and Monitoring

Even for side projects, proper logging prevents security nightmares:

- **Log all queries and responses** with timestamps and (hashed) user identifiers
- Track token usage and costs per request
- Monitor for suspicious patterns (injection attempts, excessive usage, etc.)
- Store logs in a queryable format for security review

#### 3. Access Control

- Implement API key rotation strategy
- Use environment-specific tokens (dev/staging/prod)
- Consider implementing user authentication before allowing queries
- Rate limit per IP/session to prevent abuse

#### 4. Content Security

- Sanitize all user inputs before sending to the model
- Implement output filtering to prevent sensitive data leakage
- Add context length limits to prevent excessive token usage
- Validate that responses stay within page context (no hallucinations)

### Why GitHub Models Isn't Enough

While GitHub is integrating models into their tooling, deploying our own proxy provides:

1. **Centralized Logging**: All requests flow through our infrastructure where we control logging
2. **Cost Control**: Track and limit token usage across all documentation sites
3. **Security Auditing**: Review logs for attempted exploits or misuse patterns
4. **Flexibility**: Can switch providers or models without changing frontend code
5. **Privacy**: User questions don't go directly to external APIs from their browser

### Future Implementation Checklist

When ready to enable the AI chat feature:

- [ ] Deploy AI proxy to secure hosting (e.g., Railway, Fly.io, Cloud Run)
- [ ] Implement proper authentication on proxy endpoints
- [ ] Set up structured logging with retention policy
- [ ] Add rate limiting (per IP and globally)
- [ ] Create monitoring dashboard for usage/costs
- [ ] Document incident response procedures
- [ ] Enable frontend UI components in `docs/overrides/main.html`
- [ ] Remove plugin injection or make it conditional on deployment environment
- [ ] Add user-facing documentation about the AI feature capabilities and limitations
- [ ] Test thoroughly in staging environment before production rollout

### Development Testing Only

The AI proxy can be run locally for development/testing:

```bash
export GITHUB_TOKEN="your_token_here"
uv run python scripts/python/ai_proxy.py
```

This is ONLY for local testing. Do not deploy the docs with AI features enabled until the security requirements above are met.

## Iterating on This Document

This file is meant to be a living document that evolves with the project. When making significant architectural changes:

1. Update AGENTS.md with new patterns or constraints
2. Update CLAUDE.md if commands or setup procedures change
3. Keep both files in sync regarding architectural decisions
4. Remove outdated sections as the project evolves
5. Add new sections as new patterns emerge

AGENTS.md focuses on **how to work** (process, standards, principles).
CLAUDE.md focuses on **what to know** (architecture, commands, setup).