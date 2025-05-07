# Dream Scape

----

<!-- Simply use the custom element directly as intended by the component -->
<dreamscape-proto4 class="test-scene-container"></dreamscape-proto4>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/",
    "dreamscape-proto4": "/assets/js/components/dreamscape-proto4/dreamscape-proto4.js"
  }
}
</script>

<script type="module">
  // Make sure the script has loaded
  console.log('Loading Dreamscape Proto4 component...');

  // Debug flag to help troubleshooting
  window.DEBUG_DREAMSCAPE = true;
</script>