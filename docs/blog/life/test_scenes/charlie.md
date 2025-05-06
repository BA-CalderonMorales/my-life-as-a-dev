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
  #fps { position:absolute; top:5px; left:5px; color:#0f0; font:12px monospace; z-index:100; }
</style>
</head>
<body>
<canvas id="canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
<div id="fps">FPS: --</div>
<script>
// Invisible logging
const logs = [];
function log(evt) { logs.push({ t:Date.now(), type:evt.type }); }

// Input & tap detection
let lastTap=0, tapCount=0, magnet=false, swigTimer=0;
window.addEventListener('touchend', e => {
  log(e);
  const now=Date.now();
  if(now-lastTap<300) tapCount++; else tapCount=1;
  lastTap=now;
  const t = e.changedTouches[0];
  if(tapCount===2) magnet = !magnet;
  if(tapCount===3) swigTimer = 60;
  // Single tap event
  if(tapCount===1) createBurst(t.clientX, t.clientY);
});

// Shake -> bursts
window.addEventListener('devicemotion', e => {
  log(e);
  const a = e.accelerationIncludingGravity || e.acceleration;
  if(a) {
    const mag=Math.hypot(a.x,a.y,a.z);
    if(mag>20) for(let i=0;i<10;i++)
      createBurst(Math.random()*canvas.width, Math.random()*canvas.height);
  }
});

// Ribbons
let ribbons=[], currentRibbon=[];
window.addEventListener('touchmove', e => {
  log(e);
  if(e.touches.length===1) {
    const t=e.touches[0];
    currentRibbon.push({x:t.clientX, y:t.clientY});
    if(magnet) orb.x=t.clientX, orb.y=t.clientY;
  }
});
window.addEventListener('touchend', e => {
  if(currentRibbon.length) { ribbons.push(currentRibbon); currentRibbon=[]; }
});

// Pinch rotate
let rotation=0, initDist=0, initRot=0;
window.addEventListener('touchstart', e => {
  if(e.touches.length===2) {
    const dx=e.touches[0].clientX-e.touches[1].clientX;
    const dy=e.touches[0].clientY-e.touches[1].clientY;
    initDist=Math.hypot(dx,dy);
    initRot=rotation;
  }
});
window.addEventListener('touchmove', e => {
  if(e.touches.length===2) {
    const dx=e.touches[0].clientX-e.touches[1].clientX;
    const dy=e.touches[0].clientY-e.touches[1].clientY;
    const dist=Math.hypot(dx,dy);
    const angle=Math.atan2(dy,dx);
    rotation = initRot + (dist-initDist)/200;
  }
});

// Orientation background
let ox=0, oy=0;
window.addEventListener('deviceorientation', e => {
  ox = e.gamma/45;
  oy = e.beta/90;
});

// Create burst
const bursts=[];
function createBurst(x,y) {
  const parts=[];
  for(let i=0;i<20;i++){
    const ang=2*Math.PI*(i/20);
    parts.push({ang, r:0});
  }
  bursts.push({x,y,parts});
}

// Orb
const orb={x:0,y:0};
function initOrb() { orb.x=canvas.width/2; orb.y=canvas.height/2; }
window.addEventListener('resize', () => { resizeCanvas(); initOrb(); });
const canvas=document.getElementById('canvas'), ctx=canvas.getContext('2d');
function resizeCanvas(){ canvas.width=innerWidth; canvas.height=innerHeight; }
resizeCanvas(); initOrb();

// FPS
let lastTime=performance.now(), frame=0;
function update(now) {
  const dt=now-lastTime; lastTime=now;
  frame++; if(frame%60===0) document.getElementById('fps').textContent='FPS: '+Math.round(1000/dt);

  ctx.clearRect(0,0,canvas.width,canvas.height);
  // Parallax grid
  ctx.save();
  ctx.translate(ox*20, oy*20);
  ctx.strokeStyle='#222';
  for(let i=0;i<canvas.width;i+=50){
    ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke();
  }
  for(let j=0;j<canvas.height;j+=50){
    ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(canvas.width,j); ctx.stroke();
  }
  ctx.restore();

  // Rotate canvas
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(rotation);
  ctx.translate(-canvas.width/2, -canvas.height/2);

  // Ribbons
  ribbons.forEach(rib => {
    ctx.beginPath();
    rib.forEach((pt,i) => {
      ctx.lineTo(pt.x,pt.y);
    });
    ctx.strokeStyle='rgba(0,255,255,0.5)'; ctx.lineWidth=5; ctx.stroke();
  });
  if(currentRibbon.length){
    ctx.beginPath();
    currentRibbon.forEach(pt => ctx.lineTo(pt.x,pt.y));
    ctx.stroke();
  }

  // Bursts
  bursts.forEach((b,bi) => {
    b.parts.forEach(p => { p.r += 2; });
    ctx.fillStyle='cyan';
    b.parts.forEach(p => {
      const x = b.x + Math.cos(p.ang)*p.r;
      const y = b.y + Math.sin(p.ang)*p.r;
      ctx.beginPath(); ctx.arc(x,y,3,0,2*Math.PI); ctx.fill();
    });
    if(b.parts[0].r > 100) bursts.splice(bi,1);
  });

  // Orb
  ctx.fillStyle=magnet?'yellow':'magenta';
  ctx.beginPath(); ctx.arc(orb.x, orb.y, 20,0,2*Math.PI); ctx.fill();

  // Swiggity
  if(swigTimer-->0){
    ctx.font='24px monospace'; ctx.fillStyle='#fff';
    ctx.fillText('Swiggity!', orb.x+30, orb.y-30);
  }

  ctx.restore();
  requestAnimationFrame(update);
}
requestAnimationFrame(update);

// Log on exit
window.addEventListener('beforeunload',()=>navigator.sendBeacon('/log',JSON.stringify(logs)));
</script>
</body>
</html>
