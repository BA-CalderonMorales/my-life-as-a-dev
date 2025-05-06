# Hotel

----

<!-- Self-contained Web Component for your “Kaleidoscopic Dreamscape” -->
<script>
class KaleidoscopicScene extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #000;
        }
        canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
        #fps {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          color: #0f0;
          font: 0.75rem monospace;
          z-index: 100;
          text-shadow: 0 0 5px #0f0;
          pointer-events: none;
        }
      </style>
      <canvas id="canvas" aria-label="Kaleidoscopic Dreamscape"></canvas>
      <div id="fps">FPS: --</div>
    `;
    this.canvas = shadow.getElementById('canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.fpsEl  = shadow.getElementById('fps');
    this.logs   = [];
  }

  connectedCallback() {
    const ctx    = this.ctx;
    const fpsEl  = this.fpsEl;
    const logs   = this.logs;
    let W, H, cx, cy;
    const resize = () => {
      W = this.canvas.width  = window.innerWidth;
      H = this.canvas.height = window.innerHeight;
      cx = W/2; cy = H/2;
    };
    window.addEventListener('resize', resize);
    resize();

    // logging helper
    const log = e => logs.push({ t: Date.now(), type: e.type });

    // device tilt
    let tiltX = 0, tiltY = 0;
    window.addEventListener('deviceorientation', e => {
      tiltX = (e.gamma || 0) / 45;
      tiltY = (e.beta  || 0) / 90;
      log(e);
    });

    // mirrored brush
    const mirrorCount = 6;
    let drawing = false, lastTap = 0, tapCount = 0;
    let lastX = 0, lastY = 0;
    const strokes = [], bursts = [];

    const handlePoint = (x, y) => {
      lastX = x; lastY = y;
      strokes.push({ x: x - cx, y: y - cy });
    };

    this.canvas.addEventListener('touchstart', e => {
      drawing = true;
      handlePoint(e.touches[0].clientX, e.touches[0].clientY);
      const now = Date.now();
      tapCount = (now - lastTap < 300) ? tapCount+1 : 1;
      lastTap = now;
      if (tapCount === 3) {
        for (let i=0; i<20; i++){
          const ang = Math.random()*Math.PI*2;
          bursts.push({
            x: lastX, y: lastY,
            vx: Math.cos(ang)*3, vy: Math.sin(ang)*3,
            life: 30
          });
        }
      }
      log(e);
    });

    this.canvas.addEventListener('touchmove', e => {
      if (drawing) handlePoint(e.touches[0].clientX, e.touches[0].clientY);
      log(e);
    });
    this.canvas.addEventListener('touchend', e => { drawing = false; log(e); });

    // animation loop
    let lastTime = performance.now(), frame = 0;
    const update = now => {
      const dt = now - lastTime; lastTime = now; frame++;
      if (frame % 60 === 0) fpsEl.textContent = 'FPS: ' + Math.round(1000/dt);

      // fade & feedback
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0,0,W,H);
      ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(0.002);
        ctx.globalAlpha = 0.9;
        ctx.scale(0.99,0.99);
        ctx.drawImage(this.canvas, -cx, -cy);
      ctx.restore();

      // parallax gradient
      const grad = ctx.createRadialGradient(
        cx + tiltX*100, cy + tiltY*100, 0,
        cx, cy, Math.max(W,H)
      );
      grad.addColorStop(0, 'rgba(30,10,60,0.5)');
      grad.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,W,H);
      ctx.globalCompositeOperation = 'source-over';

      // draw mirrored strokes
      ctx.save(); ctx.translate(cx, cy);
      strokes.forEach(pt => {
        for (let i = 0; i < mirrorCount; i++) {
          ctx.rotate((Math.PI*2)/mirrorCount);
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x*1.1, pt.y*1.1);
          ctx.strokeStyle = `hsl(${(frame*2 + i*60)%360},80%,60%)`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
      ctx.restore();
      strokes.length = 0;

      // draw bursts
      bursts.forEach((b,i) => {
        b.x += b.vx; b.y += b.vy; b.life--;
        ctx.globalAlpha = b.life/30;
        ctx.fillStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, 2*Math.PI);
        ctx.fill();
        if (b.life<=0) bursts.splice(i,1);
      });
      ctx.globalAlpha = 1;

      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);

    // send logs on unload
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon('/log', JSON.stringify(logs));
    });
  }
}

customElements.define('kaleidoscopic-scene', KaleidoscopicScene);
</script>

<kaleidoscopic-scene></kaleidoscopic-scene>