# Three.js Canvas Skill

When to use: Adding/modifying the interactive Three.js canvas page at `/canvas/`.

## Architecture

### Scene Structure

```
docs/assets/js/canvas/
  scene/
    main.js                  # Entry point, page detection, scene lifecycle
    ZenGeometryScene.js      # Default geometric scene (nodes, connections, particles)
    CrystalCaveScene.js      # Alternative crystal cave scene
    interaction/
      InteractionManager.js  # Battle-tested mouse + touch handler (reference impl)
    camera/
      OrbitCamera.js         # Spherical orbit camera with focus/reset
```

### Scene Lifecycle

1. `main.js` detects canvas page via `body.canvas-page` class
2. Creates scene instance, calls `init()`
3. Scene creates its own container div (`position: fixed`) positioned between header and footer
4. Handles `resize`, `scroll`, and `orientationchange` for responsive sizing
5. Theme observer watches `data-md-color-scheme` attribute changes
6. `destroy()` cleans up all listeners, geometries, materials, and DOM

### Key Patterns

**Device Detection:**
```js
this.isMobile = window.innerWidth < 768;
this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
```
Used to adjust: FOV, camera distance, particle count, pixel ratio, node scale.

**Theme Integration:**
Scenes read `document.body.getAttribute('data-md-color-scheme')` and provide dual color palettes (light/dark). A MutationObserver on `document.body` triggers `_updateTheme()` when the attribute changes.

**Mobile Touch (ZenGeometryScene):**
- `touchstart`: single-touch orbit + two-finger pinch detection
- `touchmove`: drag orbit (orbitAngle/orbitTilt), pinch-to-zoom (camera distance)
- `touchend`: tap detection (<300ms, <10px movement) -- tap node to zoom, tap empty to reset
- `orientationchange`: delayed resize for browser settle

**Mobile Touch (InteractionManager -- reference):**
Full-featured touch system with `isTouching`, `isPinching`, `touchMoved`, `touchStartTime` state. Handles orbit, pinch-zoom, tap-to-select, and 3D mouse position for particle attraction. Copy patterns from here for new scenes.

## CSS (`docs/assets/css/canvas.css`)

- `.canvas-stage__viewport` uses `touch-action: pan-y` (allows vertical scroll past canvas)
- `dvh` units used as fallback for iOS Safari dynamic viewport
- `env(safe-area-inset-*)` for notched device padding
- Landscape orientation hides controls for immersive canvas
- `overscroll-behavior: contain` prevents pull-to-refresh interference

## Performance Guidelines

- Mobile: `antialias: false`, `pixelRatio: min(dpr, 1.5)`, `powerPreference: 'low-power'`
- Reduce particle count on mobile (25 vs 40)
- Use `requestAnimationFrame` loop with `isDestroyed` guard
- Dispose all geometries and materials in `destroy()`
- Limit fog density and emissive intensity for GPU budget

## Adding a New Scene

1. Create `docs/assets/js/canvas/scene/MyScene.js` extending the pattern from `ZenGeometryScene`
2. Implement: `constructor`, `init()`, `destroy()`, `_setupScene()`, `_createGeometry()`, `_setupInteraction()`, `_startRenderLoop()`, `_setupThemeObserver()`, `_updateTheme()`
3. Copy touch handlers from `InteractionManager.js` or `ZenGeometryScene.js`
4. Register in `main.js` scene selection logic
5. Test with mobile emulation in browser devtools (touch, orientation, resize)
