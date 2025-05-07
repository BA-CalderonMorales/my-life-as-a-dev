# Interactive Physics Playground

----

<!-- Simply use the custom element directly as intended by the component -->
<physics-playground class="test-scene-container"></physics-playground>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/",
    "physics-playground": "/assets/js/components/physics-playground/physics-playground.js"
  }
}
</script>

<script type="module">
  // Make sure the script has loaded
  console.log('Loading Physics Playground component...');

  // Debug flag to help troubleshooting
  window.DEBUG_PHYSICS_PLAYGROUND = true;
</script>