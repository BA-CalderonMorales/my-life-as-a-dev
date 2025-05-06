# India

----

<!-- Self-contained Web Component for the “India” scene -->
<script>
class IntergalacticScene extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          --bg: #000;
          --primary: #0ff;
          --font: monospace;
          display: block;
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: var(--bg);
          font-family: var(--font);
        }
        canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
        #fps, #subtitle {
          position: absolute;
          color: var(--primary);
          text-shadow: 0 0 5px var(--primary);
          pointer-events: none;
          z-index: 100;
        }
        #fps {
          top: 0.5rem;
          left: 0.5rem;
          font: 0.75rem var(--font);
        }
        #subtitle {
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          max-width: 90%;
          font: 0.875rem var(--font);
          text-align: center;
          line-height: 1.2;
        }
        @media (min-width: 768px) {
          #fps {
            top: 1rem;
            left: 1rem;
            font: 1rem var(--font);
          }
          #subtitle {
            bottom: 1.5rem;
            font: 1.25rem var(--font);
            max-width: 80%;
          }
        }
        @media (min-width: 1200px) {
          #fps {
            top: 1.25rem;
            left: 1.25rem;
            font: 1.25rem var(--font);
          }
          #subtitle {
            bottom: 2rem;
            font: 1.5rem var(--font);
            max-width: 70%;
          }
        }
      </style>
      <canvas id="canvas" aria-label="Intergalactic Dreamscape"></canvas>
      <div id="fps">FPS: --</div>
      <div id="subtitle" aria-live="polite"></div>
    `;
    this.canvas = shadow.getElementById('canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.fpsEl  = shadow.getElementById('fps');
    this.subEl  = shadow.getElementById('subtitle');
  }

  connectedCallback() {
    const canvas = this.canvas,
          ctx    = this.ctx,
          fpsEl  = this.fpsEl,
          subEl  = this.subEl;

    let W, H, cx, cy;
    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W / 2; cy = H / 2;
    }
    window.addEventListener('resize', resize);
    resize();

    // Starfield
    const starCount = 800;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({ x: 0, y: 0, z: 0, pz: 0 });
    }
    function initStars() {
      stars.forEach(s => {
        s.x = Math.random() * W - cx;
        s.y = Math.random() * H - cy;
        s.z = Math.random() * W;
        s.pz = 0;
      });
    }
    initStars();
    let warp = 0.5;

    // Nebula
    const nebula = document.createElement('canvas');
    nebula.width = nebula.height = 256;
    const nCtx = nebula.getContext('2d');
    function drawNebula() {
      const img = nCtx.createImageData(256, 256);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.floor((Math.random() + Math.random() + Math.random()) / 3 * 255);
        img.data[i]   = v/2;
        img.data[i+1] = v;
        img.data[i+2] = v * 1.5;
        img.data[i+3] = v/3;
      }
      nCtx.putImageData(img, 0, 0);
    }
    drawNebula();

    // Subtitle helper
    function showSubtitle(text) {
      subEl.textContent = text;
      setTimeout(() => subEl.textContent = '', 2000);
    }

    // Voice interaction
    const quotes = [
      "Buckle up, it's cosmic mayhem time!",
      "Intergalactic swirl initiated. *burp*",
      "Wubba lubba warp speed!",
      "I’m not gonna sugarcoat it: this is interdimensional realness."
    ];
    if (navigator.mediaDevices && window.AudioContext) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const audioCtx  = new (window.AudioContext||window.webkitAudioContext)();
          const analyser  = audioCtx.createAnalyser();
          const src       = audioCtx.createMediaStreamSource(stream);
          src.connect(analyser);
          const data = new Uint8Array(analyser.fftSize);
          (function analyze() {
            analyser.getByteFrequencyData(data);
            const vol = data.reduce((a, b) => a + b) / data.length;
            if (vol > 200) {
              warp = Math.min(10, warp + 0.5);
              showSubtitle(quotes[Math.floor(Math.random() * quotes.length)]);
            }
            requestAnimationFrame(analyze);
          })();
        }).catch(() => {});
    }

    // Touch
    let lastTap = 0, tapCount = 0, prevDist = 0;
    canvas.addEventListener('touchstart', e => {
      const now = Date.now();
      tapCount = (now - lastTap < 300) ? tapCount + 1 : 1;
      lastTap = now;
      if (tapCount === 2) {
        warp = (warp > 0.5 ? 0.5 : 5);
        showSubtitle("Warp factor " + warp.toFixed(1));
      }
    });
    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (prevDist) warp = Math.max(0.5, Math.min(15, warp + (prevDist - dist) * 0.01));
        prevDist = dist;
      }
    });
    canvas.addEventListener('touchend', () => prevDist = 0);

    // Device tilt
    let tiltX = 0, tiltY = 0;
    window.addEventListener('deviceorientation', e => {
      tiltX = (e.gamma || 0) / 45;
      tiltY = (e.beta  || 0) / 90;
    });

    // Render loop
    let lastTime = performance.now(), frame = 0;
    (function loop(now) {
      const dt = now - lastTime;
      lastTime = now;
      frame++;
      if (frame % 60 === 0) fpsEl.textContent = 'FPS: ' + Math.round(1000 / dt);

      // Draw nebula
      const scale = 2 + Math.sin(frame * 0.005);
      ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.translate(cx, cy);
        ctx.rotate(frame * 0.0005);
        ctx.drawImage(nebula,
          -128 * scale + tiltX * 50,
          -128 * scale + tiltY * 50,
          256 * scale, 256 * scale
        );
      ctx.restore();

      // Draw stars
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0,0,W,H);
      ctx.save();
        ctx.translate(cx, cy);
        stars.forEach(s => {
          s.z -= warp;
          if (s.z < 1) {
            s.z = W;
            s.x = Math.random() * W - cx;
            s.y = Math.random() * H - cy;
          }
          const k = 300 / s.z;
          const x = s.x * k, y = s.y * k;
          ctx.fillStyle = 'hsl(200,100%,' + (100 - k*2) + '%)';
          ctx.fillRect(x, y, 2*k, 2*k);
        });
      ctx.restore();

      requestAnimationFrame(loop);
    })(lastTime);
  }
}

customElements.define('intergalactic-scene', IntergalacticScene);
</script>

<intergalactic-scene></intergalactic-scene>