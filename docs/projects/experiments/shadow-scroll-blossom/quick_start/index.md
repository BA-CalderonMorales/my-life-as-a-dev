# Quick Start Guide

Get up and running with Shadow Scroll Blossom in minutes.

## Prerequisites

- Node.js 16+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm or Yarn
- Git

## Local Development

### 1. Clone the Repository

```console
$ git clone https://github.com/BA-CalderonMorales/shadow-scroll-blossom.git
$ cd shadow-scroll-blossom
```

### 2. Install Dependencies

```console
$ npm install
$ yarn install
```

### 3. Start the Development Server

```console
$ npm run dev
$ yarn dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### 4. Build for Production

```console
$ npm run build
$ yarn build
```

The production build will be in the `dist/` directory.

### 5. Preview Production Build

```console
$ npm run preview
$ yarn preview
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
   ```console
   $ npm run build
   ```

2. Deploy to GitHub Pages:
   ```console
   $ git add dist -f
$ git commit -m "Deploy to GitHub Pages"
$ git subtree push --prefix dist origin gh-pages
   ```

## Next Steps

- Explore the [Details](../details/index.md) for advanced configuration
- Learn how to [create custom themes](../details/index.md#custom-themes)
- Check out the [keyboard shortcuts](../details/index.md#keyboard-shortcuts)
