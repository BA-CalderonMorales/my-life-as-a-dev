# My Life As A Dev

A better documentation example for everyone to leverage, built with MkDocs and the Material theme.

To see this example in action, visit: https://ba-calderonmorales.github.io/my-life-as-a-dev/

If the site is down for any reason, feel free to ping me. It's using GitHub Actions, so don't bet on things being "production grade".

## Quick Start with GitHub Codespaces

This repository is configured for GitHub Codespaces, allowing you to start working with the documentation instantly in your browser.

1. Click the green "Code" button on the GitHub repository page
2. Select "Open with Codespaces"
3. Click "New codespace" to launch a new environment

## Local Development

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
   pip install mkdocs mkdocs-material
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

## Project Structure

```
mkdocs.yml         # MkDocs configuration file
docs/
├── index.md       # Homepage
└── repositories/  # Repository documentation
    └── index.md   # Repository index
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
