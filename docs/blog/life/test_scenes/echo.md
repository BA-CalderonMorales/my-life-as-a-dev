# Cellular Prism

----

<!-- Simply use the custom element directly as intended by the component -->
<cellular-prism class="test-scene-container"></cellular-prism>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/",
    "cellular-prism": "/assets/js/components/cellular-prism/cellular-prism.js"
  }
}
</script>

<script type="module">
  // Make sure the script has loaded
  console.log('Loading Cellular Prism component...');

  // Debug flag to help troubleshooting
  window.DEBUG_CELLULAR_PRISM = true;
</script>
