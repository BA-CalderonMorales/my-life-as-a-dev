# Kaleidoscopic 

----

<!-- Simply use the custom element directly as intended by the component -->
<kaleidoscopic-scene class="test-scene-container"></kaleidoscopic-scene>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/",
    "kaleidoscopic-scene": "/assets/js/components/kaleidoscopic-scene/kaleidoscopic-scene.js"
  }
}
</script>

<script type="module">
  // Make sure the script has loaded
  console.log('Loading Kaleidoscopic Scene component...');

  // Debug flag to help troubleshooting
  window.DEBUG_KALEIDOSCOPIC_SCENE = true;
</script>