# Bravo

----

==="Content"

Testing look and feel

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Rick's Dreamscape Prototype #4</title>
<style>
  html, body { margin:0; padding:0; overflow:hidden; height:100%; background:#111; }
  #canvas{position:absolute; top:0; left:0; width:100%; height:100%;}
  #fps{position:absolute; top:5px; left:5px; color:#0f0; font:12px monospace; z-index:100;}
  #message{position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); padding:10px 20px; background:rgba(0,0,0,0.7); color:#fff; font:16px monospace; border-radius:5px; display:none; z-index:100;}
</style>
</head>
<body>
<canvas id="canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
<div id="fps" aria-label="FPS Counter">FPS: --</div>
<div id="message" aria-live="polite"></div>
<script>
// Logs buffer
const logs = [];
function log(evt) { logs.push({ t:Date.now(), type:evt.type, data:evt.detail||{} }); }

// Input capture
['touchstart','touchmove','touchend','mousedown','mousemove','mouseup','keydown','deviceorientation','devicemotion'].forEach(e => window.addEventListener(e, log));

// Double-tap detection
let lastTap=0;
window.addEventListener('touchend', e => {
  const now=Date.now();
  if(now - lastTap <300) {
    const t = e.changedTouches[0];
    spawnRadial(t.clientX, t.clientY);
  }
  lastTap = now;
});

// Pinch-to-zoom
let pinchDist=0, scale=1;
window.addEventListener('touchstart', e => {
  if(e.touches.length===2){
    const dx=e.touches[0].clientX - e.touches[1].clientX;
    const dy=e.touches[0].clientY - e.touches[1].clientY;
    pinchDist=Math.hypot(dx,dy);
  }
});
window.addEventListener('touchmove', e => {
  if(e.touches.length===2){
    const dx=e.touches[0].clientX - e.touches[1].clientX;
    const dy=e.touches[0].clientY - e.touches[1].clientY;
    const d=Math.hypot(dx,dy);
    scale *= d/pinchDist;
    pinchDist = d;
    scale = Math.min(Math.max(scale,0.5),3);
  }
});

// Voice recognition & feedback
let recognition, msgTimer=0;
if('webkitSpeechRecognition' in window){
  recognition=new webkitSpeechRecognition();
  recognition.continuous=true;
  recognition.onresult=e=>{
    const txt=e.results[e.results.length-1][0].transcript.toLowerCase();
    log({type:'speech', transcript:txt});
    const msgDiv=document.getElementById('message');
    if(txt.includes('wubba')){
      msgDiv.textContent='Wubba lubba dub dub!';
      speak('Wubba lubba dub dub!');
    } else {
      msgDiv.textContent='You said: ' + txt;
    }
    msgDiv.style.display='block'; msgTimer=120;
  };
  recognition.start();
}

// Speech synthesis
function speak(text){
  const u=new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(u);
}

// Canvas setup
const canvas=document.getElementById('canvas'), ctx=canvas.getContext('2d');
function resize(){canvas.width=innerWidth;canvas.height=innerHeight;}
window.addEventListener('resize',resize);
resize();

// Particles and radial bursts
let petals=[], bursts=[];
function spawnPetal(){petals.push({x:Math.random()*canvas.width, y:-10, vy:Math.random()+0.5, r:Math.random()*3+2});}
function spawnRadial(x,y){
  for(let a=0;a<16;a++){
    const ang=2*Math.PI*(a/16);
    bursts.push({x,y,vx:Math.cos(ang)*3,vy:Math.sin(ang)*3,life:60});
  }
}

// Fling physics
let flings=[], drag=null, dx=0, dy=0;
window.addEventListener('touchstart',e=>{
  const t=e.touches[0];
  drag={x:t.clientX,y:t.clientY,t:Date.now()};
});
window.addEventListener('touchmove',e=>{
  const t=e.touches[0];
  dx=t.clientX; dy=t.clientY;
});
window.addEventListener('touchend',()=>{
  if(drag){
    const dt=Date.now()-drag.t;
    const vx=(dx-drag.x)/dt*10, vy=(dy-drag.y)/dt*10;
    flings.push({x:drag.x,y:drag.y,vx,vy,trail:[]});
    drag=null;
  }
});

// Animation & FPS
let last=performance.now(), frame=0, fps=0;
function update(now){
  const dt=now-last; last=now;
  frame++; if(frame%60===0) fps=Math.round(1000/dt);
  document.getElementById('fps').textContent='FPS: '+fps;
  
  // Clear
  ctx.save();
  ctx.setTransform(scale,0,0,scale,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  
  // Parallax background
  const px=(window.orientation||0)/90, py=0;
  ctx.fillStyle='#112';
  ctx.fillRect(-canvas.width*0.1, -canvas.height*0.1, canvas.width*1.2, canvas.height*1.2);
  
  // Shader swirl
  const hue=(now/100)%360;
  ctx.globalCompositeOperation='lighter';
  ctx.fillStyle=`hsla(${hue},100%,50%,0.02)`;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.globalCompositeOperation='source-over';
  
  // Petals
  if(Math.random()<0.03) spawnPetal();
  petals.forEach(p=>{p.y+=p.vy;ctx.fillStyle='rgba(255,182,193,0.7)';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,2*Math.PI);ctx.fill();});
  petals=petals.filter(p=>p.y<canvas.height+10);
  
  // Radial bursts
  bursts.forEach(b=>{b.x+=b.vx; b.y+=b.vy; b.life--; ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(b.x,b.y,3,0,2*Math.PI); ctx.fill();});
  bursts=bursts.filter(b=>b.life>0);
  
  // Flings
  flings.forEach(o=>{o.vy+=0.5; o.x+=o.vx; o.y+=o.vy; o.trail.push({x:o.x,y:o.y}); ctx.beginPath(); o.trail.slice(-10).forEach((pt,i)=>{ctx.globalAlpha=i/10; ctx.lineTo(pt.x,pt.y);}); ctx.strokeStyle='cyan';ctx.stroke(); ctx.globalAlpha=1; ctx.beginPath(); ctx.fillStyle='cyan'; ctx.arc(o.x,o.y,5,0,2*Math.PI); ctx.fill();});
  flings=flings.filter(o=>o.y<canvas.height+50);
  
  ctx.restore();
  
  // Hide message
  if(msgTimer-->0){} else document.getElementById('message').style.display='none';
  
  requestAnimationFrame(update);
}
requestAnimationFrame(update);

// Send logs
window.addEventListener('beforeunload',()=>navigator.sendBeacon('/log',JSON.stringify(logs)));
</script>
</body>
</html>