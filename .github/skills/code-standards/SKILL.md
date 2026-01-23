# Skill: Code Standards

Follow code standards for Python and Rust code in this repository.

## When to Use

- Writing any new code
- Reviewing code changes
- Refactoring existing code

## General Principles

1. **No emojis** in commits, docs, or comments
2. **Self-documenting code** - prefer clear names over comments
3. **Small, pure functions** - easier to test and reason about
4. **Type hints** - use them in Python and Rust

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Functions | snake_case | `parse_config()` |
| Variables | snake_case | `file_path` |
| Classes | PascalCase | `DocumentParser` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Files | snake_case | `config_utils.py` |

## Python Standards

### Style

- Python 3.10+
- Follow PEP 8
- Use type hints

### Example

```python
from pathlib import Path
from typing import Optional

def load_config(config_path: Path) -> dict:
    """
    Load configuration from YAML file.
    
    Args:
        config_path: Path to the configuration file.
        
    Returns:
        Configuration dictionary.
        
    Raises:
        FileNotFoundError: If config file doesn't exist.
    """
    if not config_path.exists():
        raise FileNotFoundError(f"Config not found: {config_path}")
    
    with open(config_path) as f:
        return yaml.safe_load(f)


def format_title(raw_title: str, max_length: Optional[int] = None) -> str:
    """Format a title string."""
    formatted = raw_title.strip().title()
    if max_length:
        formatted = formatted[:max_length]
    return formatted
```

### Docstrings

Use Google-style docstrings for public functions:

```python
def function(arg1: str, arg2: int) -> bool:
    """
    Brief description.
    
    Longer description if needed.
    
    Args:
        arg1: Description of arg1.
        arg2: Description of arg2.
        
    Returns:
        Description of return value.
        
    Raises:
        ValueError: When something is wrong.
    """
```

## Rust Standards

### Style

- Run `cargo fmt` before committing
- Run `cargo clippy` and fix warnings
- Meaningful error messages

## Go Standards

### Style

- Go 1.22+
- Run `go fmt` before committing
- Run `go vet` to catch common errors
- Follow [Effective Go](https://go.dev/doc/effective_go)

### Naming

- **Packages**: meaningful, single-word, lower-case (e.g., `config`, not `configuration`)
- **Interfaces**: Method name + "er" (e.g., `Reader`, `Writer`)
- **Variables**: Short and descriptive (e.g., `i` for index, `req` for request)
- **Functions**: PascalCase for exported, camelCase for internal

### Example

```go
package config

import (
	"fmt"
	"os"
)

// Config holds service configuration.
type Config struct {
	Port int
}

// Load reads configuration from environment.
func Load() (*Config, error) {
	portStr := os.Getenv("PORT")
	if portStr == "" {
		return nil, fmt.Errorf("PORT env var required")
	}
	// ... logic
	return &Config{Port: 8080}, nil
}
```


### Example

```rust
use std::path::Path;
use anyhow::{Result, Context};

/// Load configuration from a TOML file.
///
/// # Arguments
///
/// * `config_path` - Path to the configuration file
///
/// # Returns
///
/// The parsed configuration, or an error if loading fails.
pub fn load_config(config_path: &Path) -> Result<Config> {
    let contents = std::fs::read_to_string(config_path)
        .context("Failed to read config file")?;
    
    let config: Config = toml::from_str(&contents)
        .context("Failed to parse config")?;
    
    Ok(config)
}
```

### Error Handling

- Use `anyhow` for application errors
- Use `thiserror` for library errors
- Always add context to errors

```rust
use anyhow::{Context, Result};

fn process_file(path: &Path) -> Result<()> {
    let data = std::fs::read_to_string(path)
        .with_context(|| format!("Failed to read {}", path.display()))?;
    
    // Process data...
    Ok(())
}
```

## Avoid

- Magic numbers (use named constants)
- Deep nesting (extract functions)
- Long functions (>50 lines is a smell)
- Commented-out code
- `TODO` without issue reference

## Checklist

- [ ] Names are clear and follow conventions
- [ ] Type hints on all public functions
- [ ] Docstrings on public APIs
- [ ] No magic numbers
- [ ] `cargo fmt` and `cargo clippy` clean (Rust)
- [ ] PEP 8 compliant (Python)
