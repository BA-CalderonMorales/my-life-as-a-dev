# Bravo

----

<!-- Self-contained Web Component for “Rick's Dreamscape Prototype #4” -->
<script>
class DreamscapeProto4 extends HTMLElement {
  constructor() {
    super();
    this.logs = [];
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #111;
        }
        canvas {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }
        #fps {
          position: absolute;
          top: 0.3125rem;
          left: 0.3125rem;
          color: #0f0;
          font: 0.75rem monospace;
          z-index: 100;
          pointer-events: none;
          text-shadow: 0 0 5px #0f0;
        }
        #message {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          padding: 0.625rem 1.25rem;
          background: rgba(0,0,0,0.7);
          color: #fff;
          font: 1rem monospace;
          border-radius: 0.3125rem;
          display: none;
          z-index: 100;
          pointer-events: none;
        }
      </style>
      <canvas id="canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
      <div id="fps" aria-label="FPS Counter">FPS: --</div>
      <div id="message" aria-live="polite"></div>
    `;
    this.canvas = shadow.getElementById('canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.fpsEl  = shadow.getElementById('fps');
    this.msgEl  = shadow.getElementById('message');
  }

  connectedCallback() {
    const ctx   = this.ctx,
          fpsEl = this.fpsEl,
          msgEl = this.msgEl,
          logs  = this.logs;
    let width, height, lastTap = 0, tapCount = 0, scale = 1, pinchDist = 0;
    let drag = null, dx = 0, dy = 0, msgTimer = 0;
    const petals = [], bursts = [], flings = [];

    // resize canvas & init orb position
    const resize = () => {
      width  = this.canvas.width  = window.innerWidth;
      height = this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // logging
    const log = e => logs.push({ t: Date.now(), type: e.type, data: e.detail || {} });
    ['touchstart','touchmove','touchend','mousedown','mousemove','mouseup','keydown','deviceorientation','devicemotion']
      .forEach(e => window.addEventListener(e, log));

    // double-tap → radial burst
    const spawnRadial = (x,y) => {
      for(let a=0;a<16;a++){
        const ang = 2*Math.PI*(a/16);
        bursts.push({ x, y, vx: Math.cos(ang)*3, vy: Math.sin(ang)*3, life: 60 });
      }
    };
    window.addEventListener('touchend', e => {
      const now = Date.now();
      if (now - lastTap < 300) {
        const t = e.changedTouches[0];
        spawnRadial(t.clientX, t.clientY);
      }
      lastTap = now;
    });

    // pinch-to-zoom
    window.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDist = Math.hypot(dx, dy);
      }
    });
    window.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const d  = Math.hypot(dx, dy);
        scale *= d / pinchDist;
        pinchDist = d;
        scale = Math.min(Math.max(scale, 0.5), 3);
      }
    });

    // voice recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.onresult = e => {
        const txt = e.results[e.results.length-1][0].transcript.toLowerCase();
        log({ type: 'speech', transcript: txt });
        msgEl.textContent = txt.includes('wubba')
          ? 'Wubba lubba dub dub!'
          : 'You said: ' + txt;
        if (txt.includes('wubba')) speechSynthesis.speak(new SpeechSynthesisUtterance(msgEl.textContent));
        msgEl.style.display = 'block';
        msgTimer = 120;
      };
      recognition.start();
    }

    // fling physics
    window.addEventListener('touchstart', e => {
      const t = e.touches[0];
      drag = { x: t.clientX, y: t.clientY, t: Date.now() };
    });
    window.addEventListener('touchmove', e => {
      const t = e.touches[0];
      dx = t.clientX; dy = t.clientY;
    });
    window.addEventListener('touchend', () => {
      if (drag) {
        const dt = Date.now() - drag.t || 1;
        const vx = (dx - drag.x) / dt * 10;
        const vy = (dy - drag.y) / dt * 10;
        flings.push({ x: drag.x, y: drag.y, vx, vy, trail: [] });
        drag = null;
      }
    });

    // animation & FPS
    let last = performance.now(), frame = 0, fps = 0;
    const update = now => {
      const dt = now - last; last = now; frame++;
      if (frame % 60 === 0) fps = Math.round(1000/dt);
      fpsEl.textContent = 'FPS: ' + fps;

      ctx.save();
        ctx.setTransform(scale,0,0,scale,0,0);
        ctx.clearRect(0,0,width,height);

        // background & swirl
        const px = (window.orientation||0)/90;
        ctx.fillStyle = '#112';
        ctx.fillRect(-width*0.1, -height*0.1, width*1.2, height*1.2);
        const hue = (now/100) % 360;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `hsla(${hue},100%,50%,0.02)`;
        ctx.fillRect(0,0,width,height);
        ctx.globalCompositeOperation = 'source-over';

        // petals
        if (Math.random() < 0.03) {
          petals.push({ x: Math.random()*width, y: -10, vy: Math.random()+0.5, r: Math.random()*3+2 });
        }
        petals.forEach((p,i) => {
          p.y += p.vy;
          ctx.fillStyle = 'rgba(255,182,193,0.7)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
          ctx.fill();
        });
        petals.filter(p => p.y < height+10);

        // bursts
        bursts.forEach((b,i) => {
          b.x += b.vx; b.y += b.vy; b.life--;
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3, 0, 2*Math.PI);
          ctx.fill();
          if (b.life <= 0) bursts.splice(i,1);
        });

        // flings
        flings.forEach((o,i) => {
          o.vy += 0.5; o.x += o.vx; o.y += o.vy;
          o.trail.push({ x: o.x, y: o.y });
          ctx.beginPath();
          o.trail.slice(-10).forEach((pt,j) => {
            ctx.globalAlpha = j/10;
            ctx.lineTo(pt.x, pt.y);
          });
          ctx.strokeStyle = 'cyan';
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.fillStyle = 'cyan';
          ctx.arc(o.x, o.y, 5, 0, 2*Math.PI);
          ctx.fill();
          if (o.y > height+50) flings.splice(i,1);
        });

      ctx.restore();

      // hide message
      if (msgTimer-- <= 0) msgEl.style.display = 'none';

      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);

    // send logs on exit
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon('/log', JSON.stringify(logs));
    });
  }
}

customElements.define('dreamscape-proto4', DreamscapeProto4);
</script>

=== "Content"

    Testing look and feel

    <dreamscape-proto4></dreamscape-proto4>