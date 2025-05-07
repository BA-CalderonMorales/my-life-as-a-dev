/**
 * Stars and Motion Dreamscape Component
 * 
 * An interactive canvas-based visualization featuring parallax stars,
 * motion-reactive elements, and gesture controls.
 */

import { defaultLogger as logger } from '../../custom/logger.js';

export class StarsMotionScene {
  /**
   * Create a new StarsMotionScene
   * @param {HTMLElement} container - The container element to render in
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = Object.assign({
      debug: false,
      enableAudio: true,
      enableVoice: true
    }, options);

    // Set up logger
    logger.setModule('dreamscape');
    if (this.options.debug) {
      logger.enableLogs();
      logger.setLogLevel('debug');
    }

    // Initialize the view model
    this.viewModel = {
      px: 0,
      py: 0,
      petals: [],
      flings: [],
      dragStart: null,
      dragX: 0, 
      dragY: 0,
      analyser: null,
      dataArr: null,
      vineCommands: '',
      recognition: null,
      flashTimer: 0,
      fps: 0,
      scale: 1,
      logs: []
    };

    // Initialize the component
    this.initialize();
  }

  /**
   * Initialize the component DOM and event listeners
   */
  initialize() {
    // Create canvas and FPS counter
    this.container.innerHTML = `
      <canvas id="canvas" class="dreamscape-canvas" aria-label="Interactive Dreamscape Canvas"></canvas>
      <div id="fps" class="dreamscape-fps" aria-label="FPS Counter">FPS: --</div>
    `;

    // Get references to DOM elements
    this.canvas = this.container.querySelector('#canvas');
    this.ctx = this.canvas.getContext('2d');
    this.fpsEl = this.container.querySelector('#fps');

    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize the L-system vine
    this.generateVine('F', 'F[+F]F[-F]F', 3);

    // Set up audio if enabled
    if (this.options.enableAudio) {
      this.setupAudio();
    }

    // Set up voice recognition if enabled
    if (this.options.enableVoice) {
      this.setupVoiceRecognition();
    }

    // Start animation loop
    this.lastTime = performance.now();
    this.update(this.lastTime);

    // Resize the canvas to fit the container
    this.resize();

    logger.info('StarsMotionScene initialized', 'initialize');
  }

  /**
   * Log events with timestamps
   * @param {Event} evt - The event to log
   */
  log(evt) {
    this.viewModel.logs.push({ 
      time: Date.now(), 
      type: evt.type, 
      data: evt.detail || {} 
    });
    logger.debug(`Event logged: ${evt.type}`, 'log');
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Resize handler
    window.addEventListener('resize', this.resize.bind(this));

    // Device orientation for parallax
    window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
    window.addEventListener('devicemotion', this.handleDeviceMotion.bind(this));

    // Touch/mouse handlers
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Additional input logging
    ['touchstart','touchmove','touchend','mousedown','mousemove','mouseup','orientationchange']
      .forEach(evt => window.addEventListener(evt, this.log.bind(this)));

    // Send logs on page unload
    window.addEventListener('beforeunload', () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/log', JSON.stringify(this.viewModel.logs));
      }
    });
  }

  /**
   * Resize the canvas to fit the container
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    logger.debug(`Canvas resized: ${this.canvas.width}x${this.canvas.height}`, 'resize');
  }

  /**
   * Handle device orientation for parallax effect
   * @param {DeviceOrientationEvent} e - Device orientation event
   */
  handleDeviceOrientation(e) {
    this.viewModel.px = (e.gamma || 0) / 45;
    this.viewModel.py = (e.beta || 0) / 90;
    this.log(e);
  }

  /**
   * Handle device motion for shake detection
   * @param {DeviceMotionEvent} e - Device motion event
   */
  handleDeviceMotion(e) {
    this.log(e);
    const a = e.accelerationIncludingGravity || e.acceleration;
    if (a) {
      const mag = Math.hypot(a.x, a.y, a.z);
      if (mag > 25) {
        for (let i = 0; i < 20; i++) this.spawnPetal();
      }
    }
  }

  /**
   * Handle touch start event
   * @param {TouchEvent} e - Touch start event
   */
  handleTouchStart(e) {
    const t = e.touches[0];
    this.viewModel.dragStart = { 
      x: t.clientX, 
      y: t.clientY, 
      t: Date.now() 
    };
    this.log(e);
  }

  /**
   * Handle touch move event
   * @param {TouchEvent} e - Touch move event
   */
  handleTouchMove(e) {
    const t = e.touches[0];
    this.viewModel.dragX = t.clientX;
    this.viewModel.dragY = t.clientY;
    this.log(e);
  }

  /**
   * Handle touch end event
   * @param {TouchEvent} e - Touch end event
   */
  handleTouchEnd(e) {
    this.log(e);
    if (this.viewModel.dragStart) {
      const dt = Date.now() - this.viewModel.dragStart.t || 1;
      const vx = (this.viewModel.dragX - this.viewModel.dragStart.x) / dt * 10;
      const vy = (this.viewModel.dragY - this.viewModel.dragStart.y) / dt * 10;
      
      this.viewModel.flings.push({ 
        x: this.viewModel.dragStart.x, 
        y: this.viewModel.dragStart.y, 
        vx, 
        vy, 
        trail: [] 
      });
      
      this.viewModel.dragStart = null;
    }
  }

  /**
   * Create a new falling petal
   */
  spawnPetal() {
    this.viewModel.petals.push({
      x: Math.random() * this.canvas.width,
      y: -10,
      vy: Math.random() + 0.5,
      r: Math.random() * 3 + 2
    });
  }

  /**
   * Generate an L-system vine
   * @param {string} axiom - Starting axiom
   * @param {string} rule - Replacement rule
   * @param {number} iterations - Number of iterations
   */
  generateVine(axiom, rule, iterations) {
    let str = axiom;
    for (let i = 0; i < iterations; i++) {
      str = str.split('').map(c => c === 'F' ? rule : c).join('');
    }
    this.viewModel.vineCommands = str;
    logger.debug(`Vine generated with ${str.length} commands`, 'generateVine');
  }

  /**
   * Draw the L-system vine
   */
  drawVine() {
    const stack = [];
    let x = this.canvas.width * 0.1;
    let y = this.canvas.height * 0.9;
    let ang = -Math.PI/2;
    
    this.ctx.strokeStyle = 'lime';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    
    for (const c of this.viewModel.vineCommands) {
      if (c === 'F') {
        x += Math.cos(ang) * 10;
        y += Math.sin(ang) * 10;
        this.ctx.lineTo(x, y);
      } else if (c === '+') {
        ang += Math.PI/6;
      } else if (c === '-') {
        ang -= Math.PI/6;
      } else if (c === '[') {
        stack.push({ x, y, ang });
      } else if (c === ']') {
        const p = stack.pop();
        x = p.x; y = p.y; ang = p.ang;
        this.ctx.moveTo(x, y);
      }
    }
    
    this.ctx.stroke();
  }

  /**
   * Set up audio analysis if available
   */
  setupAudio() {
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const src = audioCtx.createMediaStreamSource(stream);
          this.viewModel.analyser = audioCtx.createAnalyser();
          src.connect(this.viewModel.analyser);
          this.viewModel.analyser.fftSize = 64;
          this.viewModel.dataArr = new Uint8Array(this.viewModel.analyser.frequencyBinCount);
          logger.info('Audio analysis initialized', 'setupAudio');
        })
        .catch(error => {
          logger.warn(`Audio initialization failed: ${error}`, 'setupAudio');
        });
    }
  }

  /**
   * Set up voice recognition if available
   */
  setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.viewModel.recognition = new webkitSpeechRecognition();
      this.viewModel.recognition.continuous = true;
      this.viewModel.recognition.onresult = e => {
        const transcript = e.results[e.results.length-1][0].transcript.toLowerCase();
        logger.info(`Speech recognized: ${transcript}`, 'setupVoiceRecognition');
        
        this.log({ type: 'speech', transcript });
        
        if (transcript.includes('vine')) {
          this.generateVine('F', 'F[+F]F[-F]F', 4);
        }
        
        if (transcript.includes('petal')) {
          for (let i = 0; i < 50; i++) this.spawnPetal();
        }
        
        if (transcript.includes('flash')) {
          this.viewModel.flashTimer = 10;
        }
      };
      
      this.viewModel.recognition.start();
      logger.info('Voice recognition initialized', 'setupVoiceRecognition');
    }
  }

  /**
   * Main animation update loop
   * @param {number} now - Current timestamp
   */
  update(now) {
    const dt = now - this.lastTime;
    this.lastTime = now;
    this.viewModel.fps = Math.round(1000 / dt);
    this.fpsEl.textContent = 'FPS: ' + this.viewModel.fps;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Parallax background
    this.ctx.save();
    this.ctx.translate(this.viewModel.px * 30, this.viewModel.py * 30);
    const grd = this.ctx.createRadialGradient(
      this.canvas.width/2, this.canvas.height/2, 100,
      this.canvas.width/2, this.canvas.height/2, this.canvas.width
    );
    grd.addColorStop(0, '#002');
    grd.addColorStop(1, '#220');
    this.ctx.fillStyle = grd;
    this.ctx.fillRect(
      -this.viewModel.px * 50,
      -this.viewModel.py * 50,
      this.canvas.width + this.viewModel.px * 100,
      this.canvas.height + this.viewModel.py * 100
    );
    this.ctx.restore();

    // Dynamic shader overlay
    const hue = (now / 50) % 360;
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'overlay';
    this.ctx.fillStyle = `hsla(${hue},100%,50%,0.02)`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    // Petals
    if (Math.random() < 0.05) this.spawnPetal();
    this.viewModel.petals.forEach(p => {
      p.y += p.vy;
      this.ctx.fillStyle = 'rgba(255,182,193,0.7)';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      this.ctx.fill();
    });
    this.viewModel.petals = this.viewModel.petals.filter(p => p.y < this.canvas.height + 10);

    // Flings & trails
    this.viewModel.flings.forEach((obj, i) => {
      obj.vy += 0.5;
      obj.x += obj.vx;
      obj.y += obj.vy;
      obj.trail.push({ x: obj.x, y: obj.y });
      
      this.ctx.beginPath();
      obj.trail.slice(-10).forEach((pt, j) => {
        this.ctx.globalAlpha = j / 10;
        this.ctx.lineTo(pt.x, pt.y);
      });
      this.ctx.strokeStyle = 'white';
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
      
      this.ctx.beginPath();
      this.ctx.fillStyle = 'white';
      this.ctx.arc(obj.x, obj.y, 5, 0, 2 * Math.PI);
      this.ctx.fill();
    });
    this.viewModel.flings = this.viewModel.flings.filter(o => o.y < this.canvas.height + 50);

    // Audio-reactive bloom
    if (this.viewModel.analyser) {
      this.viewModel.analyser.getByteFrequencyData(this.viewModel.dataArr);
      const avg = this.viewModel.dataArr.reduce((sum, v) => sum + v, 0) / this.viewModel.dataArr.length;
      
      this.ctx.save();
      this.ctx.globalAlpha = avg / 255 * 0.5;
      this.ctx.beginPath();
      this.ctx.arc(this.canvas.width/2, this.canvas.height/2, avg, 0, 2 * Math.PI);
      this.ctx.fillStyle = 'cyan';
      this.ctx.fill();
      this.ctx.restore();
    }

    // Voice-triggered flash
    if (this.viewModel.flashTimer > 0) {
      this.ctx.save();
      this.ctx.globalAlpha = this.viewModel.flashTimer / 10;
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
      this.viewModel.flashTimer--;
    }

    // Draw vine
    this.drawVine();

    requestAnimationFrame(this.update.bind(this));
  }
}

// Register the custom element
if (!customElements.get('stars-motion-scene')) {
  customElements.define('stars-motion-scene', class extends HTMLElement {
    connectedCallback() {
      // Create a new scene when the element is added to the DOM
      this.classList.add('dreamscape-container');
      this.scene = new StarsMotionScene(this, {
        debug: window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               new URLSearchParams(window.location.search).get('debug') === 'true'
      });
    }
    
    disconnectedCallback() {
      // Clean up when element is removed
      if (this.scene.viewModel.recognition) {
        this.scene.viewModel.recognition.stop();
      }
    }
  });
}