# Stars and Motion

----

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Rick's Dreamscape Prototype #3</title>
<style>
  html, body { margin:0; padding:0; overflow:hidden; height:100%; background:#000; }
  #canvas{position:absolute; top:0; left:0; width:100%; height:100%;}
  #fps{position:absolute; top:5px; left:5px; color:#0f0; font:12px monospace; z-index:100;}
</style>
</head>
<body>
<canvas id="canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
<div id="fps" aria-label="FPS Counter">FPS: --</div>
<script>
// Invisible logging
const logs = [];
function log(evt) { logs.push({ time: Date.now(), type: evt.type, data: evt.detail || {} }); }

// Input capture & shake detection
window.addEventListener('devicemotion', e => {
  log(e);
  const a = e.accelerationIncludingGravity || e.acceleration;
  if (a) {
    const mag = Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z);
    if (mag > 25) for (let i = 0; i < 20; i++) spawnPetal();
  }
});
['touchstart','touchmove','touchend','mousedown','mousemove','mouseup','deviceorientation','orientationchange'].forEach(evt => {
  window.addEventListener(evt, log);
});

// Voice recognition & commands
let recognition, flashTimer = 0;
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.onresult = e => {
    const transcript = e.results[e.results.length-1][0].transcript.toLowerCase();
    log({ type: 'speech', transcript });
    if (transcript.includes('vine')) generateVine('F', 'F[+F]F[-F]F', 4);
    if (transcript.includes('petal')) for (let i=0; i<50; i++) spawnPetal();
    if (transcript.includes('flash')) flashTimer = 10;
  };
  recognition.start();
}

// Canvas & resize
const canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
window.addEventListener('resize', resize);
resize();

// Parallax variables
let px = 0, py = 0;
window.addEventListener('deviceorientation', e => {
  px = e.gamma / 45;
  py = e.beta / 90;
});

// Petal particles
let petals = [];
function spawnPetal() {
  petals.push({ x: Math.random()*canvas.width, y: -10, vy: Math.random()+0.5, r: Math.random()*3+2 });
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
  if (!dragStart) return;
  const dt = Date.now() - dragStart.t;
  const vx = (dragX - dragStart.x) / dt * 10;
  const vy = (dragY - dragStart.y) / dt * 10;
  flings.push({ x: dragStart.x, y: dragStart.y, vx, vy, trail: [] });
  dragStart = null;
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
  });
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
generateVine('F', 'F[+F]F[-F]F', 3);
function drawVine() {
  const stack = [], w = canvas.width, h = canvas.height;
  let x = w * 0.1, y = h * 0.9, ang = -Math.PI/2;
  ctx.strokeStyle = 'lime'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y);
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

// Animation & shader overlay
let lastTime = performance.now(), fps = 0;
function update(now) {
  const dt = now - lastTime;
  lastTime = now;
  fps = Math.round(1000 / dt);
  document.getElementById('fps').textContent = 'FPS: ' + fps;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Parallax background
  ctx.save();
  ctx.translate(px*30, py*30);
  const grd = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2, canvas.width);
  grd.addColorStop(0, '#002'); grd.addColorStop(1, '#220');
  ctx.fillStyle = grd;
  ctx.fillRect(-px*50, -py*50, canvas.width+px*100, canvas.height+py*100);
  ctx.restore();

  // Dynamic shader overlay
  const hue = (now/50) % 360;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = `hsla(${hue},100%,50%,0.02)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Petals
  if (Math.random() < 0.05) spawnPetal();
  petals.forEach(p => {
    p.y += p.vy;
    ctx.fillStyle = 'rgba(255,182,193,0.7)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
    ctx.fill();
  });
  petals = petals.filter(p => p.y < canvas.height + 10);

  // Flings & trails
  flings.forEach(obj => {
    obj.vy += 0.5;
    obj.x += obj.vx; obj.y += obj.vy;
    obj.trail.push({ x: obj.x, y: obj.y });
    ctx.beginPath();
    obj.trail.slice(-10).forEach((pt, i) => { ctx.globalAlpha = i/10; ctx.lineTo(pt.x, pt.y); });
    ctx.strokeStyle = 'white'; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.fillStyle = 'white'; ctx.arc(obj.x, obj.y, 5, 0, 2*Math.PI); ctx.fill();
  });
  flings = flings.filter(o => o.y < canvas.height + 50);

  // Audio-reactive bloom
  if (analyser) {
    analyser.getByteFrequencyData(dataArr);
    const avg = dataArr.reduce((sum, v) => sum + v, 0) / dataArr.length;
    ctx.save();
    ctx.globalAlpha = avg/255 * 0.5;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, avg, 0, 2*Math.PI);
    ctx.fillStyle = 'cyan'; ctx.fill();
    ctx.restore();
  }

  // Voice-triggered flash
  if (flashTimer > 0) {
    ctx.save();
    ctx.globalAlpha = flashTimer/10;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    flashTimer--;
  }

  // Draw vine
  drawVine();

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