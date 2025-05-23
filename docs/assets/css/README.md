# CSS Structure

This directory contains all the stylesheets for the website organized in a modular, maintainable structure.

## Organization

The CSS is organized into several modules with clear separation of concerns:

### Core Structure

- `importmap.css` - Main entry point that imports all other CSS files
- `core/` - Foundation styles for the entire site
- `components/` - Reusable component styles
- `landing-page/` - Styles specific to the landing page

## Import Hierarchy

1. **Theme Variables** (`core/theme-colors.css`) - Imported first so variables are available everywhere
2. **Core Styles** (`core/index.css`) - Basic styling, layout, animations
3. **Component Styles** (`components/index.css`) - Reusable visual elements
4. **Landing Page** (`landing-page/index.css`) - Page-specific styling

## Component System

- `components/base-component.css` - Foundation styles for all components
- Individual component files extend these base styles

## Maintenance Guidelines

1. Keep related styles together in the appropriate module
2. Use CSS variables from `theme-colors.css` for consistent design
3. Follow the established naming conventions:
   - `.component-*` for component elements
   - `.md-*` for theme overrides
   - `.landing-*` for landing page elements
4. Avoid deep nesting (max 3 levels) to keep specificity manageable
5. Document complex or non-obvious styles with comments
