# My Life As A Dev

A better documentation example for everyone to leverage, built with MkDocs and the Material theme.

To see this example in action, visit: https://ba-calderonmorales.github.io/my-life-as-a-dev/

If the site is down for any reason, feel free to ping me. It's using GitHub Actions, so don't bet on things being "production grade".

## Quick Start with GitHub Codespaces
<details>
<summary>Expand</summary>

This repository is configured for GitHub Codespaces, allowing you to start working with the documentation instantly in your browser.

1. Click the green "Code" button on the GitHub repository page
2. Select "Open with Codespaces"
3. Click "New codespace" to launch a new environment
4. Once your Codespace is ready, run the startup script to set up everything automatically:
   ```bash
   ./scripts/startup.sh
   ```
   This script will:
   - Check if you're in a GitHub Codespaces environment
   - Install all required dependencies
   - Start the MkDocs development server
   - Provide you with a clickable URL to access your documentation
</details>

## Local Development
<details>
<summary>Expand</summary>

### Prerequisites
- Python 3.7 or higher
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

3. Install MkDocs and the Material theme:
   ```bash
   pip install requirements.txt # -r requirements.txt if you're in GitHub Codespaces (venv)
   ```

### Working with MkDocs

- **Start the development server:**
  ```bash
  mkdocs serve
  ```
  This will launch a local server at http://127.0.0.1:8000/

- **Build the documentation:**
  ```bash
  mkdocs build
  ```
  The static site will be generated in the `site` directory
</details>

## Project Structure
<details>
<summary>Expand</summary>

```
mkdocs.yml         # MkDocs configuration file
docs/
├── index.md       # Homepage
└── repositories/  # Repository documentation
    └── index.md   # Repository index
```
</details>

## Documentation Versioning
<details>
<summary>Expand</summary>

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

## Testing GitHub Actions Locally
<details>
<summary>Expand</summary>

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

## Contributing
<details>
<summary>Expand</summary>

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
</details>

## License
<details>
<summary>Expand</summary>

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
</details>
