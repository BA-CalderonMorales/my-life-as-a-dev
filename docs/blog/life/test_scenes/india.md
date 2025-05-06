# India

----

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
  :root {
    --bg: #000;
    --primary: #0ff;
    --font: monospace;
  }
  /* Allow vertical scrolling again, hide only horizontal overflow */
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: auto;
    overflow-x: hidden;
    overflow-y: auto;
    background: var(--bg);
    font-family: var(--font);
  }
  /* Make the canvas fill the viewport, but leave the page scrollable */
  #canvas {
    display: block;
    width: 100%;
    height: 100vh;
  }
  #fps, #subtitle {
    position: absolute;
    color: var(--primary);
    text-shadow: 0 0 5px var(--primary);
    pointer-events: none;
    z-index: 100;
  }
  #fps {
    top: 0.5rem; left: 0.5rem;
    font-size: 0.75rem;
  }
  #subtitle {
    bottom: 1rem;
    left: 50%; transform: translateX(-50%);
    max-width: 90%;
    font-size: 0.875rem;
    text-align: center;
    line-height: 1.2;
  }
  @media (min-width: 768px) {
    #fps { top:1rem; left:1rem; font-size:1rem; }
    #subtitle { bottom:1.5rem; font-size:1.25rem; max-width:80%; }
  }
  @media (min-width: 1200px) {
    #fps { top:1.25rem; left:1.25rem; font-size:1.25rem; }
    #subtitle { bottom:2rem; font-size:1.5rem; max-width:70%; }
  }
</style>

<canvas id="canvas" aria-label="Intergalactic Dreamscape"></canvas>
<div id="fps">FPS: --</div>
<div id="subtitle" aria-live="polite"></div>

<script>
  (function(){
    const canvas = document.getElementById('canvas'),
          ctx    = canvas.getContext('2d'),
          fpsEl  = document.getElementById('fps'),
          subEl  = document.getElementById('subtitle');
    let W, H, cx, cy;
    function resize(){
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W/2; cy = H/2;
    }
    window.addEventListener('resize', resize);
    resize();

    // ...rest of your JS (starfield, nebula, interactions, loop)...
  })();
</script>