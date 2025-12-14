.PHONY: help setup serve build cli mkdocs-serve mkdocs-build

DEV_ADDR ?= 0.0.0.0:8001

help:
	@echo "Commands:"
	@echo "  make setup        - Install Python dependencies and setup project"
	@echo "  make serve        - Start Zensical development server (port 8001)"
	@echo "  make build        - Build site with Zensical"
	@echo "  make cli          - Run documentation CLI tools"
	@echo ""
	@echo "Legacy MkDocs commands:"
	@echo "  make mkdocs-serve - Run MkDocs development server (port 8000)"
	@echo "  make mkdocs-build - Build with MkDocs"

setup:
	uv run python -m pip install --upgrade pip
	uv pip install -r requirements.txt
	uv pip install -e .

# Primary development server (Zensical)
serve:
	zensical serve -a $(DEV_ADDR)

# Primary build command (Zensical)
build:
	zensical build

cli:
	./doc-cli.sh

# ============================================================================
# Legacy MkDocs Commands (for versioning with mike or custom plugins)
# ============================================================================

mkdocs-serve:
	PYTHONPATH=$(PWD) mkdocs serve --dev-addr 127.0.0.1:8000 --dirty --watch-theme

mkdocs-build:
	PYTHONPATH=$(PWD) mkdocs build
