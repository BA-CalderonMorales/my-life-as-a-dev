.PHONY: help setup serve build cli

MKDOCS_DEV_ADDR ?= 127.0.0.1:8000

help:
	@echo "Common commands:"
	@echo "  make setup   - Install Python dependencies and setup project"
	@echo "  make serve   - Run MkDocs development server"
	@echo "  make build   - Build MkDocs documentation"
	@echo "  make cli     - Build and run documentation CLI tools"

setup:
	uv run python -m pip install --upgrade pip
	uv pip install -r requirements.txt
	uv pip install -e .

serve:
	PYTHONPATH=$(PWD) mkdocs serve --dev-addr $(MKDOCS_DEV_ADDR) --dirty --watch-theme

build:
	PYTHONPATH=$(PWD) mkdocs build

cli:
	./doc-cli.sh
