# Delta

----

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ghibli Masterpiece v13</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap');
    html, body { margin:0; padding:0; overflow:hidden; height:100%; background:#000; }
    canvas { display:block; width:100%; height:100%; }
    #instructions {
      position:absolute;
      bottom:20px;
      left:50%;
      transform:translateX(-50%);
      font-family:'Indie Flower', cursive;
      font-size:20px;
      color:#fff;
      text-shadow:0 0 8px rgba(0,0,0,0.7);
      pointer-events:none;
      opacity:1;
      transition:opacity 1s ease-out;
    }
  </style>
</head>
<body>
  <ghibli-masterpiece></ghibli-masterpiece>

  <script>
  class GhibliMasterpiece extends HTMLElement {
    connectedCallback(){
      this.innerHTML = `
        <canvas id="canvas" aria-label="Ghibli Masterpiece"></canvas>
        <div id="instructions">🌱 Tap to awaken Kodama • 🌼 Hold to bloom light</div>
      `;
      const canvas = this.querySelector('#canvas'),
            instructions = this.querySelector('#instructions'),
            ctx = canvas.getContext('2d');
      let W, H, lightBloom = 0, touching = false;
      const kodama = [], particles = [];

      function resize(){
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      function spawnKodama(x, y){
        kodama.push({ x, y, age: 0 });
        lightBloom = 1;
      }
      function spawnParticles(x, y){
        for(let i = 0; i < 20; i++){
          particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: 1 + Math.random()*3,
            age: 0,
            max: 60
          });
        }
      }

      canvas.addEventListener('pointerdown', e => {
        spawnKodama(e.clientX, e.clientY);
        touching = true;
      });
      canvas.addEventListener('pointermove', e => {
        if(touching) spawnParticles(e.clientX, e.clientY);
      });
      canvas.addEventListener('pointerup', () => {
        touching = false;
        instructions.style.opacity = '0';
      });

      (function draw(){
        // background gradient
        const t = performance.now() * 0.00005;
        const r1 = Math.floor(20 + 30 * Math.sin(t)),
              g1 = Math.floor(80 + 30 * Math.cos(t)),
              b1 = Math.floor(120 + 40 * Math.sin(t*1.3));
        const r2 = Math.floor(5 + 10 * Math.cos(t)),
              g2 = Math.floor(20 + 30 * Math.sin(t)),
              b2 = Math.floor(40 + 20 * Math.cos(t*1.1));
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, `rgb(${r1},${g1},${b1})`);
        bg.addColorStop(1, `rgb(${r2},${g2},${b2})`);
        ctx.fillStyle = bg;
        ctx.fillRect(0,0,W,H);

        // light bloom overlay
        if(lightBloom > 0){
          ctx.fillStyle = `rgba(255,240,200,${lightBloom*0.3})`;
          ctx.fillRect(0,0,W,H);
          lightBloom *= 0.96;
        }

        // draw Kodama
        kodama.forEach((k,i) => {
          k.age++;
          const a = Math.max(0, 1 - k.age/100);
          ctx.save();
            ctx.globalAlpha = a;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(k.x, k.y - k.age*0.5, 8 + Math.sin(k.age*0.2)*3, 0, 2*Math.PI);
            ctx.fill();
          ctx.restore();
          if(k.age > 100) kodama.splice(i,1);
        });

        // draw particles
        particles.forEach((p,i) => {
          p.age++;
          if(p.age > p.max) return particles.splice(i,1);
          p.x += p.vx; p.y += p.vy;
          const a = 1 - p.age/p.max;
          ctx.fillStyle = `rgba(255,255,200,${a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, 2*Math.PI);
          ctx.fill();
        });

        requestAnimationFrame(draw);
      })();
    }
  }
  customElements.define('ghibli-masterpiece', GhibliMasterpiece);
  </script>
</body>
</html>