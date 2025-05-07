# Colorful Particle Interaction

----

<!-- Simply use the custom element directly as intended by the component -->
<color-particle-artifact class="test-scene-container"></color-particle-artifact>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/",
    "color-particle-artifact": "/assets/js/components/color-particle-artifact/color-particle-artifact.js"
  }
}
</script>

<script type="module">
  // Make sure the script has loaded
  console.log('Loading Color Particle Artifact component...');

  // Debug flag to help troubleshooting
  window.DEBUG_COLOR_PARTICLE = true;
</script>