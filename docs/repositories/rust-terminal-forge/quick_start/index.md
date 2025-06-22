# Quick Start Guide

Get up and running with Rust Terminal Forge in minutes.

## Prerequisites

- Node.js 16+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- Rust toolchain (install via [rustup](https://rustup.rs/))
- wasm-pack (`cargo install wasm-pack`)
- npm or Yarn
- Git

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/BA-CalderonMorales/rust-terminal-forge.git
cd rust-terminal-forge
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Build the Rust WebAssembly package
wasm-pack build
```

### 3. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### 4. Build for Production

```bash
# Build the Rust WebAssembly package for production
wasm-pack build --release

# Build the frontend
npm run build
# or
yarn build
```

The production build will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## Project Scripts

- `dev`: Start development server
- `build`: Create production build
- `preview`: Preview production build locally
- `test`: Run tests
- `lint`: Run ESLint
- `format`: Format code with Prettier

## Deployment

The project is automatically deployed to GitHub Pages on every push to the `main` branch. Pull requests generate preview deployments for review.

### Manual Deployment

1. Build the project:
   ```bash
   wasm-pack build --release
   npm run build
   ```

2. Deploy to GitHub Pages:
   ```bash
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

## Next Steps

- Explore the [Details](/repositories/rust-terminal-forge/details/) for advanced configuration
- Learn about the [terminal features](/repositories/rust-terminal-forge/details/#terminal-features)
- Check out the [keyboard shortcuts](/repositories/rust-terminal-forge/details/#keyboard-shortcuts)
