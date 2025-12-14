.PHONY: help setup serve serve-clean build cli

MKDOCS_DEV_ADDR ?= 127.0.0.1:8000

help:
	@echo "Common commands:"
	@echo "  make setup       - Install Python dependencies and setup project"
	@echo "  make serve       - Run MkDocs development server (fast, dirty mode)"
	@echo "  make serve-clean - Run MkDocs server with full rebuilds (slower but reliable)"
	@echo "  make build       - Build MkDocs documentation"
	@echo "  make cli         - Build and run documentation CLI tools"

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
