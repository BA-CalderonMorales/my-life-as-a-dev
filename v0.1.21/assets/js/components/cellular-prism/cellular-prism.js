// Cellular Prism Component - Colorful cellular automaton visualization
class CellularPrism extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <canvas id="canvas" aria-label="Cellular Prism Visualization"></canvas>
      <div id="controls">
        <span id="fps">FPS: --</span>
      </div>
    `;
    
    // Initialize component
    this.initializeComponent();
  }
  
  initializeComponent() {
    const canvas = this.querySelector('#canvas');
    const ctx = canvas.getContext('2d');
    const fpsEl = this.querySelector('#fps');
    
    // Set up canvas dimensions
    const resizeCanvas = () => {
      canvas.width = this.clientWidth || window.innerWidth;
      canvas.height = this.clientHeight || window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Cellular automaton state variables
    const width = canvas.width;
    const height = canvas.height;
    const cellSize = 5;
    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);
    
    // Create grid arrays
    let grid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));
    let nextGrid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));
    
    // Initialize with random cells
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i][j] = Math.random() > 0.8 ? 1 : 0;
      }
    }
    
    // Color palette for cells
    const colors = [
      '#ff0066', // pink
      '#00ccff', // blue
      '#ffcc00', // yellow
      '#33cc33', // green
      '#cc33ff'  // purple
    ];
    
    // Count neighbors function
    const countNeighbors = (grid, x, y) => {
      let sum = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const col = (x + i + cols) % cols;
          const row = (y + j + rows) % rows;
          sum += grid[col][row];
        }
      }
      sum -= grid[x][y]; // Don't count the cell itself
      return sum;
    };
    
    // Update function - Conway's Game of Life rules with color variations
    const updateGrid = () => {
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const state = grid[i][j];
          const neighbors = countNeighbors(grid, i, j);
          
          // Apply Conway's Game of Life rules with modifications
          if (state === 0 && neighbors === 3) {
            nextGrid[i][j] = 1; // Birth
          } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
            nextGrid[i][j] = 0; // Death
          } else {
            nextGrid[i][j] = state; // Stasis
          }
        }
      }
      
      // Swap grids
      [grid, nextGrid] = [nextGrid, grid];
    };
    
    // Draw function
    const draw = () => {
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, width, height);
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (grid[i][j] === 1) {
            // Use neighbors count for color variety
            const neighbors = countNeighbors(grid, i, j);
            const colorIndex = neighbors % colors.length;
            ctx.fillStyle = colors[colorIndex];
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
          }
        }
      }
    };
    
    // Interaction - add cells on click/touch
    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / cellSize);
      const y = Math.floor((event.clientY - rect.top) / cellSize);
      
      // Create a "glider" pattern at the clicked position
      if (x > 0 && y > 0 && x < cols - 2 && y < rows - 2) {
        grid[x][y] = 0;
        grid[x+1][y] = 1;
        grid[x+2][y] = 0;
        grid[x][y+1] = 0;
        grid[x+1][y+1] = 0;
        grid[x+2][y+1] = 1;
        grid[x][y+2] = 1;
        grid[x+1][y+2] = 1;
        grid[x+2][y+2] = 1;
      }
    });
    
    // Animation loop
    let lastTime = performance.now();
    let frameCount = 0;
    
    const animate = () => {
      const now = performance.now();
      const delta = now - lastTime;
      
      // Update FPS counter every second
      frameCount++;
      if (delta > 1000) {
        fpsEl.textContent = `FPS: ${Math.round(frameCount * 1000 / delta)}`;
        frameCount = 0;
        lastTime = now;
      }
      
      updateGrid();
      draw();
      
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    if (window.DEBUG_CELLULAR_PRISM) {
      console.log('Cellular Prism initialized with', cols, 'columns and', rows, 'rows');
    }
  }
}

// Register the custom element
customElements.define('cellular-prism', CellularPrism);

// Export the component
export default CellularPrism;
