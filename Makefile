.PHONY: help setup serve build cli config check-config optimize-images test gn-analyze gn-status gn-clean

DEV_ADDR ?= 0.0.0.0:8001

help:
	@echo "Commands:"
	@echo "  make setup           - Install Python dependencies and setup project"
	@echo "  make serve           - Start Zensical development server (port 8001)"
	@echo "  make build           - Build site with Zensical"
	@echo "  make config          - Merge config/zensical/*.toml into zensical.toml"
	@echo "  make cli             - Run documentation CLI tools"
	@echo "  make optimize-images - Optimize images (WebP, responsive sizes, LQIP)"
	@echo "  make test            - Run tests"
	@echo ""
	@echo "GitNexus (Code Intelligence):"
	@echo "  make gn-analyze        - Re-index the codebase"
	@echo "  make gn-status         - Check index freshness"
	@echo "  make gn-clean          - Delete the index"

setup:
	uv pip install --upgrade pip
	uv pip install -r requirements.txt
	uv pip install -e .

# Merge modular config files into zensical.toml (force)
config:
	uv run python scripts/python/merge_zensical_config.py

# Check if config needs merging and merge if necessary
check-config:
	@if [ -d "config/zensical" ]; then \
		NEWEST_CONFIG=$$(find config/zensical -name "*.toml" -newer zensical.toml 2>/dev/null | head -1); \
		if [ -n "$$NEWEST_CONFIG" ] || [ ! -f zensical.toml ]; then \
			echo "🔄 Config files changed, merging..."; \
			uv run python scripts/python/merge_zensical_config.py; \
		fi \
	fi

# Primary development server (Zensical) - auto-merges config if needed
serve: check-config
	.venv/bin/zensical serve -a $(DEV_ADDR)

# Primary build command (Zensical) - auto-merges config if needed
build: check-config
	.venv/bin/zensical build

cli:
	./doc-cli.sh

# Optimize images for web delivery (WebP conversion, responsive sizes, LQIP)
# This runs independently of the build for faster iteration
optimize-images:
	@echo "Optimizing images..."
	uv run python -m scripts.python.plugins.image_optimizer.cli --verbose

# Dry run to see what would be optimized
optimize-images-dry:
	@echo "Image optimization dry run..."
	uv run python -m scripts.python.plugins.image_optimizer.cli --dry-run --verbose

# Run all tests
test:
	uv run python -m pytest tests/ -v

# Run image optimizer tests only
test-optimizer:
	uv run python -m pytest tests/test_image_optimizer.py -v

# GitNexus — Code Intelligence
gn-analyze:
	node .gitnexus/run.cjs analyze

gn-status:
	node .gitnexus/run.cjs status

gn-clean:
	node .gitnexus/run.cjs clean

