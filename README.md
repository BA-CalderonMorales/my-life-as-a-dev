<div align="center">
  <h1>My Life As A Dev</h1>
  <br><br>
  <a href="https://github.com/BA-CalderonMorales/my-life-as-a-dev/actions"><img src="https://img.shields.io/github/actions/workflow/status/BA-CalderonMorales/my-life-as-a-dev/github_pages.yml?branch=main&label=build" alt="GitHub Workflow Status"></a>
  <a href="https://github.com/BA-CalderonMorales/my-life-as-a-dev/blob/main/LICENSE"><img src="https://img.shields.io/github/license/BA-CalderonMorales/my-life-as-a-dev" alt="License"></a>
  <a href="https://ba-calderonmorales.github.io/my-life-as-a-dev/"><img src="https://img.shields.io/badge/docs-latest-blue" alt="Document Version"></a>
</div>

<div align="center">
  <a href="https://ba-calderonmorales.github.io/my-life-as-a-dev/" target="_blank">
    <br>
    <strong>Click to see the live demo</strong>
  </a>
</div>

<br/>
<div align="center">
  <em>The site is hosted on GitHub Pages and may occasionally be unavailable. Please reach out if you encounter issues.</em>
</div>

<br/>

##  Developer Onboarding

<details>
<summary><b> GitHub Codespaces</b></summary>
<div style="padding: 15px">
   <p>This repository is configured for GitHub Codespaces, allowing you to start working with the documentation instantly in your browser.</p>

   <ol>
     <li>Click the green "Code" button on the GitHub repository page</li>
     <li>Select "Open with Codespaces"</li>
     <li>Click "New codespace" to launch a new environment</li>
     <li>Once your Codespace is ready, run the simplified CLI wrapper script:<br/><br/>
     </li>

```bash
./doc-cli.sh startup
```
   </ol>

   <p>This script will:</p>
   <ul>
     <li> Automatically compile all Rust tools to ensure they're up to date</li>
     <li> Display an interactive menu to choose which tool to run</li>
     <li> Allow you to select "startup" to set up the development environment</li>
   </ul>

   <p>You can also directly specify which tool to run:</p>

```bash
./doc-cli.sh startup
```
</div>
</details>

<details>
<summary><b> Local Development</b></summary>
<div style="padding: 15px">

   <h3> Prerequisites</h3>
   <ul>
     <li> Python 3.10 or higher</li>
     <li> pip (Python package manager)</li>
   </ul>

   <h3> Installation</h3>

   <ol>

   <li>Clone the repository:</li>     

   ```bash
   git clone https://github.com/BA-CalderonMorales/my-life-as-a-dev.git
   cd my-life-as-a-dev
   ```
   <li>Create and activate a virtual environment (optional but recommended):</li>
     
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
   <li>Install MkDocs and all dependencies:</li>
     
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
   <li>Install the project in development mode to ensure plugins are available:</li>
     
   ```bash
   pip install -e .
   ```
   </ol>

   <h3> Building and Serving Locally</h3>

   <ul>

   <li><strong> Start the development server:</strong></li>
   
   ```bash
   # Ensure PYTHONPATH includes current directory for custom plugins
   export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs serve

   # On Windows PowerShell:
   # $env:PYTHONPATH="$env:PYTHONPATH;$(pwd)"; mkdocs serve
   ```

   <p>This will launch a local server at http://127.0.0.1:8000/</p>

   <li><strong> Build the documentation:</strong></li>
     
   ```bash
   # Ensure PYTHONPATH includes current directory for custom plugins
   export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs build --verbose

   # On Windows PowerShell:
   # $env:PYTHONPATH="$env:PYTHONPATH;$(pwd)"; mkdocs build --verbose
   ```
   <p>The static site will be generated in the <code>site</code> directory</p>

   <li><strong> All-in-one commands:</strong></li>
     
   ```bash
   # For development server (Linux/macOS):
   pip install -e . && export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs serve

   # For building (Linux/macOS):
   pip install -e . && export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs build --verbose

   # For Windows PowerShell:
   # pip install -e .; $env:PYTHONPATH="$env:PYTHONPATH;$(pwd)"; mkdocs serve
   ```

   </ul>

   <h3> Verifying Plugin Installation</h3>

   <p>To verify that the custom plugin is properly installed:</p>
   
   ```python
   python -c "import sys; import mkdocs_plugins; print(f'Plugin module found at: {mkdocs_plugins.__file__}')"
   ```

</div>

</details>

##  Project Information

<details>
<summary><b> Project Structure</b></summary>
<div style="padding: 15px">

This section outlines the key directories and files in the project to help you navigate and understand its components.

Below is a simplified overview of the project structure:

```
my-life-as-a-dev/
├── mkdocs.yml             # MkDocs configuration file
├── requirements.txt       # Python dependencies
├── doc-cli.sh             # CLI wrapper script
├── docs/                  # Documentation source files
│   ├── .nav.yml           # Navigation configuration - MkDocs Material 
│   ├── index.md           # Homepage
│   ├── assets/            # Images and static files
│   ├── repositories/      # Contains pages relevant to repositories
│   ├── overrides/         # MkDocs Material theme overrides
├── mkdocs_plugins/        # Custom MkDocs plugins
│   └── version_plugin/    # Documentation versioning plugin
└── scripts/               # Utility scripts

```

For the most accurate and up-to-date project structure, please refer to the [GitHub repository](https://github.com/BA-CalderonMorales/my-life-as-a-dev).

</div>
</details>

<details>
<summary><b> Documentation Versioning</b></summary>
<div style="padding: 15px">

   <p>This project uses MkDocs with the mike plugin for versioned documentation. The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch.</p>

   <h3> How to Create a New Version</h3>

   <p>To create a new version of the documentation:</p>

   <ol>

   <li>Make sure all your changes are committed and pushed to the main branch.</li>

   <li>Run the version bumping script:</li>
     
   ```bash
   ./scripts/bump-version.sh
   ```

   <li>Select the type of version bump you want to make:
      <ul>
      <li> <strong>Major (x.0.0)</strong>: For significant changes</li>
      <li> <strong>Minor (0.x.0)</strong>: For new features</li>
      <li> <strong>Patch (0.0.x)</strong>: For bug fixes and minor updates</li>
      </ul>
   </li>

   <li>Confirm your selection when prompted.</li>
     <li>The script will:
       <ul>
         <li> Create a new Git tag with the version</li>
         <li> Push the tag to the remote repository</li>
         <li> Update the local versions.json file (if it exists)</li>
       </ul>
     </li>
     <li>The GitHub Actions workflow will automatically:
       <ul>
         <li> Build the documentation with the new version</li>
         <li> Deploy it to GitHub Pages</li>
         <li> Update version selectors in the documentation</li>
       </ul>
     </li>
   </ol>

   <h3> Available Versions</h3>

   <p>The documentation maintains multiple versions that can be accessed from the version selector in the navigation. This allows users to view documentation for specific releases of the project.</p>

</div>
</details>

<details>
<summary><b> Testing GitHub Actions Locally</b></summary>
<div style="padding: 15px">

   <p>This project includes a test workflow that can be run locally using <a href="https://github.com/nektos/act">Act</a>, allowing you to verify the behavior of the GitHub Actions workflow before pushing changes.</p>

   <h3> Installing Act</h3>

   
   ```bash
   # macOS (using Homebrew)
   brew install act

   # Linux
   curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

   # Windows (using Chocolatey)
   choco install act-cli
   ```

   <h3> Running the Test Workflow</h3>

   <p>To test the documentation versioning workflow locally:</p>

   ```bash
   # Run with default parameters
   act -j test_docs -w .github/workflows/test_github_pages.yml

   # Run with a specific version
   act -j test_docs -w .github/workflows/test_github_pages.yml -P version=1.2.3
   ```

   <p>This will simulate the GitHub Actions workflow and show you what would happen during the actual deployment, including:</p>

   <ol>
     <li> Building the MkDocs site</li>
     <li> Running mike commands in dry-run mode</li>
     <li> Displaying what versions would be created</li>
   </ol>

   <p>The test workflow is non-destructive and won't push any changes to your repository or deploy actual documentation.</p>
</div>
</details>

<details>
<summary><b> Documentation CLI Tool</b></summary>
<div style="padding: 15px">

   <p>This project includes a unified command-line tool written in Rust for managing documentation workflows. The tool provides a consistent interface for common tasks related to development, versioning, and deployment.</p>

   <h3> Using the CLI Tool</h3>

   <p>You can run the Documentation CLI tool using:</p>

   <pre><code>./scripts/target/release/doc-cli</code></pre>

   <p>Or with a specific command:</p>

   <pre><code>./scripts/target/release/doc-cli [command]</code></pre>

   <h3> Available Commands</h3>

   <p>The tool supports the following commands:</p>

   <ul>

   <li>
      <p> <strong>startup</strong>: Start the development environment</p>
      <ul>
      <li>Sets up MkDocs with mike for versioned documentation</li>
      <li>Installs required dependencies</li>
      <li>Starts the documentation server</li>
      <li>Example: <code>doc-cli startup</code></li>
      </ul>
   </li>

   <li>
      <p> <strong>bump-version</strong>: Bump the documentation version</p>
      <ul>
      <li>Creates a new Git tag with semantic versioning</li>
      <li>Offers options to deploy the new version</li>
      <li>Can set a version as the "latest" alias</li>
      <li>Example: <code>doc-cli bump-version</code></li>
      </ul>
   </li>

   <li>
      <p> <strong>deploy</strong>: Deploy all documentation versions</p>
      <ul>
      <li>Deploys all versions from Git tags to GitHub Pages</li>
      <li>Avoids redeploying versions that are already present</li>
      <li>Supports force-redeployment with the <code>-f</code> or <code>--force</code> flag</li>
      <li>Example: <code>doc-cli deploy</code> or <code>doc-cli deploy --force</code></li>
      </ul>
   </li>

   <li>
      <p> <strong>help</strong>: Show detailed help information</p>
      <ul>
      <li>Displays usage information for all commands</li>
      <li>Example: <code>doc-cli help</code></li>
      </ul>
   </li>

</ul>

   <h3> Interactive Menu</h3>

   <p>Running the tool without any arguments launches an interactive menu where you can select the operation you want to perform.</p>

   <h3> Implementation Details</h3>

   <p>The CLI tool is written in Rust for performance and reliability. It replaces the original shell scripts with a more robust implementation that follows software engineering best practices:</p>

   <ul>
     <li> <strong>SOLID principles</strong>: Each command is encapsulated in its own module with a single responsibility</li>
     <li> <strong>DRY (Don't Repeat Yourself)</strong>: Common functionality is abstracted into reusable components</li>
     <li> <strong>Error handling</strong>: Comprehensive error handling with informative messages</li>
     <li> <strong>User experience</strong>: Color-coded output and clear progress indicators</li>
   </ul>

   <h3> CLI Wrapper Script</h3>

   <p>For convenience, a wrapper script <code>doc-cli.sh</code> is provided. This script simplifies the usage of the CLI tool by:</p>

   <ul>
     <li> Automatically compiling all Rust tools to ensure they're up to date</li>
     <li> Displaying an interactive menu to choose which tool to run</li>
     <li> Allowing direct execution of specific commands, e.g., <code>./doc-cli.sh startup</code></li>
   </ul>

   <p>First, you'll need to make the script executable (this only needs to be done once):</p>

   <pre><code>chmod +x ./doc-cli.sh</code></pre>

   <p>Then you can use it as follows:</p>

   <pre><code># Launch interactive menu
./doc-cli.sh

# Run a specific command
./doc-cli.sh startup</code></pre>
</div>

</details>

<details>
<summary><b> Contributing</b></summary>
<div style="padding: 15px">

   <ol>
     <li> Fork the repository</li>
     <li> Create your feature branch (<code>git checkout -b feature/amazing-feature</code>)</li>
     <li> Commit your changes (<code>git commit -m 'Add some amazing feature'</code>)</li>
     <li> Push to the branch (<code>git push origin feature/amazing-feature</code>)</li>
     <li> Open a Pull Request</li>
   </ol>
</div>
</details>

<details>
<summary><b> License</b></summary>
<div style="padding: 15px">

   <p>This project is licensed under the Apache License 2.0 - see the <a href="LICENSE">LICENSE</a> file for details.</p>
</div>
</details>
