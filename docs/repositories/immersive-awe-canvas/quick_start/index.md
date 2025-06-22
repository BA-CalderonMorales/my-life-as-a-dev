# Quick Start Guide

Get up and running with Immersive Awe Canvas in minutes.

## Prerequisites

- Node.js 16+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- Bun (recommended) or npm
- Git

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/BA-CalderonMorales/immersive-awe-canvas.git
cd immersive-awe-canvas
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Start the Development Server

```bash
# Using Bun
bun run dev

# Or using npm
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

```bash
# Using Bun
bun run build

# Or using npm
npm run build
```

The production build will be in the `dist/` directory.

### 5. Preview Production Build

```bash
# Using Bun
bun run preview

# Or using npm
npm run preview
```

## Deployment

The project is automatically deployed to GitHub Pages on every push to the `main` branch. Pull requests generate preview deployments for review.

### Manual Deployment

1. Build the project:
   ```bash
   bun run build
   ```

2. Deploy to GitHub Pages:
   ```bash
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

## Project Scripts

- `dev`: Start development server
- `build`: Create production build
- `preview`: Preview production build locally
- `lint`: Run ESLint
- `format`: Format code with Prettier

## Next Steps

- Explore the [Details](/repositories/immersive-awe-canvas/details/) for advanced configuration
- Check out the [keyboard shortcuts](#keyboard-shortcuts) for navigation
- Learn how to [create custom worlds](/repositories/immersive-awe-canvas/details/#creating-custom-worlds)
