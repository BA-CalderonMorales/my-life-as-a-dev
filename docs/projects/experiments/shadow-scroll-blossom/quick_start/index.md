# Quick Start Guide

Get up and running with Shadow Scroll Blossom in minutes.

## Prerequisites

- Node.js 16+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm or Yarn
- Git

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/BA-CalderonMorales/shadow-scroll-blossom.git
cd shadow-scroll-blossom
```

### 2. Install Dependencies

```bash
npm install
```

Or using Yarn:
```bash
yarn install
```

### 3. Start the Development Server

```bash
npm run dev
```

Or using Yarn:
```bash
yarn dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### 4. Build for Production

```bash
npm run build
```

Or using Yarn:
```bash
yarn build
```

The production build will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

Or using Yarn:
```bash
yarn preview
```

## Project Scripts

- `dev`: Start development server
- `build`: Create production build
- `preview`: Preview production build locally
- `lint`: Run ESLint
- `format`: Format code with Prettier

## Deployment

The project is automatically deployed to GitHub Pages on every push to the `main` branch. Pull requests generate preview deployments for review.

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to GitHub Pages:
   ```bash
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

## Next Steps

- Explore the [Details](../details/index.md) for advanced configuration
- Learn how to [create custom themes](../details/index.md#custom-themes)
- Check out the [keyboard shortcuts](../details/index.md#keyboard-shortcuts)
