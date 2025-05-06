# Charlie

----

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rick's Dreamscape Prototype #6</title>
  <style>
    html, body { margin:0; padding:0; overflow:hidden; height:100%; background:#111; }
    #canvas { position:absolute; top:0; left:0; width:100%; height:100%; }
    #fps    { position:absolute; top:5px; left:5px; color:#0f0; font:12px monospace; z-index:100; }
  </style>
</head>
<body>
  <dreamscape-proto6></dreamscape-proto6>

  <script>
  class DreamscapeProto6 extends HTMLElement {
    connectedCallback(){
      this.innerHTML = `
        <canvas id="canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
        <div id="fps">FPS: --</div>
      `;
      const canvas = this.querySelector('#canvas'),
            ctx    = canvas.getContext('2d'),
            fpsEl  = this.querySelector('#fps');
      const logs = [], log = e => logs.push({t:Date.now(),type:e.type});

      function resize(){
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      let width = canvas.width, height = canvas.height;
      let lastTap=0, tapCount=0, magnet=false, swigTimer=0;
      let ox=0, oy=0, rotation=0, initDist=0, initRot=0;
      const ribbons = [], bursts = [], currentRibbon = [];
      const orb = { x: width/2, y: height/2 };

      window.addEventListener('touchend', e=>{
        log(e);
        const now = Date.now();
        tapCount = (now - lastTap < 300) ? tapCount+1 : 1;
        lastTap = now;
        const t = e.changedTouches[0];
        if (tapCount===2) magnet = !magnet;
        if (tapCount===3) swigTimer = 60;
        if (tapCount===1) spawnBurst(t.clientX, t.clientY);
      });

      window.addEventListener('devicemotion', e=>{
        log(e);
        const a = e.accelerationIncludingGravity || e.acceleration;
        if (a){
          const m = Math.hypot(a.x, a.y, a.z);
          if (m>20) for(let i=0;i<10;i++) spawnBurst(Math.random()*width, Math.random()*height);
        }
      });

      window.addEventListener('touchmove', e=>{
        log(e);
        if (e.touches.length===1){
          const t = e.touches[0];
          currentRibbon.push({ x:t.clientX, y:t.clientY });
          if (magnet) { orb.x = t.clientX; orb.y = t.clientY; }
        }
      });

      window.addEventListener('touchstart', e=>{
        if (e.touches.length===2){
          const dx = e.touches[0].clientX - e.touches[1].clientX,
                dy = e.touches[0].clientY - e.touches[1].clientY;
          initDist = Math.hypot(dx, dy);
          initRot  = rotation;
        }
      });

      window.addEventListener('touchmove', e=>{
        if (e.touches.length===2){
          const dx = e.touches[0].clientX - e.touches[1].clientX,
                dy = e.touches[0].clientY - e.touches[1].clientY;
          const d = Math.hypot(dx, dy);
          rotation = initRot + (d - initDist)/200;
        }
      });

      window.addEventListener('deviceorientation', e=>{
        ox = (e.gamma||0)/45;
        oy = (e.beta||0)/90;
        log(e);
      });

      function spawnBurst(x,y){
        const parts = [];
        for(let i=0;i<20;i++){
          const ang = 2*Math.PI*(i/20);
          parts.push({ ang, r:0 });
        }
        bursts.push({ x, y, parts });
      }

      let last = performance.now(), frame = 0;
      function update(now){
        const dt = now - last; last = now; frame++;
        if (frame % 60 === 0) fpsEl.textContent = 'FPS: ' + Math.round(1000/dt);

        ctx.clearRect(0,0,width,height);

        ctx.save();
          ctx.translate(ox*20, oy*20);
          ctx.strokeStyle = '#222';
          for(let i=0;i<width;i+=50){
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

          ribbons.forEach(rib=>{
            ctx.beginPath();
            rib.forEach(pt=>ctx.lineTo(pt.x, pt.y));
            ctx.strokeStyle='rgba(0,255,255,0.5)'; ctx.lineWidth=5; ctx.stroke();
          });
          if (currentRibbon.length){
            ctx.beginPath();
            currentRibbon.forEach(pt=>ctx.lineTo(pt.x, pt.y));
            ctx.stroke();
          }

          bursts.forEach((b,i)=>{
            b.parts.forEach(p=>p.r+=2);
            ctx.fillStyle='cyan';
            b.parts.forEach(p=>{
              const x=b.x+Math.cos(p.ang)*p.r,
                    y=b.y+Math.sin(p.ang)*p.r;
              ctx.beginPath(); ctx.arc(x,y,3,0,2*Math.PI); ctx.fill();
            });
            if (b.parts[0].r>100) bursts.splice(i,1);
          });

          ctx.fillStyle = magnet ? 'yellow' : 'magenta';
          ctx.beginPath(); ctx.arc(orb.x, orb.y, 20,0,2*Math.PI); ctx.fill();

          if (swigTimer-->0){
            ctx.font='24px monospace'; ctx.fillStyle='#fff';
            ctx.fillText('Swiggity!', orb.x+30, orb.y-30);
          }
        ctx.restore();

        requestAnimationFrame(update);
      }
      update(last);

      window.addEventListener('beforeunload', ()=>
        navigator.sendBeacon('/log', JSON.stringify(logs))
      );
    }
  }
  customElements.define('dreamscape-proto6', DreamscapeProto6);
  </script>
</body>
</html>