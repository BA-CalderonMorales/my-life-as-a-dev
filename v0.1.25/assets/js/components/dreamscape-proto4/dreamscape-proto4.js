/**
 * Dreamscape Prototype 4 Component
 * 
 * An interactive canvas-based visualization featuring particle effects,
 * motion gestures, and voice recognition.
 */

// Try to import the logger and interactivity utils, but provide fallbacks in case it fails
let logger;
let interactivityUtils;

try {
  const module = await import('../../custom/logger.js').catch(() => 
    import('/assets/js/custom/logger.js')
  );
  logger = module.defaultLogger;
  
  // Import interactivity utilities
  interactivityUtils = await import('../../custom/interactivity-utils.js').catch(() => 
    import('/assets/js/custom/interactivity-utils.js')
  );
} catch (err) {
  // Fallback logger if import fails
  logger = {
    setModule: () => {},
    enableLogs: () => {},
    setLogLevel: () => {},
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  };
  
  // Fallback empty interactivity utils
  interactivityUtils = {
    makeCanvasInteractive: () => ({ cleanup: () => {} }),
    enhanceSceneInteractivity: () => null
  };
}

export class DreamscapeProto4 {
  /**
   * Create a new DreamscapeProto4
   * @param {HTMLElement} container - The container element to render in
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = Object.assign({
      debug: false,
      enableVoice: true
    }, options);

    // Set up logger
    logger.setModule('dreamscape-proto4');

    if (this.options.debug) {
      logger.enableLogs();
      logger.setLogLevel('debug');
    }

    // Initialize the view model
    this.viewModel = {
      lastTap: 0, 
      tapCount: 0, 
      scale: 1, 
      pinchDist: 0,
      drag: null, 
      dx: 0, 
      dy: 0, 
      msgTimer: 0,
      petals: [], 
      bursts: [], 
      flings: [],
      recognition: null,
      fps: 0,
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
      <div id="message" class="dreamscape-message" aria-live="polite"></div>
    `;

    // Get references to DOM elements
    this.canvas = this.container.querySelector('#canvas');
    this.ctx = this.canvas.getContext('2d');
    this.fpsEl = this.container.querySelector('#fps');
    this.msgEl = this.container.querySelector('#message');

    // Set up event listeners
    this.setupEventListeners();

    // Set up voice recognition if enabled
    if (this.options.enableVoice) {
      this.setupVoiceRecognition();
    }

    // Start animation loop
    this.lastTime = performance.now();
    this.update(this.lastTime);

    // Resize the canvas to fit the container
    this.resize();

    logger.info('DreamscapeProto4 initialized', 'initialize');
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

    // Double-tap → radial burst
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

    // Pinch-to-zoom
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });

    // Fling physics
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    
    // Prevent scroll events on canvas
    const scrollEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel', 'DOMMouseScroll'];
    scrollEvents.forEach(eventName => {
      this.canvas.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
    });
    
    // Apply interactivity utils if available
    if (interactivityUtils && interactivityUtils.makeCanvasInteractive) {
      this.interactivityCleanup = interactivityUtils.makeCanvasInteractive(this.container, this.canvas);
    }
    
    // Additional input logging
    ['touchstart','touchmove','touchend','mousedown','mousemove','mouseup','orientationchange']
      .forEach(evt => window.addEventListener(evt, this.log.bind(this)));

    // Send logs on page unload
    window.addEventListener('beforeunload', () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/log', JSON.stringify(this.viewModel.logs));
      }
      
      // Clean up interactivity handlers if they exist
      if (this.interactivityCleanup) {
        this.interactivityCleanup.cleanup();
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
   * Create a radial burst of particles
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  spawnRadial(x, y) {
    for(let a = 0; a < 16; a++) {
      const ang = 2 * Math.PI * (a / 16);
      this.viewModel.bursts.push({ 
        x, 
        y, 
        vx: Math.cos(ang) * 3, 
        vy: Math.sin(ang) * 3, 
        life: 60 
      });
    }
  }

  /**
   * Handle touch end events
   * @param {TouchEvent} e - Touch end event
   */
  handleTouchEnd(e) {
    this.log(e);
    
    // Handle double tap
    const now = Date.now();
    if (now - this.viewModel.lastTap < 300) {
      const t = e.changedTouches[0];
      this.spawnRadial(t.clientX, t.clientY);
    }
    this.viewModel.lastTap = now;

    // Handle fling
    if (this.viewModel.drag) {
      const dt = Date.now() - this.viewModel.drag.t || 1;
      const vx = (this.viewModel.dx - this.viewModel.drag.x) / dt * 10;
      const vy = (this.viewModel.dy - this.viewModel.drag.y) / dt * 10;
      
      this.viewModel.flings.push({ 
        x: this.viewModel.drag.x, 
        y: this.viewModel.drag.y, 
        vx, 
        vy, 
        trail: [] 
      });
      
      this.viewModel.drag = null;
    }
  }

  /**
   * Handle touch start events
   * @param {TouchEvent} e - Touch start event
   */
  handleTouchStart(e) {
    this.log(e);
    
    // Handle pinch gesture
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.viewModel.pinchDist = Math.hypot(dx, dy);
    }

    // Handle drag/fling start
    const t = e.touches[0];
    this.viewModel.drag = { 
      x: t.clientX, 
      y: t.clientY, 
      t: Date.now() 
    };
  }

  /**
   * Handle touch move events
   * @param {TouchEvent} e - Touch move event
   */
  handleTouchMove(e) {
    this.log(e);
    
    // Handle pinch gesture
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d  = Math.hypot(dx, dy);
      this.viewModel.scale *= d / this.viewModel.pinchDist;
      this.viewModel.pinchDist = d;
      this.viewModel.scale = Math.min(Math.max(this.viewModel.scale, 0.5), 3);
    }

    // Update drag position
    const t = e.touches[0];
    this.viewModel.dx = t.clientX;
    this.viewModel.dy = t.clientY;
  }

  /**
   * Set up voice recognition if available
   */
  setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.viewModel.recognition = new webkitSpeechRecognition();
      this.viewModel.recognition.continuous = true;
      this.viewModel.recognition.onresult = e => {
        const txt = e.results[e.results.length-1][0].transcript.toLowerCase();
        this.log({ type: 'speech', transcript: txt });
        
        this.msgEl.textContent = txt.includes('wubba')
          ? 'Wubba lubba dub dub!'
          : 'You said: ' + txt;
          
        if (txt.includes('wubba')) {
          const u = new SpeechSynthesisUtterance(this.msgEl.textContent);
          speechSynthesis.speak(u);
        }
        
        this.msgEl.style.display = 'block';
        this.viewModel.msgTimer = 120;
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

    this.ctx.save();
    this.ctx.setTransform(this.viewModel.scale, 0, 0, this.viewModel.scale, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background & swirl
    this.ctx.fillStyle = '#112';
    this.ctx.fillRect(
      -this.canvas.width * 0.1, 
      -this.canvas.height * 0.1, 
      this.canvas.width * 1.2, 
      this.canvas.height * 1.2
    );
    
    const hue = (now / 100) % 360;
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.02)`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'source-over';

    // Petals
    if (Math.random() < 0.03) {
      this.viewModel.petals.push({ 
        x: Math.random() * this.canvas.width, 
        y: -10, 
        vy: Math.random() + 0.5, 
        r: Math.random() * 3 + 2 
      });
    }
    
    this.viewModel.petals.forEach((p, i) => {
      p.y += p.vy;
      this.ctx.fillStyle = 'rgba(255, 182, 193, 0.7)';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      this.ctx.fill();
      
      if (p.y > this.canvas.height + 10) {
        this.viewModel.petals.splice(i, 1);
      }
    });

    // Bursts
    this.viewModel.bursts.forEach((b, i) => {
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, 3, 0, 2 * Math.PI);
      this.ctx.fill();
      
      if (b.life <= 0) {
        this.viewModel.bursts.splice(i, 1);
      }
    });

    // Flings & trails
    this.viewModel.flings.forEach((o, i) => {
      o.vy += 0.5;
      o.x += o.vx;
      o.y += o.vy;
      o.trail.push({ x: o.x, y: o.y });
      
      this.ctx.beginPath();
      o.trail.slice(-10).forEach((pt, j) => {
        this.ctx.globalAlpha = j / 10;
        this.ctx.lineTo(pt.x, pt.y);
      });
      
      this.ctx.strokeStyle = 'cyan';
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
      
      this.ctx.beginPath();
      this.ctx.fillStyle = 'cyan';
      this.ctx.arc(o.x, o.y, 5, 0, 2 * Math.PI);
      this.ctx.fill();
      
      if (o.y > this.canvas.height + 50) {
        this.viewModel.flings.splice(i, 1);
      }
    });

    // Hide message
    if (this.viewModel.msgTimer > 0) {
      this.viewModel.msgTimer--;
      if (this.viewModel.msgTimer <= 0) {
        this.msgEl.style.display = 'none';
      }
    }

    this.ctx.restore();
    requestAnimationFrame(this.update.bind(this));
  }
}

// Register the custom element
if (!customElements.get('dreamscape-proto4')) {
  customElements.define('dreamscape-proto4', class extends HTMLElement {
    connectedCallback() {
      // Create a new scene when the element is added to the DOM
      this.classList.add('dreamscape-container');
      this.scene = new DreamscapeProto4(this, {
        debug: window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               new URLSearchParams(window.location.search).get('debug') === 'true'
      });
    }
    
    disconnectedCallback() {
      // Clean up when element is removed
      if (this.scene?.viewModel?.recognition) {
        this.scene.viewModel.recognition.stop();
      }
    }
  });
}