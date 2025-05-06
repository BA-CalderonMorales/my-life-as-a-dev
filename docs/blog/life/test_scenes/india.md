# India

----

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rick's Intergalactic Prototype #13</title>
  <style>
    html, body { margin:0; padding:0; overflow:hidden; background:#000; }
    #canvas { display:block; width:100%; height:100%; }
    #fps { position:absolute; top:8px; left:8px; color:#0ff; font:12px monospace; z-index:100; }
    #subtitle { position:absolute; bottom:16px; width:100%; text-align:center; color:#0ff; font:16px monospace; text-shadow:0 0 5px #0ff; pointer-events:none; }
  </style>
</head>
<body>
  <canvas id="canvas" aria-label="Intergalactic Dreamscape"></canvas>
  <div id="fps">FPS: --</div>
  <div id="subtitle" aria-live="polite"></div>
  <script>
    (function(){
      const canvas = document.getElementById('canvas'),
            ctx = canvas.getContext('2d'),
            fpsEl = document.getElementById('fps'),
            subtitleEl = document.getElementById('subtitle');
      let W, H, cx, cy;
      function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        cx = W/2; cy = H/2;
      }
      window.addEventListener('resize', resize);
      resize();

      // Starfield setup
      const starCount = 800;
      const stars = [];
      for(let i=0;i<starCount;i++){
        stars.push({x:Math.random()*W - cx, y:Math.random()*H - cy, z:Math.random()*W, pz:0});
      }
      let warp = 0.5;

      // Nebula noise
      const nebula = document.createElement('canvas');
      nebula.width = nebula.height = 256;
      const nCtx = nebula.getContext('2d');
      function drawNebula(){
        const img = nCtx.createImageData(256,256);
        for(let i=0;i<img.data.length;i+=4){
          const v = Math.floor((Math.random()+Math.random()+Math.random())/3*255);
          img.data[i]=v/2; img.data[i+1]=v; img.data[i+2]=v*1.5; img.data[i+3]=v/3;
        }
        nCtx.putImageData(img,0,0);
      }
      drawNebula();

      // Interaction: voice commands
      const quotes = [
        "Buckle up, it's cosmic mayhem time!",
        "Intergalactic swirl initiated. *burp*",
        "Wubba lubba warp speed!",
        "I’m not gonna sugarcoat it: this is interdimensional realness."
      ];
      if(navigator.mediaDevices && window.AudioContext){
        navigator.mediaDevices.getUserMedia({audio:true})
          .then(stream=>{
            const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const src = audioCtx.createMediaStreamSource(stream);
            src.connect(analyser);
            const data = new Uint8Array(analyser.fftSize);
            (function analyze(){
              analyser.getByteFrequencyData(data);
              const vol = data.reduce((a,b)=>a+b)/data.length;
              if(vol>200){
                warp = Math.min(10, warp + 0.5);
                showSubtitle(quotes[Math.floor(Math.random()*quotes.length)]);
              }
              requestAnimationFrame(analyze);
            })();
          }).catch(()=>{});
      }

      function showSubtitle(text){
        subtitleEl.textContent = text;
        setTimeout(()=>subtitleEl.textContent='',2000);
      }

      // Touch interactions
      let lastTap = 0, tapCount = 0;
      canvas.addEventListener('touchstart', e=>{
        const touch = e.touches[0];
        const now=Date.now();
        if(now-lastTap<300) tapCount++; else tapCount=1;
        lastTap=now;
        if(tapCount===2){
          warp = warp>0.5?0.5:5;
          showSubtitle("Warp factor " + warp.toFixed(1));
        }
      });
      // Pinch to change warp
      let prevDist=0;
      canvas.addEventListener('touchmove', e=>{
        if(e.touches.length===2){
          const dx=e.touches[0].clientX-e.touches[1].clientX;
          const dy=e.touches[0].clientY-e.touches[1].clientY;
          const dist=Math.hypot(dx,dy);
          if(prevDist) warp = Math.max(0.5, Math.min(15, warp + (prevDist-dist)*0.01));
          prevDist=dist;
        }
      });
      canvas.addEventListener('touchend', ()=>prevDist=0);

      // Device tilt
      let tiltX=0, tiltY=0;
      window.addEventListener('deviceorientation', e=>{
        tiltX = (e.gamma||0)/45;
        tiltY = (e.beta||0)/90;
      });

      // Main loop
      let lastTime = performance.now(), frame=0;
      function loop(now){
        const dt = now-lastTime; lastTime=now;
        frame++;
        if(frame%60===0) fpsEl.textContent = 'FPS: ' + Math.round(1000/dt);

        // Background nebula
        const scale = 2 + Math.sin(frame*0.005);
        ctx.save();
        ctx.globalAlpha=0.3;
        ctx.translate(cx,cy);
        ctx.rotate(frame*0.0005);
        ctx.drawImage(nebula, -128*scale + tiltX*50, -128*scale + tiltY*50, 256*scale,256*scale);
        ctx.restore();

        // Starfield
        ctx.fillStyle='rgba(0,0,0,0.2)';
        ctx.fillRect(0,0,W,H);
        ctx.save(); ctx.translate(cx,cy);
        stars.forEach(s=>{
          s.z -= warp;
          if(s.z<1) { s.z = W; s.x = Math.random()*W - cx; s.y = Math.random()*H - cy; }
          const k = 300/s.z;
          const x = s.x * k;
          const y = s.y * k;
          ctx.fillStyle = 'hsl(200,100%,' + (100 - k*2) + '%)';
          ctx.fillRect(x,y,2*k,2*k);
        });
        ctx.restore();

        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    })();
  </script>
</body>
</html>
