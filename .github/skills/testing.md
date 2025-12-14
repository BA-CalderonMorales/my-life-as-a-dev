# Skill: Testing

Run tests for Python and Rust code in this repository.

## When to Use

- Before committing changes
- After modifying plugins or scripts
- Verifying CI will pass
- Debugging test failures

## Python Tests

### Running Tests

```bash
# All Python tests
pytest

# Specific test file
pytest tests/test_utils.py

# Specific test
pytest tests/test_utils.py::test_function_name

# With coverage
pytest --cov=mkdocs_plugins
```

### Test Locations

- `tests/` - Unit tests for plugins and utilities
- `e2e/` - End-to-end tests for the site

### E2E Tests

```bash
# Run e2e tests (requires site to be built)
make build
pytest e2e/
```

## Rust Tests

### Running Tests

```bash
cd scripts/rust

# All tests
cargo test

# Specific test
cargo test test_name

# With output
cargo test -- --nocapture
```

### Linting

```bash
cd scripts/rust

# Format check
cargo fmt --check

# Linting
cargo clippy
```

## Pre-Commit Checks

Before committing, run:

```bash
# Python
pytest
python -m mypy mkdocs_plugins/  # if type checking enabled

# Rust
cd scripts/rust && cargo fmt --check && cargo clippy && cargo test

# Documentation
make build
```

## CI Behavior

GitHub Actions runs:
1. `make setup`
2. `make build`
3. Python tests
4. Rust checks (if rust files changed)

## Debugging Test Failures

### Python

```bash
# Verbose output
pytest -v

# Stop on first failure
pytest -x

# Show print statements
pytest -s

# Specific markers
pytest -m "not slow"
```

### Rust

```bash
# Verbose
cargo test -- --nocapture

# Single thread (for debugging)
cargo test -- --test-threads=1
```

## Test File Patterns

### Python Test Example

```python
# tests/test_example.py
import pytest

def test_function():
    """Test description."""
    result = function_under_test()
    assert result == expected_value

@pytest.fixture
def sample_data():
    """Fixture for test data."""
    return {"key": "value"}

def test_with_fixture(sample_data):
    """Test using fixture."""
    assert sample_data["key"] == "value"
```

### Rust Test Example

```rust
// In lib.rs or dedicated test file
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_function() {
        let result = function_under_test();
        assert_eq!(result, expected);
    }
}
```

## Checklist

- [ ] All Python tests pass
- [ ] All Rust tests pass
- [ ] Rust formatting check passes
- [ ] Clippy has no warnings
- [ ] Documentation builds
