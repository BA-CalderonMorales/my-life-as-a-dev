# Interactive Canvas Dreamscape

----

<!-- Simply use the custom element directly as intended by the component -->
<dreamscape-proto6 class="test-scene-container"></dreamscape-proto6>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/",
    "dreamscape-proto6": "/assets/js/components/dreamscape-proto6/dreamscape-proto6.js"
  }
}
</script>

<script type="module">
  // Make sure the script has loaded
  console.log('Loading Interactive Canvas Dreamscape component...');

  // Debug flag to help troubleshooting
  window.DEBUG_DREAMSCAPE_PROTO6 = true;
</script>