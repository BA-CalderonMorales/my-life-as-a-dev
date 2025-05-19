/**
 * Import map for module resolution
 * - Defines paths for external libraries
 * - Enables clean imports without relative paths
 * - Centralizes CDN dependency management
 */
(function() {
  // Check if import map already exists to avoid duplicates
  if (document.querySelector('script[type="importmap"]')) {
    return;
  }

  const importMap = document.createElement('script');
  importMap.type = 'importmap';
  importMap.textContent = JSON.stringify({
    imports: {
      // External libraries from CDN with local fallbacks
      "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/",

      // Local libraries
      "typewriter": "./assets/js/vendor/typewriter.min.js",
      
      // Internal module shortcuts
      "@modules/": "./assets/js/custom/",
      "@components/": "./assets/js/components/",
      "@utils/": "./assets/js/utils/"
    }
  });

  // Add the import map to the document head
  document.head.appendChild(importMap);
})();