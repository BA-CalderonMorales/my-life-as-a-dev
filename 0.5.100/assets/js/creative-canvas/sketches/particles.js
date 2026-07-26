/*
 * Creative Canvas — "particles" sketch (Canvas2D).
 *
 * A subtle particle flow field: points drift along a sinusoidal flow field
 * tinted with the neutral particle token and occasional accent. Lightweight
 * and dependency-free, offering an alternative hero visual to the WebGL
 * aurora. Registered in window.CreativeCanvasSketches by id.
 */
(function (global) {
  "use strict";

  var ENV = global.CreativeCanvasEnv;

  function mount(canvas, env) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return null;

    var dpr = env.capDpr(2);
    var W = 0, H = 0;
    var particles = [];
    var raf = null;
    var running = false;
    var start = performance.now();

    function resize() {
      dpr = env.capDpr(2);
      W = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      H = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      canvas.width = W;
      canvas.height = H;
      var count = Math.round((W * H) / (26000 * dpr));
      count = Math.max(24, Math.min(140, count));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          life: Math.random() * 1000,
          speed: 0.15 + Math.random() * 0.35,
        });
      }
    }

    function field(x, y, t) {
      var nx = x / W, ny = y / H;
      var a = Math.sin(nx * 3.0 + t * 0.0003) + Math.cos(ny * 2.0 - t * 0.0002);
      return a * Math.PI;
    }

    function frame() {
      if (!running) return;
      var t = performance.now() - start;
      var tk = env.tokens();
      var accent = "rgba(" + tk.accent[0] + "," + tk.accent[1] + "," + tk.accent[2] + ",0.55)";
      var particle = "rgba(" + Math.round(tk.particle[0]) + "," + Math.round(tk.particle[1]) + "," + Math.round(tk.particle[2]) + ",ALPHA)";

      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var ang = field(p.x, p.y, t);
        p.x += Math.cos(ang) * p.speed * dpr;
        p.y += Math.sin(ang) * p.speed * dpr;
        p.life -= 1;
        if (p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10 || p.life < 0) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.life = 600 + Math.random() * 800;
        }
        var r = 1.1 * dpr;
        var useAccent = (i % 11 === 0);
        var col = useAccent ? accent : particle.replace("ALPHA", "0.5");
        ctx.beginPath();
        ctx.fillStyle = col;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (useAccent) {
          ctx.strokeStyle = accent.replace("0.55", "0.18");
          ctx.lineWidth = dpr;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - Math.cos(ang) * 14 * dpr, p.y - Math.sin(ang) * 14 * dpr);
          ctx.stroke();
        }
      }
      raf = global.requestAnimationFrame(frame);
    }

    function startLoop() {
      if (running) return;
      running = true;
      resize();
      raf = global.requestAnimationFrame(frame);
    }

    function stopLoop() {
      running = false;
      if (raf) global.cancelAnimationFrame(raf);
      raf = null;
    }

    global.addEventListener("resize", resize);

    startLoop();

    return {
      canvas: canvas,
      destroy: function () {
        stopLoop();
        global.removeEventListener("resize", resize);
      },
      onVisibility: function (visible) { visible ? startLoop() : stopLoop(); },
    };
  }

  global.CreativeCanvasSketches = global.CreativeCanvasSketches || {};
  global.CreativeCanvasSketches.particles = { id: "particles", mount: mount };
})(window);
