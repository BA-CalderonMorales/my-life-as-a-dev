# Hotel

----

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rick's Dreamscape Prototype #12</title>
  <style>
    html, body { margin:0; padding:0; overflow:hidden; height:100%; background:#000; }
    #canvas { display:block; width:100%; height:100%; }
    #fps { position:absolute; top:8px; left:8px; color:#0f0; font:12px monospace; z-index:100; }
  </style>
</head>
<body>
  <canvas id="canvas" aria-label="Kaleidoscopic Dreamscape"></canvas>
  <div id="fps">FPS: --</div>
  <script>
    // Invisible logs
    const logs = [];
    function log(evt) { logs.push({ t: Date.now(), type: evt.type }); }

    // Canvas setup
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let W, H, cx, cy;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W / 2;
      cy = H / 2;
    }
    window.addEventListener('resize', resize);
    resize();

    // Parallax gradient
    let tiltX = 0, tiltY = 0;
    window.addEventListener('deviceorientation', e => {
      tiltX = (e.gamma || 0) / 45;
      tiltY = (e.beta || 0) / 90;
      log(e);
    });

    // Mirror brush
    const mirrorCount = 6;
    let drawing = false;
    let lastTap = 0, tapCount = 0;
    canvas.addEventListener('touchstart', e => {
      drawing = true;
      handlePoint(e.touches[0].clientX, e.touches[0].clientY);
      // Triple-tap detection
      const now = Date.now();
      if (now - lastTap < 300) tapCount++; else tapCount = 1;
      lastTap = now;
      if (tapCount === 3) spawnBurst(lastX, lastY);
      log(e);
    });
    canvas.addEventListener('touchmove', e => {
      if (drawing) handlePoint(e.touches[0].clientX, e.touches[0].clientY);
      log(e);
    });
    canvas.addEventListener('touchend', e => { drawing = false; log(e); });
    let lastX = 0, lastY = 0;
    const strokes = [];
    function handlePoint(x, y) {
      lastX = x; lastY = y;
      strokes.push({ x: x - cx, y: y - cy });
    }

    // Burst particles
    const bursts = [];
    function spawnBurst(x, y) {
      for (let i = 0; i < 20; i++) {
        const ang = Math.random() * Math.PI * 2;
        bursts.push({ x, y, vx: Math.cos(ang)*3, vy: Math.sin(ang)*3, life: 30 });
      }
    }

    // Animation
    let lastTime = performance.now(), frame = 0, angle = 0;
    function update(now) {
      const dt = now - lastTime; lastTime = now;
      frame++;
      if (frame % 60 === 0) {
        document.getElementById('fps').textContent = 'FPS: ' + Math.round(1000 / dt);
      }
      // Feedback loop
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.002);
      ctx.globalAlpha = 0.9;
      ctx.scale(0.99, 0.99);
      ctx.drawImage(canvas, -cx, -cy);
      ctx.restore();

      // Parallax background
      const grad = ctx.createRadialGradient(cx + tiltX*100, cy + tiltY*100, 0, cx, cy, Math.max(W, H));
      grad.addColorStop(0, 'rgba(30,10,60,0.5)');
      grad.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';

      // Draw strokes mirrored
      ctx.save();
      ctx.translate(cx, cy);
      strokes.forEach(pt => {
        for (let i = 0; i < mirrorCount; i++) {
          ctx.rotate((Math.PI*2) / mirrorCount);
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x * 1.1, pt.y * 1.1);
          ctx.strokeStyle = 'hsl(' + (frame*2 + i*60) % 360 + ', 80%, 60%)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
      ctx.restore();
      strokes.length = 0;

      // Draw bursts
      bursts.forEach((b, i) => {
        b.x += b.vx; b.y += b.vy; b.life--;
        ctx.globalAlpha = b.life / 30;
        ctx.fillStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, 2*Math.PI);
        ctx.fill();
        if (b.life <= 0) bursts.splice(i, 1);
      });
      ctx.globalAlpha = 1;

      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);

    // Send logs invisibly
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon('/log', JSON.stringify(logs));
    });
  </script>
</body>
</html>