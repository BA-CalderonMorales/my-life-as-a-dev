# Charlie

----

<!-- Self-contained Web Component for “Rick's Dreamscape Prototype #6” -->
<script>
class DreamscapeProto6 extends HTMLElement {
  constructor() {
    super();
    this.logs = [];
    const shadow = this.attachShadow({mode:'open'});
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
      </style>
      <canvas id="canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
      <div id="fps">FPS: --</div>
    `;
    this.canvas = shadow.getElementById('canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.fpsEl  = shadow.getElementById('fps');
  }
  connectedCallback() {
    const canvas = this.canvas, ctx = this.ctx, fpsEl = this.fpsEl, logs = this.logs;
    let width, height;
    let lastTap = 0, tapCount = 0, magnet = false, swigTimer = 0;
    let ox = 0, oy = 0, rotation = 0, initDist = 0, initRot = 0;
    const ribbons = [], bursts = [];
    let currentRibbon = [];
    const orb = {x:0,y:0};

    const resizeCanvas = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      orb.x = width/2; orb.y = height/2;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const log = e => logs.push({t:Date.now(), type:e.type});

    window.addEventListener('touchend', e => {
      log(e);
      const now = Date.now();
      if(now - lastTap < 300) tapCount++; else tapCount = 1;
      lastTap = now;
      const t = e.changedTouches[0];
      if(tapCount === 2) magnet = !magnet;
      if(tapCount === 3) swigTimer = 60;
      if(tapCount === 1) createBurst(t.clientX, t.clientY);
    });

    window.addEventListener('devicemotion', e => {
      log(e);
      const a = e.accelerationIncludingGravity || e.acceleration;
      if(a) {
        const mag = Math.hypot(a.x, a.y, a.z);
        if(mag > 20) for(let i=0;i<10;i++) createBurst(Math.random()*width, Math.random()*height);
      }
    });

    window.addEventListener('touchmove', e => {
      log(e);
      if(e.touches.length === 1) {
        const t = e.touches[0];
        currentRibbon.push({x:t.clientX, y:t.clientY});
        if(magnet) { orb.x = t.clientX; orb.y = t.clientY; }
      }
    });

    window.addEventListener('touchend', e => {
      if(currentRibbon.length) { ribbons.push(currentRibbon); currentRibbon = []; }
    });

    window.addEventListener('touchstart', e => {
      if(e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initDist = Math.hypot(dx, dy);
        initRot = rotation;
      }
    });

    window.addEventListener('touchmove', e => {
      if(e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        rotation = initRot + (dist - initDist) / 200;
      }
    });

    window.addEventListener('deviceorientation', e => {
      ox = (e.gamma || 0) / 45;
      oy = (e.beta  || 0) / 90;
    });

    function createBurst(x, y) {
      const parts = [];
      for(let i=0;i<20;i++){
        const ang = 2*Math.PI*(i/20);
        parts.push({ang, r:0});
      }
      bursts.push({x, y, parts});
    }

    let lastTime = performance.now(), frame = 0;
    const update = now => {
      const dt = now - lastTime; lastTime = now; frame++;
      if(frame % 60 === 0) fpsEl.textContent = 'FPS: ' + Math.round(1000/dt);

      ctx.clearRect(0,0,width,height);

      ctx.save();
        ctx.translate(ox*20, oy*20);
        ctx.strokeStyle = '#222';
        for(let i=0;i<width; i+=50){
          ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke();
        }
        for(let j=0;j<height;j+=50){
          ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(width,j); ctx.stroke();
        }
      ctx.restore();

      ctx.save();
        ctx.translate(width/2, height/2);
        ctx.rotate(rotation);
        ctx.translate(-width/2, -height/2);

        ribbons.forEach(rib => {
          ctx.beginPath();
          rib.forEach(pt => ctx.lineTo(pt.x, pt.y));
          ctx.strokeStyle = 'rgba(0,255,255,0.5)';
          ctx.lineWidth = 5;
          ctx.stroke();
        });
        if(currentRibbon.length){
          ctx.beginPath();
          currentRibbon.forEach(pt => ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
        }

        bursts.forEach((b,i) => {
          b.parts.forEach(p => p.r += 2);
          ctx.fillStyle = 'cyan';
          b.parts.forEach(p => {
            const x = b.x + Math.cos(p.ang)*p.r;
            const y = b.y + Math.sin(p.ang)*p.r;
            ctx.beginPath(); ctx.arc(x,y,3,0,2*Math.PI); ctx.fill();
          });
          if(b.parts[0].r > 100) bursts.splice(i,1);
        });

        ctx.fillStyle = magnet ? 'yellow' : 'magenta';
        ctx.beginPath(); ctx.arc(orb.x, orb.y, 20,0,2*Math.PI); ctx.fill();

        if(swigTimer-- > 0){
          ctx.font = '24px monospace';
          ctx.fillStyle = '#fff';
          ctx.fillText('Swiggity!', orb.x+30, orb.y-30);
        }
      ctx.restore();

      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);

    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon('/log', JSON.stringify(logs));
    });
  }
}

customElements.define('dreamscape-proto6', DreamscapeProto6);
</script>

<dreamscape-proto6></dreamscape-proto6>