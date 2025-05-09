# Intergalactic Dreamscape

----

<!-- Simply use the custom element directly as intended by the component -->
<intergalactic-scene class="test-scene-container"></intergalactic-scene>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/",
    "intergalactic-scene": "/assets/js/components/intergalactic-scene/intergalactic-scene.js"
  }
}
</script>

<script type="module">
  // Make sure the script has loaded
  console.log('Loading Intergalactic Scene component...');

  // Debug flag to help troubleshooting
  window.DEBUG_INTERGALACTIC_SCENE = true;
</script>