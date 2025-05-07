# Stars and Motion

----

<!-- Simply use the custom element directly as intended by the component -->
<stars-motion-scene style="display: block; height: 500px; width: 100%;"></stars-motion-scene>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/"
  }
}
</script>

<script type="module">
  // Make sure the script has loaded
  console.log('Loading StarsMotionScene component...');

  // Debug flag to help troubleshooting
  window.DEBUG_STARS = true;
</script>
