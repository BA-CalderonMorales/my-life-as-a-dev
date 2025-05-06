# Stars and Motion

----

<!-- Self-contained Web Component for “Stars and Motion” -->
<script>
class StarsMotionScene extends HTMLElement {
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
          background: #000;
        }
        canvas {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
        }
        #fps {
          position: absolute;
          top: 0.3125rem;
          left: 0.3125rem;
          color: #0f0;
          font: 0.75rem monospace;
          z-index: 100;
          text-shadow: 0 0 5px #0f0;
          pointer-events: none;
        }
      </style>
      <canvas id="canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
      <div id="fps" aria-label="FPS Counter">FPS: --</div>
    `;
    this.canvas = shadow.getElementById('canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.fpsEl  = shadow.getElementById('fps');
  }

  connectedCallback() {
    const canvas  = this.canvas,
          ctx     = this.ctx,
          fpsEl   = this.fpsEl,
          logs    = this.logs;

    function log(evt) {
      logs.push({ time: Date.now(), type: evt.type, data: evt.detail || {} });
    }

    // Resize
    let width, height;
    const resize = () => {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Parallax orientation & shake
    let px = 0, py = 0;
    window.addEventListener('deviceorientation', e => {
      px = (e.gamma || 0) / 45;
      py = (e.beta  || 0) / 90;
      log(e);
    });
    window.addEventListener('devicemotion', e => {
      log(e);
      const a = e.accelerationIncludingGravity || e.acceleration;
      if (a) {
        const mag = Math.hypot(a.x, a.y, a.z);
        if (mag > 25) for (let i = 0; i < 20; i++) spawnPetal();
      }
    });

    // Misc input logging
    ['touchstart','touchmove','touchend','mousedown','mousemove','mouseup','orientationchange']
      .forEach(evt => window.addEventListener(evt, log));

    // Petal particles
    let petals = [];
    function spawnPetal() {
      petals.push({
        x: Math.random() * width,
        y: -10,
        vy: Math.random() + 0.5,
        r:  Math.random() * 3 + 2
      });
    }

    // Fling physics
    let flings = [], dragStart = null, dragX = 0, dragY = 0;
    window.addEventListener('touchstart', e => {
      const t = e.touches[0];
      dragStart = { x: t.clientX, y: t.clientY, t: Date.now() };
    });
    window.addEventListener('touchmove', e => {
      const t = e.touches[0];
      dragX = t.clientX; dragY = t.clientY;
    });
    window.addEventListener('touchend', () => {
      if (dragStart) {
        const dt = Date.now() - dragStart.t || 1;
        const vx = (dragX - dragStart.x) / dt * 10;
        const vy = (dragY - dragStart.y) / dt * 10;
        flings.push({ x: dragStart.x, y: dragStart.y, vx, vy, trail: [] });
        dragStart = null;
      }
    });

    // Audio-reactive bloom
    let analyser, dataArr;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        src.connect(analyser);
        analyser.fftSize = 64;
        dataArr = new Uint8Array(analyser.frequencyBinCount);
      }).catch(() => {});
    }

    // L-system vine
    let vineCommands = '';
    function generateVine(axiom, rule, iter) {
      let str = axiom;
      for (let i = 0; i < iter; i++) {
        str = str.split('').map(c => c === 'F' ? rule : c).join('');
      }
      vineCommands = str;
    }
    function drawVine() {
      const stack = [];
      let x = width * 0.1, y = height * 0.9, ang = -Math.PI / 2;
      ctx.strokeStyle = 'lime';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (const c of vineCommands) {
        if (c === 'F') {
          x += Math.cos(ang)*10; y += Math.sin(ang)*10;
          ctx.lineTo(x, y);
        } else if (c === '+') ang += Math.PI/6;
        else if (c === '-') ang -= Math.PI/6;
        else if (c === '[') stack.push({ x, y, ang });
        else if (c === ']') {
          const p = stack.pop();
          x = p.x; y = p.y; ang = p.ang;
          ctx.moveTo(x, y);
        }
      }
      ctx.stroke();
    }
    generateVine('F', 'F[+F]F[-F]F', 3);

    // Voice recognition & flash
    let flashTimer = 0;
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.onresult = e => {
        const t = e.results[e.results.length-1][0].transcript.toLowerCase();
        log({ type: 'speech', transcript: t });
        if (t.includes('vine')) generateVine('F', 'F[+F]F[-F]F', 4);
        if (t.includes('petal')) for (let i = 0; i < 50; i++) spawnPetal();
        if (t.includes('flash')) flashTimer = 10;
      };
      recognition.start();
    }

    // Animation & FPS
    let lastTime = performance.now(), fps = 0;
    const update = now => {
      const dt = now - lastTime; lastTime = now; fps = Math.round(1000/dt);
      fpsEl.textContent = 'FPS: ' + fps;

      ctx.clearRect(0, 0, width, height);

      // Parallax background
      ctx.save();
        ctx.translate(px*30, py*30);
        const grd = ctx.createRadialGradient(
          width/2, height/2, 100,
          width/2, height/2, width
        );
        grd.addColorStop(0, '#002');
        grd.addColorStop(1, '#220');
        ctx.fillStyle = grd;
        ctx.fillRect(-px*50, -py*50, width+px*100, height+py*100);
      ctx.restore();

      // Shader overlay
      const hue = (now/50) % 360;
      ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = `hsla(${hue},100%,50%,0.02)`;
        ctx.fillRect(0,0,width,height);
      ctx.restore();

      // Petals
      if (Math.random() < 0.05) spawnPetal();
      petals.forEach((p,i) => {
        p.y += p.vy;
        ctx.fillStyle = 'rgba(255,182,193,0.7)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
        ctx.fill();
      });
      petals = petals.filter(p => p.y < height + 10);

      // Flings & trails
      flings.forEach((o, i) => {
        o.vy += 0.5;
        o.x  += o.vx;
        o.y  += o.vy;
        o.trail.push({ x: o.x, y: o.y });
        ctx.beginPath();
        o.trail.slice(-10).forEach((pt, j) => {
          ctx.globalAlpha = j/10;
          ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(o.x, o.y, 5, 0, 2*Math.PI);
        ctx.fill();
        if (o.y > height + 50) flings.splice(i,1);
      });

      // Audio-reactive bloom
      if (analyser) {
        analyser.getByteFrequencyData(dataArr);
        const avg = dataArr.reduce((sum,v) => sum + v, 0) / dataArr.length;
        ctx.save();
          ctx.globalAlpha = avg/255 * 0.5;
          ctx.beginPath();
          ctx.arc(width/2, height/2, avg, 0, 2*Math.PI);
          ctx.fillStyle = 'cyan';
          ctx.fill();
        ctx.restore();
      }

      // Voice-triggered flash
      if (flashTimer > 0) {
        ctx.save();
          ctx.globalAlpha = flashTimer/10;
          ctx.fillStyle   = 'white';
          ctx.fillRect(0,0,width,height);
        ctx.restore();
        flashTimer--;
      }

      // Draw vine
      drawVine();

      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);

    // Send logs on unload
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon('/log', JSON.stringify(logs));
    });
  }
}

customElements.define('stars-motion-scene', StarsMotionScene);
</script>

=== "Stars and Motion"
    
    !!! info
        Experience may be slightly different on mobile devices.

    <stars-motion-scene></stars-motion-scene>