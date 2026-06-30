# End-to-End Tests

Python-based e2e tests using Playwright for browser automation. Run them through `uv`; do not use Playwright MCP.

## Structure

```
e2e/
  conftest.py          # Pytest fixtures (browser, page, config)
  test_structure.py    # Validates e2e folder structure
  config/
    __init__.py        # Page source mappings and paths
  shared/
    __init__.py        # Shared utilities package
    utils.py           # Helper functions (emoji check, raw markdown check)
  pages/
    __init__.py
    test_home.py       # Home page tests
    test_projects.py   # Projects page tests
    test_resume.py     # Resume page tests
    test_learning.py   # Learning page tests
    test_docs_as_code.py  # Docs as Code page tests
    test_error.py      # 404 page tests
```

## Running Tests

### Prerequisites

```bash
# Install dependencies with uv
uv pip install -r requirements.txt -e .

# Install browser binaries
uv run playwright install chromium
```

If Chromium reports missing Linux/WSL system libraries:

```bash
uv run playwright install --with-deps chromium
```

This may require sudo on local Linux/WSL hosts.

### Run all tests

```bash
make e2e
```

### Run specific page tests

```bash
uv run pytest e2e/pages/test_home.py -v
```

### Run viewport checks

```bash
make viewport-check
```

### Capture screenshots

```bash
make screenshots
```

### Run accessibility checks

```bash
make accessibility-check
```

## Configuration

Tests use these environment variables:

- `DOCS_BASE_URL`: Base URL for the site. If unset, tests serve the built `site/` directory with a local HTTP server.

## Adding New Page Tests

1. Add page config to `e2e/config/__init__.py`
2. Create `e2e/pages/test_{page_name}.py`
3. Use fixtures from `conftest.py`
