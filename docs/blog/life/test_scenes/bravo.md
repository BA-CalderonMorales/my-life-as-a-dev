# Dream Scape

----

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rick's Dreamscape Prototype #4</title>
  <style>
    html, body { margin:0; padding:0; overflow:hidden; height:100%; background:#111; }
    #canvas   { position:absolute; top:0; left:0; width:100%; height:100%; }
    #fps      { position:absolute; top:5px; left:5px; color:#0f0; font:12px monospace; z-index:100; }
    #message  { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); 
                padding:10px 20px; background:rgba(0,0,0,0.7); color:#fff; 
                font:16px monospace; border-radius:5px; display:none; z-index:100; }
  </style>
</head>
<body>
  <dreamscape-proto4></dreamscape-proto4>

  <script>
  class DreamscapeProto4 extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <canvas id="canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
        <div id="fps" aria-label="FPS Counter">FPS: --</div>
        <div id="message" aria-live="polite"></div>
      `;
      const canvas = this.querySelector('#canvas'),
            ctx    = canvas.getContext('2d'),
            fpsEl  = this.querySelector('#fps'),
            msgEl  = this.querySelector('#message');
      const logs = [];
      function log(evt) { logs.push({ t:Date.now(), type:evt.type, data:evt.detail||{} }); }

      // Resize
      function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      // State
      let lastTap = 0, tapCount = 0, scale = 1, pinchDist = 0;
      let drag = null, dx = 0, dy = 0, msgTimer = 0;
      const petals = [], bursts = [], flings = [];

      // Double-tap → radial burst
      function spawnRadial(x,y) {
        for(let a=0; a<16; a++){
          const ang = 2*Math.PI*(a/16);
          bursts.push({ x, y, vx:Math.cos(ang)*3, vy:Math.sin(ang)*3, life:60 });
        }
      }
      canvas.addEventListener('touchend', e => {
        log(e);
        const now = Date.now();
        if (now - lastTap < 300) {
          const t = e.changedTouches[0];
          spawnRadial(t.clientX, t.clientY);
        }
        lastTap = now;
      });

      // Pinch-to-zoom
      canvas.addEventListener('touchstart', e => {
        log(e);
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          pinchDist = Math.hypot(dx, dy);
        }
      });
      canvas.addEventListener('touchmove', e => {
        log(e);
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const d  = Math.hypot(dx, dy);
          scale *= d / pinchDist;
          pinchDist = d;
          scale = Math.min(Math.max(scale, 0.5), 3);
        }
      });

      // Voice recognition
      if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.onresult = e => {
          const txt = e.results[e.results.length-1][0].transcript.toLowerCase();
          log({ type:'speech', transcript: txt });
          msgEl.textContent = txt.includes('wubba')
            ? 'Wubba lubba dub dub!'
            : 'You said: ' + txt;
          if (txt.includes('wubba')) {
            const u = new SpeechSynthesisUtterance(msgEl.textContent);
            speechSynthesis.speak(u);
          }
          msgEl.style.display = 'block';
          msgTimer = 120;
        };
        recognition.start();
      }

      // Fling physics
      canvas.addEventListener('touchstart', e => {
        log(e);
        const t = e.touches[0];
        drag = { x:t.clientX, y:t.clientY, t:Date.now() };
      });
      canvas.addEventListener('touchmove', e => {
        log(e);
        const t = e.touches[0];
        dx = t.clientX; dy = t.clientY;
      });
      canvas.addEventListener('touchend', e => {
        log(e);
        if (drag) {
          const dt = Date.now() - drag.t || 1;
          const vx = (dx - drag.x)/dt*10, vy = (dy - drag.y)/dt*10;
          flings.push({ x:drag.x, y:drag.y, vx, vy, trail:[] });
          drag = null;
        }
      });

      // Animation & FPS
      let last = performance.now(), frame = 0, fps = 0;
      function update(now) {
        const dt = now - last; last = now; frame++;
        if (frame % 60 === 0) fps = Math.round(1000/dt);
        fpsEl.textContent = 'FPS: ' + fps;

        ctx.save();
        ctx.setTransform(scale,0,0,scale,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);

        // Background & swirl
        ctx.fillStyle = '#112';
        ctx.fillRect(-canvas.width*0.1, -canvas.height*0.1, canvas.width*1.2, canvas.height*1.2);
        const hue = (now/100)%360;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `hsla(${hue},100%,50%,0.02)`;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.globalCompositeOperation = 'source-over';

        // Petals
        if (Math.random() < 0.03) {
          petals.push({ x:Math.random()*canvas.width, y:-10, vy:Math.random()+0.5, r:Math.random()*3+2 });
        }
        petals.forEach((p,i) => {
          p.y += p.vy;
          ctx.fillStyle = 'rgba(255,182,193,0.7)';
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,2*Math.PI); ctx.fill();
        });

        // Bursts
        bursts.forEach((b,i) => {
          b.x += b.vx; b.y += b.vy; b.life--;
          ctx.fillStyle = 'white';
          ctx.beginPath(); ctx.arc(b.x,b.y,3,0,2*Math.PI); ctx.fill();
          if (b.life <= 0) bursts.splice(i,1);
        });

        // Flings & trails
        flings.forEach((o,i) => {
          o.vy += 0.5; o.x += o.vx; o.y += o.vy;
          o.trail.push({x:o.x,y:o.y});
          ctx.beginPath();
          o.trail.slice(-10).forEach((pt,j) => {
            ctx.globalAlpha = j/10;
            ctx.lineTo(pt.x,pt.y);
          });
          ctx.strokeStyle = 'cyan'; ctx.stroke(); ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.fillStyle = 'cyan';
          ctx.arc(o.x,o.y,5,0,2*Math.PI); ctx.fill();
          if (o.y > canvas.height + 50) flings.splice(i,1);
        });

        // Hide message
        if (msgTimer-- <= 0) msgEl.style.display = 'none';

        ctx.restore();
        requestAnimationFrame(update);
      }
      requestAnimationFrame(update);

      // Send logs on exit
      window.addEventListener('beforeunload', ()=>navigator.sendBeacon('/log',JSON.stringify(logs)));
    }
  }
  customElements.define('dreamscape-proto4', DreamscapeProto4);
  </script>
</body>
</html>