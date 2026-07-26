/*
 * Creative Canvas — "aurora" sketch (WebGL fragment shader).
 *
 * A calm, living background built from domain-warped flow noise: a slow
 * aurora/liquid gradient that drifts between the neutral surface tones with
 * restrained accent streaks. Driven entirely by --creative-canvas-* tokens.
 *
 * Implemented as a self-contained module that registers itself in
 * window.CreativeCanvasSketches so the entry (main.js) can boot it by id.
 */
(function (global) {
  "use strict";

  var ENV = global.CreativeCanvasEnv;

  var VERT = [
    "attribute vec2 a_pos;",
    "void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }",
  ].join("\n");

  // Domain-warped fbm flow field, mixed across the three surface tones with
  // a soft accent haze. All colors arrive as uniforms from the design tokens.
  var FRAG = [
    "precision highp float;",
    "uniform vec2 u_res;",
    "uniform float u_time;",
    "uniform vec3 u_bg1;",
    "uniform vec3 u_bg2;",
    "uniform vec3 u_bg3;",
    "uniform vec3 u_accent;",

    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "float noise(vec2 p){",
    "  vec2 i = floor(p); vec2 f = fract(p);",
    "  vec2 u = f*f*(3.0-2.0*f);",
    "  float a = hash(i);",
    "  float b = hash(i+vec2(1.0,0.0));",
    "  float c = hash(i+vec2(0.0,1.0));",
    "  float d = hash(i+vec2(1.0,1.0));",
    "  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);",
    "}",
    "float fbm(vec2 p){",
    "  float v = 0.0; float amp = 0.5;",
    "  for (int i=0;i<5;i++){ v += amp*noise(p); p *= 2.02; amp *= 0.5; }",
    "  return v;",
    "}",

    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / u_res.xy;",
    "  vec2 p = uv * 2.4;",
    "  float t = u_time * 0.035;",
    "  vec2 warp = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(5.2, t)));",
    "  float field = fbm(p + warp * 1.6 + vec2(0.0, t*0.6));",
    "  float veil = fbm(p * 0.7 - warp + vec2(t*0.4, 0.0));",
    "  vec3 base = mix(u_bg1, u_bg2, smoothstep(0.2, 0.8, field));",
    "  base = mix(base, u_bg3, smoothstep(0.5, 1.0, veil) * 0.7);",
    "  float streak = smoothstep(0.62, 0.86, field + 0.18*sin(uv.x*3.0 + t));",
    "  vec3 col = mix(base, u_accent, streak * 0.28);",
    "  col += u_accent * 0.04 * pow(veil, 3.0);",
    "  gl_FragColor = vec4(col, 1.0);",
    "}",
  ].join("\n");

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("creative-canvas aurora: shader error", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  function mount(canvas, env) {
    var gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) return null;

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "u_res");
    var uTime = gl.getUniformLocation(prog, "u_time");
    var uBg1 = gl.getUniformLocation(prog, "u_bg1");
    var uBg2 = gl.getUniformLocation(prog, "u_bg2");
    var uBg3 = gl.getUniformLocation(prog, "u_bg3");
    var uAccent = gl.getUniformLocation(prog, "u_accent");

    var raf = null;
    var start = performance.now();
    var running = false;

    function resize() {
      var dpr = env.capDpr(2);
      var w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      var h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function frame() {
      if (!running) return;
      resize();
      var tk = env.tokens();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform3fv(uBg1, tk.bg1.map(function (c) { return c / 255; }));
      gl.uniform3fv(uBg2, tk.bg2.map(function (c) { return c / 255; }));
      gl.uniform3fv(uBg3, tk.bg3.map(function (c) { return c / 255; }));
      gl.uniform3fv(uAccent, tk.accent.map(function (c) { return c / 255; }));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = global.requestAnimationFrame(frame);
    }

    function startLoop() {
      if (running) return;
      running = true;
      raf = global.requestAnimationFrame(frame);
    }

    function stopLoop() {
      running = false;
      if (raf) global.cancelAnimationFrame(raf);
      raf = null;
    }

    resize();
    startLoop();

    return {
      canvas: canvas,
      destroy: function () {
        stopLoop();
        try { gl.getExtension("WEBGL_lose_context").loseContext(); } catch (e) {}
      },
      onVisibility: function (visible) { visible ? startLoop() : stopLoop(); },
    };
  }

  global.CreativeCanvasSketches = global.CreativeCanvasSketches || {};
  global.CreativeCanvasSketches.aurora = { id: "aurora", mount: mount };
})(window);
