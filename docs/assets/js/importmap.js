// Import map for Three.js modules, Typewriter, and custom modules
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
      "typewriter": "https://cdn.jsdelivr.net/npm/typewriter-effect@2.19.0/dist/typewriter.min.js"
    }
  });

  // Add the import map to the document head for better reliability
  document.head.appendChild(importMap);
})();