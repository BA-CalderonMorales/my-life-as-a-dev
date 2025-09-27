#!/usr/bin/env bash
set -euo pipefail

log() { echo -e "[setup] $*"; }

ROOT_DIR="/workspaces/my-life-as-a-dev"
VENV_DIR="$ROOT_DIR/.venv"

# Ensure basic packages
if command -v sudo >/dev/null 2>&1; then SUDO="sudo"; else SUDO=""; fi
$SUDO apt-get update -y
$SUDO apt-get install -y --no-install-recommends curl ca-certificates git build-essential pkg-config

# Install uv (https://github.com/astral-sh/uv)
if ! command -v uv >/dev/null 2>&1; then
  log "Installing uv..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
else
  log "uv already installed"
fi

# Ensure uv is on PATH for current and future shells
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
if [ -d /etc/profile.d ] && ! grep -q "uv PATH" /etc/profile.d/uv_path.sh 2>/dev/null; then
  log "Persisting uv PATH"
  echo "# uv PATH\nexport PATH=\"$HOME/.local/bin:$HOME/.cargo/bin:\$PATH\"" | $SUDO tee /etc/profile.d/uv_path.sh >/dev/null
  $SUDO chmod 0755 /etc/profile.d/uv_path.sh || true
fi

# Create Python virtual environment with uv and install deps
if [ ! -d "$VENV_DIR" ]; then
  log "Creating Python venv at $VENV_DIR"
  uv venv "$VENV_DIR"
fi

export VIRTUAL_ENV="$VENV_DIR"
export PATH="$VENV_DIR/bin:$PATH"

# Upgrade pip inside venv for compatibility (uv manages, but safe)
python -m pip install --upgrade pip >/dev/null 2>&1 || true

# Install project Python dependencies if present
if [ -f "$ROOT_DIR/requirements.txt" ]; then
  log "Installing Python deps with uv pip from requirements.txt"
  uv pip install -r "$ROOT_DIR/requirements.txt"
fi

# Install doc-cli Rust binary to PATH and create repo-level shim
if command -v cargo >/dev/null 2>&1; then
  if ! command -v doc-cli >/dev/null 2>&1; then
    log "Installing doc-cli (cargo install)"
    (cd "$ROOT_DIR/scripts/rust" && cargo install --path . --bin doc-cli)
  else
    log "doc-cli already installed"
  fi
  # Create a convenient symlink so ./doc-cli works in repo root
  DOC_BIN_PATH="$(command -v doc-cli || true)"
  if [ -n "$DOC_BIN_PATH" ] && [ -x "$DOC_BIN_PATH" ]; then
    ln -sf "$DOC_BIN_PATH" "$ROOT_DIR/doc-cli"
    chmod +x "$ROOT_DIR/doc-cli" || true
  fi
fi

# Quick MkDocs sanity check (does not start server)
if command -v mkdocs >/dev/null 2>&1; then
  log "Running MkDocs sanity check (build config)..."
  (cd "$ROOT_DIR" && mkdocs --version && mkdocs build -q -s || true)
fi

# Print versions and readiness
log "Tool versions:"
set +e
python --version 2>/dev/null
pip --version 2>/dev/null
rustc --version 2>/dev/null
cargo --version 2>/dev/null
uv --version 2>/dev/null
set -e

echo
echo "=================================================="
echo "Dev environment ready"
echo "- Python venv: $VENV_DIR"
echo "- Python: $(python --version 2>/dev/null || echo 'N/A')"
echo "- Cargo: $(cargo --version 2>/dev/null || echo 'N/A')"
echo "- Rustc: $(rustc --version 2>/dev/null || echo 'N/A')"
echo "- uv: $(uv --version 2>/dev/null || echo 'N/A')"
echo "--------------------------------------------------"
echo "Next steps:"
echo "1) MkDocs dev server (optional):"
echo "   uv run mkdocs serve -a 0.0.0.0:8000"
echo "2) Doc CLI help:"
echo "   doc-cli --help    # or ./doc-cli"
echo "3) Build Rust tools (optional):"
echo "   cd scripts/rust && cargo build"
echo "4) Install/update Python deps:"
echo "   uv pip install -r requirements.txt"
echo "=================================================="
