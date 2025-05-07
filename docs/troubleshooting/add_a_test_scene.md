# Adding a New Test Scene

> **Disclaimer:** This guide assumes you already have a self-contained HTML file or component that you want to convert to follow the MkDocs pattern used in this project. If you need an example of what a convertible HTML file looks like, check out the [HTML to MkDocs Pattern Conversion Example](./html_to_mkdocs_pattern_example.md) in the troubleshooting section.

This guide walks you through the process of adding a new test scene to the project following the established patterns.

## Overview of Steps

1. Create the Markdown file for your scene
2. Create the component JavaScript file
3. Create the component CSS file
4. Update the importmap.js file
5. Update the mkdocs.yml configuration

## Step 1: Create the Markdown File

Create a new markdown file under `docs/blog/life/test_scenes/` with a name of your choice (e.g., `delta.md`).

```markdown
# Your Scene Title

----

<!-- Simply use the custom element directly as intended by the component -->
<your-component-name class="test-scene-container"></your-component-name>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/",
    "your-component-name": "/assets/js/components/your-component-name/your-component-name.js"
  }
}
</script>

<script type="module">
  // Make sure the script has loaded
  console.log('Loading Your Scene Component...');

  // Debug flag to help troubleshooting
  window.DEBUG_YOUR_COMPONENT = true;
</script>
```

## Step 2: Create the Component JavaScript File

Create the component JavaScript file at `docs/assets/js/components/your-component-name/your-component-name.js`:

```javascript
// Your Scene Component
class YourComponentClass extends HTMLElement {
  connectedCallback() {
    // Initialize your component
    this.innerHTML = `
      <!-- Your HTML structure here -->
      <div class="your-component-container"></div>
    `;
    
    // Component setup logic
    this.initializeComponent();
  }
  
  initializeComponent() {
    // Initialize your scene, add event listeners, etc.
    console.log('Component initialized');
    
    // Set up animation loop if needed
    this.animate();
  }
  
  animate() {
    // Animation loop if needed
    requestAnimationFrame(() => this.animate());
    
    // Update your component's visuals
  }
}

// Register the custom element
customElements.define('your-component-name', YourComponentClass);

// Export the component
export default YourComponentClass;
```

## Step 3: Create the Component CSS File

Create the component CSS file at `docs/assets/css/components/your-component-name.css`:

```css
/* Styles for Your Scene Component */
/* Import shared test scene styles */
@import url('./test-scene-shared.css');

/* Component-specific styling */
your-component-name {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}

/* Additional component-specific styles */
.your-component-container {
  width: 100%;
  height: 100%;
  background: #121212;
}
```

## Step 4: Update the importmap.js File

Update the global import map at `docs/assets/js/importmap.js`:

```javascript
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
      "dreamscape-proto4": "./assets/js/components/dreamscape-proto4/dreamscape-proto4/dreamscape-proto4.js",
      "dreamscape-proto6": "./assets/js/components/dreamscape-proto6/dreamscape-proto6.js",
      "your-component-name": "./assets/js/components/your-component-name/your-component-name.js"
    }
  });

  // Add the import map to the document head for better reliability
  document.head.appendChild(importMap);
})();
```

## Step 5: Update the mkdocs.yml Configuration

Update the `mkdocs.yml` file to include your component's CSS and JavaScript files:

```yaml
# Under the extra_css section
extra_css:
  - assets/css/custom.css
  - assets/css/components/test-scene-shared.css
  - assets/css/components/dreamscape.css
  - assets/css/components/dreamscape-proto4.css
  - assets/css/components/dreamscape-proto6.css
  - assets/css/components/your-component-name.css  # Add your CSS here

# Under the extra_javascript section
extra_javascript:
  - https://cdnjs.cloudflare.com/ajax/libs/es-module-shims/1.7.3/es-module-shims.min.js
  - { "path": "assets/js/importmap.js", "defer": true }
  - { "path": "assets/js/custom/particleBackground.js", "type": "module" }
  - { "path": "assets/js/custom/initParticles.js", "type": "module" }
  - { "path": "assets/js/custom/versionSelector.js", "type": "module" }
  - { "path": "assets/js/components/dreamscape/dreamscape.js", "type": "module" }
  - { "path": "assets/js/components/dreamscape-proto4/dreamscape-proto4.js", "type": "module" }
  - { "path": "assets/js/components/dreamscape-proto6/dreamscape-proto6.js", "type": "module" }
  - { "path": "assets/js/components/your-component-name/your-component-name.js", "type": "module" }  # Add your JS here
```

## Real-World Example

Here's a simplified example of the changes made for the "Interactive Canvas Dreamscape" scene:

### 1. The Markdown File (charlie.md)

```markdown
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
```

### 2. The Component JavaScript File

```javascript
// Interactive Canvas Dreamscape Component
class DreamscapeProto6 extends HTMLElement {
  connectedCallback(){
    this.innerHTML = `
      <canvas id="canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
      <div id="fps">FPS: --</div>
    `;
    // Component implementation details
    // ...
  }
}

// Register the custom element
customElements.define('dreamscape-proto6', DreamscapeProto6);

// Export the component
export default DreamscapeProto6;
```

### 3. The Component CSS File

```css
/* Styles for the Interactive Canvas Dreamscape */
/* Import shared test scene styles */
@import url('./test-scene-shared.css');

dreamscape-proto6 {
  display: block;
  width: 100%;
  height: 100vh;
  position: relative;
}

dreamscape-proto6 canvas {
  width: 100%;
  height: 100%;
  display: block;
  background: #121212;
}

dreamscape-proto6 #fps {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-family: monospace;
}
```

By following this pattern, you can easily add new test scenes to your project in a consistent manner.