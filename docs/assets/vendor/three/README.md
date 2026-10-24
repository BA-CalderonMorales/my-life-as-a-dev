# Three.js runtime

Three.js 0.186.0, MIT licensed. The license is in `LICENSE`.

The browser imports this local ESM bundle. It does not load a CDN or third-party runtime scripts. The library is isolated from the page's content and input code.

Rebuild from the published `three@0.186.0` npm tarball with the pinned `esbuild@0.25.12`:

```sh
npm pack three@0.186.0 --pack-destination /tmp
# Extract package/build/three.module.js and package/build/three.core.js.
npx --yes esbuild@0.25.12 /tmp/three/package/build/three.module.js \
  --bundle --minify --format=esm --outfile=docs/assets/vendor/three/three.module.min.js
```

The authored scene is in `docs/assets/js/studio-world/`. Project metadata is in `projects.js`; scene objects are in `models.js`; generated textures and materials are in `materials.js`; input, rendering, and resource ownership are in `World.js`. The loader in `studio-world.js` handles lazy imports, navigation, and fallback.

No scene content is inserted as HTML. Project IDs are allowlisted against the local project map. Pointer drawing is bounded; all experiments run in the browser. WebGL resources and event listeners are released on navigation. Animation renders on demand and pauses when the document or canvas is hidden.
