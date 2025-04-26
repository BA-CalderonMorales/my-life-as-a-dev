// This script initializes Mermaid diagrams and makes them responsive using SVG Pan Zoom.

document.addEventListener('DOMContentLoaded', function() {

    // Initialize mermaid
    mermaid.initialize({

      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose'

    });
  
    // Wait for Mermaid diagrams to render
    setTimeout(() => {

      const diagrams = document.querySelectorAll('.mermaid svg');

      diagrams.forEach(svg => {

        // Make the SVG responsive
        if (!svg.hasAttribute('width')) {
          svg.setAttribute('width', '100%');
        }
        
        // Initialize SVG Pan Zoom on each diagram
        svgPanZoom(svg, {

          zoomEnabled: true,
          controlIconsEnabled: true,
          fit: true,
          center: true,
          minZoom: 0.1,
          maxZoom: 10

        });

      });

    }, 1000);

  });