# Golf

----

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Rick's Dreamscape Prototype #7</title>
<style>
  html, body { margin:0; padding:0; overflow:hidden; height:100%; background: linear-gradient(#1e212d, #3a3f5c); }
  #canvas { position:absolute; top:0; left:0; width:100%; height:100%; }
  #fps { position:absolute; top:5px; left:5px; color:#0f0; font:12px monospace; z-index:100; }
</style>
</head>
<body>
<canvas id="canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
<div id="fps">FPS: --</div>
<script>
// Logging interactions invisibly
const logs = [];
function log(evt) { logs.push({ t: Date.now(), type: evt.type }); }

// Canvas setup
const canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');
let width, height;
function resize() { width = canvas.width = innerWidth; height = canvas.height = innerHeight; }
window.addEventListener('resize', resize);
resize();

// Parallax orientation
let px = 0, py = 0;
window.addEventListener('deviceorientation', e => {
  px = e.gamma / 30;
  py = e.beta / 30;
  log(e);
});

// Orb physics
const orb = { x: width/2, y: height/2, vx:0, vy:0, r:25, trail:[] };
const gravity = 0.3, friction = 0.98, bounce = 0.7;

// Ripples
const ripples = [];
function spawnRipple(x, y) {
  ripples.push({ x, y, r:0, a:1 });
}

// Drag fling
let dragStart = null;
window.addEventListener('touchstart', e => {
  const t = e.touches[0];
  dragStart = { x: t.clientX, y: t.clientY, t: Date.now() };
  log(e);
});
window.addEventListener('touchend', e => {
  const t = e.changedTouches[0];
  if (dragStart) {
    const dt = Date.now() - dragStart.t || 1;
    orb.vx = (t.clientX - dragStart.x) / dt * 10;
    orb.vy = (t.clientY - dragStart.y) / dt * 10;
    dragStart = null;
  }
  spawnRipple(t.clientX, t.clientY);
  log(e);
});

// Shake to ripple
window.addEventListener('devicemotion', e => {
  log(e);
  const acc = e.accelerationIncludingGravity || e.acceleration;
  if (acc) {
    const mag = Math.hypot(acc.x, acc.y, acc.z);
    if (mag > 20) {
      spawnRipple(Math.random() * width, Math.random() * height);
    }
  }
});

// Draw loop
let last = performance.now(), frame = 0;
function update(now) {
  const dt = now - last; last = now;
  frame++;
  if (frame % 60 === 0) {
    document.getElementById('fps').textContent = 'FPS: ' + Math.round(1000 / dt);
  }

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Sky & mountains (parallax)
  ctx.save();
  ctx.translate(px * 20, py * 20);
  // Mountains
  ctx.fillStyle = '#2e2a4a';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.7);
  ctx.lineTo(width * 0.3, height * 0.5);
  ctx.lineTo(width * 0.6, height * 0.75);
  ctx.lineTo(width, height * 0.6);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();
  ctx.restore();

  // Grass (foreground)
  ctx.save();
  ctx.translate(px * 40, py * 40);
  ctx.fillStyle = '#1f1c3a';
  ctx.fillRect(0, height * 0.8, width, height * 0.2);
  ctx.restore();

  // Update orb physics
  orb.vy += gravity;
  orb.x += orb.vx;
  orb.y += orb.vy;
  orb.vx *= friction;
  orb.vy *= friction;
  // Bounce on edges
  if (orb.x < orb.r) { orb.x = orb.r; orb.vx = -orb.vx * bounce; spawnRipple(orb.x, orb.y); }
  if (orb.x > width - orb.r) { orb.x = width - orb.r; orb.vx = -orb.vx * bounce; spawnRipple(orb.x, orb.y); }
  if (orb.y < orb.r) { orb.y = orb.r; orb.vy = -orb.vy * bounce; spawnRipple(orb.x, orb.y); }
  if (orb.y > height - orb.r) { orb.y = height - orb.r; orb.vy = -orb.vy * bounce; spawnRipple(orb.x, orb.y); }

  // Trail
  orb.trail.push({ x: orb.x, y: orb.y });
  if (orb.trail.length > 30) orb.trail.shift();

  // Draw trail
  ctx.beginPath();
  orb.trail.forEach((pt, i) => {
    ctx.globalAlpha = i / orb.trail.length;
    ctx.lineTo(pt.x, pt.y);
  });
  ctx.strokeStyle = 'rgba(0,255,255,0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Draw shadow under orb
  const grad = ctx.createRadialGradient(orb.x, orb.y + orb.r, orb.r, orb.x, orb.y + orb.r, orb.r * 4);
  grad.addColorStop(0, 'rgba(0,0,0,0.4)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y + orb.r, orb.r * 4, 0, Math.PI * 2);
  ctx.fill();

  // Draw orb with glow
  ctx.save();
  ctx.shadowColor = 'cyan';
  ctx.shadowBlur = 20;
  ctx.fillStyle = 'cyan';
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ripples
  ripples.forEach((r, idx) => {
    r.r += 3;
    r.a -= 0.02;
    if (r.a <= 0) ripples.splice(idx, 1);
    else {
      ctx.strokeStyle = `rgba(255,255,255,${r.a})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  requestAnimationFrame(update);
}
requestAnimationFrame(update);

// Send logs on exit
window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/log', JSON.stringify(logs));
});
</script>
</body>
</html>