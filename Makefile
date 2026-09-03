.PHONY: help setup serve build cli config check-config test browser-install e2e viewport-check screenshots accessibility-check gn-analyze gn-status gn-clean

DEV_ADDR ?= 0.0.0.0:8001
export UV_CACHE_DIR ?= /tmp/uv-cache
export UV_LINK_MODE ?= copy

help:
	@echo "Commands:"
	@echo "  make setup           - Install Python dependencies and setup project"
	@echo "  make serve           - Start Zensical development server (port 8001)"
	@echo "  make build           - Build site with Zensical"
	@echo "  make config          - Merge config/zensical/*.toml into zensical.toml"
	@echo "  make cli             - Run documentation CLI tools"
	@echo "  make test            - Run tests"
	@echo "  make viewport-check  - Run Playwright viewport/layout checks"
	@echo "  make screenshots     - Capture Playwright viewport screenshots"
	@echo "  make accessibility-check - Run accessibility checks"
	@echo ""
	@echo "GitNexus (Code Intelligence):"
	@echo "  make gn-analyze      - Re-index the codebase"
	@echo "  make gn-status       - Check index freshness"
	@echo "  make gn-clean        - Delete the index"

setup:
	./doc-cli.sh setup

# Merge modular config files into zensical.toml (force)
config:
	uv run python scripts/python/merge_zensical_config.py

# Check if config needs merging and merge if necessary
check-config:
	@if [ -d "config/zensical" ]; then \
		NEWEST_CONFIG=$$(find config/zensical -name "*.toml" -newer zensical.toml 2>/dev/null | head -1); \
		if [ -n "$$NEWEST_CONFIG" ] || [ ! -f zensical.toml ]; then \
			echo "Config files changed, merging..."; \
			uv run python scripts/python/merge_zensical_config.py; \
		fi \
	fi

# Primary development server (Zensical) - auto-merges config if needed
serve: check-config
	DEV_ADDR=$(DEV_ADDR) ./doc-cli.sh serve

# Primary build command (Zensical) - auto-merges config if needed
build: check-config
	./doc-cli.sh build

cli:
	./doc-cli.sh

# Run all tests
test:
	uv run python -m pytest tests/ -v

# GitNexus — Code Intelligence
gn-analyze:
	node .gitnexus/run.cjs analyze

gn-status:
	node .gitnexus/run.cjs status

gn-clean:
	node .gitnexus/run.cjs clean

# Install Playwright browser binaries. Use browser-install-deps manually if the OS needs sudo packages.
browser-install:
	uv run playwright install chromium

browser-install-deps:
	uv run playwright install --with-deps chromium

# Browser-backed checks. These serve the built site from e2e/conftest.py.
e2e: build
	uv run pytest e2e/ -v

viewport-check: build
	uv run pytest e2e/quality/test_layout_integrity.py -v

screenshots: build
	uv run pytest e2e/visual_regression.py -v

accessibility-check: build
	uv run pytest e2e/test_accessibility.py -v
