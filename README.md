# My Life As A Dev

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/BA-CalderonMorales/my-life-as-a-dev/github_pages.yml?branch=main&label=build)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/actions)
[![License](https://img.shields.io/github/license/BA-CalderonMorales/my-life-as-a-dev)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/blob/main/LICENSE)
[![Document Version](https://img.shields.io/badge/docs-latest-blue)](https://ba-calderonmorales.github.io/my-life-as-a-dev/)
[![OpenAI Integration](https://img.shields.io/badge/AI%20Integration-OpenAI-brightgreen)](https://ba-calderonmorales.github.io/my-life-as-a-dev/ai-demo/)

A better documentation example for everyone to leverage, built with MkDocs and the Material theme.

To see this example in action, visit: https://ba-calderonmorales.github.io/my-life-as-a-dev/

If the site is down for any reason, feel free to ping me. It's using GitHub Actions, so don't bet on things being "production grade".

<details>
   <summary><b>⚠️ AI Demo Disclaimer</b></summary>
   The AI integration feature in this repository is for demonstration purposes. When using the [AI Demo](/ai-demo/), you'll need to provide your own OpenAI API key. Please note that OpenAI API usage incurs costs based on token consumption. This project is not responsible for any charges you may incur while using your API key. Always monitor your usage at [OpenAI's usage dashboard](https://platform.openai.com/usage).
</details>

## Getting Started

<details>
<summary><b>GitHub Codespaces</b></summary>

This repository is configured for GitHub Codespaces, allowing you to start working with the documentation instantly in your browser.

1. Click the green "Code" button on the GitHub repository page
2. Select "Open with Codespaces"
3. Click "New codespace" to launch a new environment
4. Once your Codespace is ready, run the simplified CLI wrapper script:
   ```bash
   ./doc-cli.sh
   ```
   This script will:
   - Automatically compile all Rust tools to ensure they're up to date
   - Display an interactive menu to choose which tool to run
   - Allow you to select "startup" to set up the development environment

   You can also directly specify which tool to run:
   ```bash
   ./doc-cli.sh startup
   ```
</details>

<details>
<summary><b>Local Development</b></summary>

### Prerequisites
- Python 3.10 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/BA-CalderonMorales/my-life-as-a-dev.git
   cd my-life-as-a-dev
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install MkDocs and all dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Install the project in development mode to ensure plugins are available:
   ```bash
   pip install -e .
   ```

### Building and Serving Locally

- **Start the development server:**
  ```bash
  # Ensure PYTHONPATH includes current directory for custom plugins
  export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs serve
  
  # On Windows PowerShell:
  # $env:PYTHONPATH="$env:PYTHONPATH;$(pwd)"; mkdocs serve
  ```
  This will launch a local server at http://127.0.0.1:8000/

- **Build the documentation:**
  ```bash
  # Ensure PYTHONPATH includes current directory for custom plugins
  export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs build --verbose
  
  # On Windows PowerShell:
  # $env:PYTHONPATH="$env:PYTHONPATH;$(pwd)"; mkdocs build --verbose
  ```
  The static site will be generated in the `site` directory

- **All-in-one commands:**
  ```bash
  # For development server (Linux/macOS):
  pip install -e . && export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs serve
  
  # For building (Linux/macOS):
  pip install -e . && export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs build --verbose
  
  # For Windows PowerShell:
  # pip install -e .; $env:PYTHONPATH="$env:PYTHONPATH;$(pwd)"; mkdocs serve
  ```

### Verifying Plugin Installation
To verify that the custom plugin is properly installed:
```bash
python -c "import sys; import mkdocs_plugins; print(f'Plugin module found at: {mkdocs_plugins.__file__}')"
```
</details>

## Project Information

<details>
<summary><b>AI Integration Configuration</b></summary>

This project includes AI-powered content generation capabilities using OpenAI's API. To use these features, you need to configure your OpenAI API key.

### Setting Up Your API Key

For security reasons, your API key should not be committed to version control. Instead, use one of these methods:

#### 1. Using a .env File (Recommended for Local Development)

Create a `.env` file in the root directory of the project:

```bash
# In .env file
OPENAI_API_KEY=your_openai_api_key_here
```

Make sure to add `.env` to your `.gitignore` file to prevent accidentally committing your API key.

#### 2. Using Environment Variables

Set the environment variable directly in your terminal:

```bash
# For Linux/macOS
export OPENAI_API_KEY=your_openai_api_key_here

# For Windows (Command Prompt)
set OPENAI_API_KEY=your_openai_api_key_here

# For Windows (PowerShell)
$env:OPENAI_API_KEY="your_openai_api_key_here"
```

#### 3. Using Browser Storage (Coming Soon)

In future releases, we'll add support for securely storing your API key in your browser's localStorage with encryption.

### Verifying Your Configuration

You can verify that your API key is correctly configured by:

1. Starting the MkDocs development server: `mkdocs serve`
2. Checking the console logs for a message saying "AI Plugin: API key found in environment variables"
3. Visiting the [AI Demo page](/ai-demo/) to test the AI features

### Rate Limiting & Token Usage

Please be aware that the OpenAI API has rate limits and token usage costs. The AI plugin is designed to be efficient, but be mindful of your API usage.
</details>

<details>
<summary><b>Project Structure</b></summary>

```
mkdocs.yml         # MkDocs configuration file
docs/
├── index.md       # Homepage
└── repositories/  # Repository documentation
    └── index.md   # Repository index
```
</details>

<details>
<summary><b>Documentation Versioning</b></summary>

This project uses MkDocs with the mike plugin for versioned documentation. The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### How to Create a New Version

To create a new version of the documentation:

1. Make sure all your changes are committed and pushed to the main branch.

2. Run the version bumping script:
   ```bash
   ./scripts/bump-version.sh
   ```

3. Select the type of version bump you want to make:
   - Major (x.0.0): For significant changes
   - Minor (0.x.0): For new features
   - Patch (0.0.x): For bug fixes and minor updates

4. Confirm your selection when prompted.

5. The script will:
   - Create a new Git tag with the version
   - Push the tag to the remote repository
   - Update the local versions.json file (if it exists)

6. The GitHub Actions workflow will automatically:
   - Build the documentation with the new version
   - Deploy it to GitHub Pages
   - Update version selectors in the documentation

### Available Versions

The documentation maintains multiple versions that can be accessed from the version selector in the navigation. This allows users to view documentation for specific releases of the project.
</details>

<details>
<summary><b>Testing GitHub Actions Locally</b></summary>

This project includes a test workflow that can be run locally using [Act](https://github.com/nektos/act), allowing you to verify the behavior of the GitHub Actions workflow before pushing changes.

### Installing Act

```bash
# macOS (using Homebrew)
brew install act

# Linux
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows (using Chocolatey)
choco install act-cli
```

### Running the Test Workflow

To test the documentation versioning workflow locally:

```bash
# Run with default parameters
act -j test_docs -w .github/workflows/test_github_pages.yml

# Run with a specific version
act -j test_docs -w .github/workflows/test_github_pages.yml -P version=1.2.3
```

This will simulate the GitHub Actions workflow and show you what would happen during the actual deployment, including:

1. Building the MkDocs site
2. Running mike commands in dry-run mode
3. Displaying what versions would be created

The test workflow is non-destructive and won't push any changes to your repository or deploy actual documentation.
</details>

<details>
<summary><b>Documentation CLI Tool</b></summary>

This project includes a unified command-line tool written in Rust for managing documentation workflows. The tool provides a consistent interface for common tasks related to development, versioning, and deployment.

### Using the CLI Tool

You can run the Documentation CLI tool using:

```bash
./scripts/target/release/doc-cli
```

Or with a specific command:

```bash
./scripts/target/release/doc-cli [command]
```

### Available Commands

The tool supports the following commands:

- **startup**: Start the development environment
  - Sets up MkDocs with mike for versioned documentation
  - Installs required dependencies
  - Starts the documentation server
  - Example: `doc-cli startup`

- **bump-version**: Bump the documentation version
  - Creates a new Git tag with semantic versioning
  - Offers options to deploy the new version
  - Can set a version as the "latest" alias
  - Example: `doc-cli bump-version`

- **deploy**: Deploy all documentation versions
  - Deploys all versions from Git tags to GitHub Pages
  - Avoids redeploying versions that are already present
  - Supports force-redeployment with the `-f` or `--force` flag
  - Example: `doc-cli deploy` or `doc-cli deploy --force`

- **help**: Show detailed help information
  - Displays usage information for all commands
  - Example: `doc-cli help`

### Interactive Menu

Running the tool without any arguments launches an interactive menu where you can select the operation you want to perform.

### Implementation Details

The CLI tool is written in Rust for performance and reliability. It replaces the original shell scripts with a more robust implementation that follows software engineering best practices:

- **SOLID principles**: Each command is encapsulated in its own module with a single responsibility
- **DRY (Don't Repeat Yourself)**: Common functionality is abstracted into reusable components
- **Error handling**: Comprehensive error handling with informative messages
- **User experience**: Color-coded output and clear progress indicators

### CLI Wrapper Script

For convenience, a wrapper script `doc-cli.sh` is provided. This script simplifies the usage of the CLI tool by:

- Automatically compiling all Rust tools to ensure they're up to date
- Displaying an interactive menu to choose which tool to run
- Allowing direct execution of specific commands, e.g., `./doc-cli.sh startup`

First, you'll need to make the script executable (this only needs to be done once):

```bash
chmod +x ./doc-cli.sh
```

Then you can use it as follows:

```bash
# Launch interactive menu
./doc-cli.sh

# Run a specific command
./doc-cli.sh startup
```

</details>

<details>
<summary><b>Contributing</b></summary>

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
</details>

<details>
<summary><b>License</b></summary>

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
</details>
