# India

----

<!-- Self-contained Web Component for your “India” scene -->
<script>
class IntergalacticScene extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode:'open'});
    // inject styles + markup
    shadow.innerHTML = `
      <style>
        :host { display:block; position:relative; width:100%; height:100vh; overflow:hidden; background:#000; }
        canvas { width:100%; height:100%; display:block; }
        #fps,#subtitle {
          position:absolute; color:#0ff; text-shadow:0 0 5px #0ff; pointer-events:none; z-index:10;
        }
        #fps { top:0.5rem; left:0.5rem; font:0.75rem monospace; }
        #subtitle {
          bottom:1rem; left:50%; transform:translateX(-50%);
          max-width:90%; font:0.875rem monospace; text-align:center;
        }
      </style>
      <canvas id="canvas" aria-label="Intergalactic Dreamscape"></canvas>
      <div id="fps">FPS: --</div>
      <div id="subtitle" aria-live="polite"></div>
    `;
    this._canvas = shadow.getElementById('canvas');
    this._ctx    = this._canvas.getContext('2d');
    this._fpsEl  = shadow.getElementById('fps');
    this._subEl  = shadow.getElementById('subtitle');
  }
  connectedCallback(){
    const ctx=this._ctx, fpsEl=this._fpsEl, subEl=this._subEl, canvas=this._canvas;
    let W,H,cx,cy,warp=0.5,frame=0,last=performance.now();
    const stars = Array.from({length:800},()=>({x:0,y:0,z:0,pz:0}));
    const nebula = document.createElement('canvas'); nebula.width=nebula.height=256;
    const nCtx = nebula.getContext('2d');
    const drawNebula = ()=>{
      const img=nCtx.createImageData(256,256);
      for(let i=0;i<img.data.length;i+=4){
        const v=Math.random()*255;
        img.data.set([v/2,v,v*1.5,v/3],i);
      }
      nCtx.putImageData(img,0,0);
    }; drawNebula();
    const initStars = ()=>stars.forEach(s=>{
      s.x = Math.random()*W-cx;
      s.y = Math.random()*H-cy;
      s.z = Math.random()*W;
      s.pz = 0;
    });
    const resize=()=>{
      W=canvas.width=window.innerWidth;
      H=canvas.height=window.innerHeight;
      cx=W/2; cy=H/2;
      initStars();
    };
    resize(); window.addEventListener('resize',resize);
    // interactions omitted for brevity – you'd re-use your existing JS here
    const loop=(now)=>{
      const dt=now-last; last=now; frame++;
      if(frame%60===0) fpsEl.textContent='FPS: '+Math.round(1000/dt);
      // draw nebula & stars...
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
customElements.define('intergalactic-scene', IntergalacticScene);
</script>

<intergalactic-scene></intergalactic-scene>