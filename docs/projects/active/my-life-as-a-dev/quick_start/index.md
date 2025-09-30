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

```bash
# On Windows
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
pip install -e .  # Install in development mode
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
# Build the CLI tools
cd scripts
cargo build --release

# Run the interactive menu
./target/release/doc-cli

# Or run directly
./doc-cli.sh
```

## AI Integration Setup

1. Create a `.env` file in the root directory:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. Restart the MkDocs server for changes to take effect.

## Next Steps

- Explore the [Details](../details/index.md) section for advanced configuration
