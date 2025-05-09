/**
 * Cellular Prism Component - Colorful cellular automaton visualization
 * 
 * Implements a modified Conway's Game of Life with color variations
 * and interactive elements.
 */

// Try to import the interactivity utils, but provide a fallback in case it fails
let interactivityUtils;

try {
  // Import interactivity utilities
  interactivityUtils = await import('../../custom/interactivity-utils.js').catch(() => 
    import('/assets/js/custom/interactivity-utils.js')
  );
} catch (err) {
  console.warn('Failed to load interactivity utilities:', err);
  // Fallback empty interactivity utils
  interactivityUtils = {
    makeCanvasInteractive: () => ({ cleanup: () => {} }),
    enhanceSceneInteractivity: () => null
  };
}

class CellularPrism extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <canvas id="canvas" aria-label="Cellular Prism Visualization"></canvas>
      <div id="controls">
        <span id="fps">FPS: --</span>
      </div>
    `;
    
    // Get references to DOM elements
    this.container = this;
    this.canvas = this.querySelector('#canvas');
    this.ctx = this.canvas.getContext('2d');
    this.fpsEl = this.querySelector('#fps');
    
    // Cellular automaton config
    this.cellSize = 5;
    this.cols = 0;
    this.rows = 0;
    
    // Color palette for cells
    this.colors = [
      '#ff0066', // pink
      '#00ccff', // blue
      '#ffcc00', // yellow
      '#33cc33', // green
      '#cc33ff'  // purple
    ];
    
    // Performance tracking
    this.frameCount = 0;
    this.lastTime = performance.now();
    
    // Apply interactivity utils if available
    if (interactivityUtils && interactivityUtils.makeCanvasInteractive) {
      this.interactivityCleanup = interactivityUtils.makeCanvasInteractive(this.container, this.canvas);
      console.log('Canvas interactivity applied to Cellular Prism');
    }
    
    // Add resize listener
    this.resizeHandler = () => this.resize();
    window.addEventListener('resize', this.resizeHandler);
    
    // Initialize size and start animation
    this.resize();
    this.setupInteraction();
    this.animate(performance.now());
    
    if (window.DEBUG_CELLULAR_PRISM) {
      console.log('Cellular Prism initialized with', this.cols, 'columns and', this.rows, 'rows');
    }
  }
  
  resize() {
    // Set canvas to full container size
    this.canvas.width = this.clientWidth || window.innerWidth;
    this.canvas.height = this.clientHeight || window.innerHeight;
    
    // Recalculate grid dimensions
    this.cols = Math.floor(this.canvas.width / this.cellSize);
    this.rows = Math.floor(this.canvas.height / this.cellSize);
    
    // Initialize grids
    this.initializeGrids();
  }
  
  initializeGrids() {
    // Create grid arrays
    this.grid = Array(this.cols).fill().map(() => Array(this.rows).fill(0));
    this.nextGrid = Array(this.cols).fill().map(() => Array(this.rows).fill(0));
    
    // Initialize with random cells
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.grid[i][j] = Math.random() > 0.8 ? 1 : 0;
      }
    }
  }
  
  setupInteraction() {
    // Add cells on click/touch
    this.canvas.addEventListener('click', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / this.cellSize);
      const y = Math.floor((event.clientY - rect.top) / this.cellSize);
      
      this.addGlider(x, y);
    });
    
    // Handle touch
    this.canvas.addEventListener('touchstart', (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((touch.clientX - rect.left) / this.cellSize);
        const y = Math.floor((touch.clientY - rect.top) / this.cellSize);
        
        this.addGlider(x, y);
      }
    });
  }
  
  addGlider(x, y) {
    // Create a "glider" pattern at the specified position
    if (x > 0 && y > 0 && x < this.cols - 2 && y < this.rows - 2) {
      this.grid[x][y] = 0;
      this.grid[x+1][y] = 1;
      this.grid[x+2][y] = 0;
      this.grid[x][y+1] = 0;
      this.grid[x+1][y+1] = 0;
      this.grid[x+2][y+1] = 1;
      this.grid[x][y+2] = 1;
      this.grid[x+1][y+2] = 1;
      this.grid[x+2][y+2] = 1;
    }
  }
  
  countNeighbors(x, y) {
    let sum = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const col = (x + i + this.cols) % this.cols;
        const row = (y + j + this.rows) % this.rows;
        sum += this.grid[col][row];
      }
    }
    sum -= this.grid[x][y]; // Don't count the cell itself
    return sum;
  }
  
  updateGrid() {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const state = this.grid[i][j];
        const neighbors = this.countNeighbors(i, j);
        
        // Apply Conway's Game of Life rules with modifications
        if (state === 0 && neighbors === 3) {
          this.nextGrid[i][j] = 1; // Birth
        } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
          this.nextGrid[i][j] = 0; // Death
        } else {
          this.nextGrid[i][j] = state; // Stasis
        }
      }
    }
    
    // Swap grids
    [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
  }
  
  draw() {
    // Clear and set background
    this.ctx.fillStyle = '#121212';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw cells
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        if (this.grid[i][j] === 1) {
          // Use neighbors count for color variety
          const neighbors = this.countNeighbors(i, j);
          const colorIndex = neighbors % this.colors.length;
          this.ctx.fillStyle = this.colors[colorIndex];
          this.ctx.fillRect(
            i * this.cellSize, 
            j * this.cellSize, 
            this.cellSize, 
            this.cellSize
          );
        }
      }
    }
  }
  
  animate(timestamp) {
    // Update FPS counter every second
    this.frameCount++;
    const elapsed = timestamp - this.lastTime;
    
    if (elapsed > 1000) {
      const fps = Math.round((this.frameCount * 1000) / elapsed);
      this.fpsEl.textContent = `FPS: ${fps}`;
      this.frameCount = 0;
      this.lastTime = timestamp;
    }
    
    // Update and draw
    this.updateGrid();
    this.draw();
    
    // Continue animation
    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }
  
  disconnectedCallback() {
    // Clean up event listeners
    window.removeEventListener('resize', this.resizeHandler);
    
    // Clean up animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Clean up interactivity
    if (this.interactivityCleanup) {
      this.interactivityCleanup.cleanup();
    }
  }
}

// Register the custom element
customElements.define('cellular-prism', CellularPrism);

// Export the component
export default CellularPrism;
