#!/usr/bin/env bash

# doc-cli.sh - Wrapper for documentation CLI tools
# Builds Rust binaries with cargo and runs the doc-cli entrypoint.

set -euo pipefail

# Colors for better UI
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUST_DIR="${SCRIPT_DIR}/scripts/rust"
RELEASE_DIR="${RUST_DIR}/target/release"
DOC_CLI_BIN="${RELEASE_DIR}/doc-cli"

# Helpers
need() { command -v "$1" >/dev/null 2>&1; }

build_rust_tools() {
  echo -e "\n${YELLOW}Building documentation CLI tools with Cargo...${NC}\n"
  if [ ! -f "${RUST_DIR}/Cargo.toml" ]; then
    echo -e "${RED}Cargo.toml not found at ${RUST_DIR}. Is the repository structure correct?${NC}"
    exit 1
  fi

  if ! need cargo; then
    echo -e "${RED}cargo is not installed or not on PATH.${NC}"
    echo -e "Install Rust toolchain or open this repo in the Dev Container."
    exit 1
  fi

  (cd "${RUST_DIR}" && cargo build --release)
  echo -e "\n${GREEN}All tools built successfully!${NC}\n"
}

run_doc_cli() {
  if [ ! -x "${DOC_CLI_BIN}" ]; then
    echo -e "${RED}Error: doc-cli not found at ${DOC_CLI_BIN}${NC}"
    echo -e "Attempting to build it now..."
    build_rust_tools
  fi

  if [ ! -x "${DOC_CLI_BIN}" ]; then
    echo -e "${RED}✗ Failed to build doc-cli at ${DOC_CLI_BIN}${NC}"
    exit 1
  fi

  "${DOC_CLI_BIN}" "$@"
}

# Main execution
clear
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}       Documentation CLI Tools       ${NC}"
echo -e "${BLUE}=====================================${NC}\n"

# Build then run
build_rust_tools
run_doc_cli "$@"