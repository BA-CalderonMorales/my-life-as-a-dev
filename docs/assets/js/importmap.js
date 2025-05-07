// Import map for Three.js modules and custom modules
(function() {
  // Check if import map already exists to avoid duplicates
  if (document.querySelector('script[type="importmap"]')) {
    return;
  }

  const importMap = document.createElement('script');
  importMap.type = 'importmap';
  importMap.textContent = JSON.stringify({
    imports: {
      "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/",
      "logger": "./assets/js/custom/logger.js",
      "versionSelector": "./assets/js/custom/versionSelector/index.js",
      "dreamscape": "./assets/js/components/dreamscape/dreamscape.js",
      "dreamscape-proto4": "./assets/js/components/dreamscape-proto4/dreamscape-proto4/dreamscape-proto4.js"
    }
  });

  // Add the import map to the document head for better reliability
  document.head.appendChild(importMap);
})();