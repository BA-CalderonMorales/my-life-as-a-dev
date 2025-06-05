"use strict";
// Physics Playground Component
class PhysicsPlayground extends HTMLElement {
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
          background: linear-gradient(#1e212d, #3a3f5c);
        }
        canvas {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
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
      <canvas id="canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
      <div id="fps">FPS: --</div>
    `;
    this.canvas = shadow.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.fpsEl = shadow.getElementById('fps');
    this.logs = [];
  }

  connectedCallback() {
    const ctx = this.ctx;
    const fpsEl = this.fpsEl;
    const logs = this.logs;
    let width, height;

    // resize
    const resize = () => {
      width = this.canvas.width = window.innerWidth;
      height = this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // logging
    const log = e => logs.push({ t: Date.now(), type: e.type });

    // device orientation
    let px = 0, py = 0;
    window.addEventListener('deviceorientation', e => {
      px = (e.gamma || 0) / 30;
      py = (e.beta || 0) / 30;
      log(e);
    });

    // orb physics
    const orb = { x: width/2, y: height/2, vx: 0, vy: 0, r: 25, trail: [] };
    const gravity = 0.3, friction = 0.98, bounce = 0.7;
    const ripples = [];

    const spawnRipple = (x, y) => {
      ripples.push({ x, y, r: 0, a: 1 });
    };

    // drag fling
    let dragStart = null;
    this.canvas.addEventListener('touchstart', e => {
      const t = e.touches[0];
      dragStart = { x: t.clientX, y: t.clientY, t: Date.now() };
      log(e);
    });
    this.canvas.addEventListener('touchend', e => {
      const t = e.changedTouches[0];
      if (dragStart) {
        const dt = (Date.now() - dragStart.t) || 1;
        orb.vx = (t.clientX - dragStart.x) / dt * 10;
        orb.vy = (t.clientY - dragStart.y) / dt * 10;
        dragStart = null;
      }
      spawnRipple(t.clientX, t.clientY);
      log(e);
    });

    // shake to ripple
    window.addEventListener('devicemotion', e => {
      log(e);
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (acc) {
        const mag = Math.hypot(acc.x, acc.y, acc.z);
        if (mag > 20) spawnRipple(Math.random()*width, Math.random()*height);
      }
    });

    // animation loop
    let last = performance.now(), frame = 0;
    const update = now => {
      const dt = now - last; last = now; frame++;
      if (frame % 60 === 0) {
        fpsEl.textContent = 'FPS: ' + Math.round(1000 / dt);
      }

      // clear
      ctx.clearRect(0,0,width,height);

      // parallax sky & mountains
      ctx.save();
        ctx.translate(px*20, py*20);
        ctx.fillStyle = '#2e2a4a';
        ctx.beginPath();
        ctx.moveTo(0, height*0.7);
        ctx.lineTo(width*0.3, height*0.5);
        ctx.lineTo(width*0.6, height*0.75);
        ctx.lineTo(width, height*0.6);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fill();
      ctx.restore();

      // foreground grass
      ctx.save();
        ctx.translate(px*40, py*40);
        ctx.fillStyle = '#1f1c3a';
        ctx.fillRect(0, height*0.8, width, height*0.2);
      ctx.restore();

      // update orb
      orb.vy += gravity;
      orb.x += orb.vx;
      orb.y += orb.vy;
      orb.vx *= friction;
      orb.vy *= friction;
      // bounce
      if (orb.x < orb.r) { orb.x = orb.r; orb.vx = -orb.vx*bounce; spawnRipple(orb.x, orb.y); }
      if (orb.x > width-orb.r) { orb.x = width-orb.r; orb.vx = -orb.vx*bounce; spawnRipple(orb.x, orb.y); }
      if (orb.y < orb.r) { orb.y = orb.r; orb.vy = -orb.vy*bounce; spawnRipple(orb.x, orb.y); }
      if (orb.y > height-orb.r) { orb.y = height-orb.r; orb.vy = -orb.vy*bounce; spawnRipple(orb.x, orb.y); }

      // trail
      orb.trail.push({ x: orb.x, y: orb.y });
      if (orb.trail.length > 30) orb.trail.shift();
      ctx.beginPath();
      orb.trail.forEach((pt,i) => {
        ctx.globalAlpha = i / orb.trail.length;
        ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = 'rgba(0,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // shadow
      const grad = ctx.createRadialGradient(
        orb.x, orb.y+orb.r, orb.r,
        orb.x, orb.y+orb.r, orb.r*4
      );
      grad.addColorStop(0,'rgba(0,0,0,0.4)');
      grad.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y+orb.r, orb.r*4, 0, Math.PI*2);
      ctx.fill();

      // orb glow
      ctx.save();
        ctx.shadowColor = 'cyan';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI*2);
        ctx.fill();
      ctx.restore();

      // ripples
      ripples.forEach((r,i) => {
        r.r += 3; r.a -= 0.02;
        if (r.a <= 0) ripples.splice(i,1);
        else {
          ctx.strokeStyle = `rgba(255,255,255,${r.a})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r, 0, Math.PI*2);
          ctx.stroke();
        }
      });

      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);

    // send logs
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon('/log', JSON.stringify(logs));
    });
  }
}

// Register the custom element
customElements.define('physics-playground', PhysicsPlayground);

// Export the component
export default PhysicsPlayground;
