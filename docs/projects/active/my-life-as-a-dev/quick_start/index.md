---
comments: true
---

# Quick Start Guide

Get up and running with the Docs-as-Code Portfolio in minutes.

## Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Git

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/BA-CalderonMorales/my-life-as-a-dev.git
cd my-life-as-a-dev
```

### 2. Set Up Virtual Environment (Recommended)

**On Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
uv run python -m pip install --upgrade pip
uv pip install -r requirements.txt
uv pip install -e .  # Install in development mode
```

### 4. Start the Development Server

```bash
# Set PYTHONPATH and start the server
export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs serve

# On Windows PowerShell:
# $env:PYTHONPATH="$env:PYTHONPATH;$(pwd)"; mkdocs serve
```

The site will be available at http://127.0.0.1:8000/

## Building for Production

```bash
export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs build --verbose
```

The static site will be generated in the `site` directory.

## Using the CLI Tool

The project includes a Rust-based CLI tool for common tasks:

```bash
cd scripts
cargo build --release
./target/release/doc-cli
./doc-cli.sh
```

## AI Integration Setup (Local Development Only)

> **Important**: AI features are currently disabled in production. This setup is for local development and testing only.

The AI proxy uses GitHub Models (Azure AI Inference) instead of OpenAI.

1. Set up your GitHub Personal Access Token:
   ```bash
   export GITHUB_TOKEN=your_github_pat_here
   ```

2. Start the AI proxy (optional, for testing AI features):
   ```bash
uv run python scripts/python/ai_proxy.py
```

3. Default AI model: `deepseek/DeepSeek-R1`

Note: The AI chat UI is currently commented out in production builds. See AGENTS.md for security requirements before enabling in production.

## Next Steps

- Explore the [Details](../details/index.md) section for advanced configuration
