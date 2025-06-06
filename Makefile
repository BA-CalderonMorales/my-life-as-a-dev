.PHONY: help setup serve build cli

help:
	@echo "Common commands:"
	@echo "  make setup   - Install Python dependencies and setup project"
	@echo "  make serve   - Run MkDocs development server"
	@echo "  make build   - Build MkDocs documentation"
	@echo "  make cli     - Build and run documentation CLI tools"

setup:
	pip install --upgrade pip
	pip install -r requirements.txt
	pip install -e .

serve:
	PYTHONPATH=$(PWD) mkdocs serve

build:
	PYTHONPATH=$(PWD) mkdocs build

cli:
	./doc-cli.sh
