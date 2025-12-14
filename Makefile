.PHONY: help setup serve serve-clean build cli zen-serve zen-build

MKDOCS_DEV_ADDR ?= 127.0.0.1:8000
ZENSICAL_DEV_ADDR ?= 0.0.0.0:8001

help:
	@echo "Common commands:"
	@echo "  make setup       - Install Python dependencies and setup project"
	@echo "  make serve       - Run MkDocs development server (fast, dirty mode)"
	@echo "  make serve-clean - Run MkDocs server with full rebuilds (slower but reliable)"
	@echo "  make build       - Build MkDocs documentation"
	@echo "  make cli         - Build and run documentation CLI tools"
	@echo ""
	@echo "Zensical commands (modern static site generator):"
	@echo "  make zen-serve   - Run Zensical development server"
	@echo "  make zen-build   - Build site with Zensical"

setup:
	uv run python -m pip install --upgrade pip
	uv pip install -r requirements.txt
	uv pip install -e .

# Fast development server with dirty rebuilds
# Use this for quick iteration, but switch to serve-clean if hot reload misbehaves
serve:
	PYTHONPATH=$(PWD) mkdocs serve --dev-addr $(MKDOCS_DEV_ADDR) --dirty --watch-theme

# Clean development server without dirty mode
# Use when hot reload seems to be serving stale content
serve-clean:
	PYTHONPATH=$(PWD) mkdocs serve --dev-addr $(MKDOCS_DEV_ADDR) --watch-theme

build:
	PYTHONPATH=$(PWD) mkdocs build

cli:
	./doc-cli.sh

# ============================================================================
# Zensical Commands - Modern static site generator from Material for MkDocs team
# ============================================================================

# Zensical development server
zen-serve:
	zensical serve -a $(ZENSICAL_DEV_ADDR)

# Zensical production build
zen-build:
	zensical build
