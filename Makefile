.PHONY: help setup serve build cli

DEV_ADDR ?= 0.0.0.0:8001

help:
	@echo "Commands:"
	@echo "  make setup        - Install Python dependencies and setup project"
	@echo "  make serve        - Start Zensical development server (port 8001)"
	@echo "  make build        - Build site with Zensical"
	@echo "  make cli          - Run documentation CLI tools"

setup:
	uv pip install --upgrade pip
	uv pip install -r requirements.txt
	uv pip install -e .

# Primary development server (Zensical)
serve:
	.venv/bin/zensical serve -a $(DEV_ADDR)

# Primary build command (Zensical)
build:
	.venv/bin/zensical build

cli:
	./doc-cli.sh
