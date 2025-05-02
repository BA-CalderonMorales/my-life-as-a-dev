#!/usr/bin/env bash

# doc-cli.sh - Wrapper for documentation CLI tools
# This script builds all Rust modules and provides a unified interface to the doc-cli tools

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for better UI
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELEASE_DIR="${SCRIPT_DIR}/scripts/target/release"
SRC_DIR="${SCRIPT_DIR}/scripts"

# Make sure the release directory exists
mkdir -p "${RELEASE_DIR}"

# Function to show a spinner while compiling
show_spinner() {
  local pid=$1
  local delay=0.1
  local spinstr='|/-\'
  while [ "$(ps a | awk '{print $1}' | grep -w $pid)" ]; do
    local temp=${spinstr#?}
    printf " [%c]  " "$spinstr"
    local spinstr=$temp${spinstr%"$temp"}
    sleep $delay
    printf "\b\b\b\b\b\b"
  done
  printf "    \b\b\b\b"
}

# Function to compile a Rust file
compile_rust_file() {
  local source_file="$1"
  local binary_name="$(basename "$source_file" .rs)"
  local output_path="${RELEASE_DIR}/${binary_name}"
  
  echo -e "${BLUE}Compiling ${binary_name}...${NC}"
  
  # Run the compilation in the background and show a spinner
  rustc -o "${output_path}" "${source_file}" &
  show_spinner $!
  
  if [ -f "${output_path}" ]; then
    echo -e "${GREEN}✓ ${binary_name} compiled successfully${NC}"
    # Make the binary executable
    chmod +x "${output_path}"
  else 
    echo -e "${RED}✗ Failed to compile ${binary_name}${NC}"
    exit 1
  fi
}

# Compile all Rust files
compile_all_rust_files() {
  echo -e "\n${YELLOW}Building documentation CLI tools...${NC}\n"
  
  # Find all Rust files in the scripts directory and compile them
  for rust_file in "${SRC_DIR}"/*.rs; do
    if [ -f "$rust_file" ]; then
      compile_rust_file "$rust_file"
    fi
  done
  
  echo -e "\n${GREEN}All tools built successfully!${NC}\n"
}

# Function to run the doc-cli tool
run_doc_cli() {
  local doc_cli_path="${RELEASE_DIR}/doc-cli"
  
  if [ ! -f "$doc_cli_path" ]; then
    echo -e "${RED}Error: doc-cli not found at ${doc_cli_path}${NC}"
    echo -e "Attempting to build it now..."
    compile_rust_file "${SRC_DIR}/doc-cli.rs"
  fi
  
  # Pass any arguments to the doc-cli tool
  "${doc_cli_path}" "$@"
}

# Main execution
clear
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}       Documentation CLI Tools       ${NC}"
echo -e "${BLUE}=====================================${NC}\n"

# Build all tools first
compile_all_rust_files

# Run the doc-cli tool with any arguments
run_doc_cli "$@"