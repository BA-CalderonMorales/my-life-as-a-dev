
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rick's Living Artifact</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background: black;
        }
        canvas {
            display: block;
        }
    </style>
</head>
<body>
    <canvas id="artifactCanvas"></canvas>
    <script>
        const canvas = document.getElementById('artifactCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Cellular Automata Variables
        const cols = Math.floor(canvas.width / 10);
        const rows = Math.floor(canvas.height / 10);
        let grid = Array.from({ length: rows }, () => Array(cols).fill(0));
        let nextGrid = Array.from({ length: rows }, () => Array(cols).fill(0));

        // Random Initialization
        function randomizeGrid() {
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    grid[y][x] = Math.random() > 0.8 ? 1 : 0;
                }
            }
        }

        // Draw Grid
        function drawGrid() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    ctx.fillStyle = grid[y][x] ? 'hsl(' + (Math.random() * 360) + ', 100%, 50%)' : 'black';
                    ctx.fillRect(x * 10, y * 10, 10, 10);
                }
            }
        }

        // Cellular Automata Rules
        function updateGrid() {
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    let neighbors = countNeighbors(y, x);
                    nextGrid[y][x] = grid[y][x] ? (neighbors === 2 || neighbors === 3) : neighbors === 3;
                }
            }
            [grid, nextGrid] = [nextGrid, grid];
        }

        function countNeighbors(y, x) {
            let count = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    const row = (y + i + rows) % rows;
                    const col = (x + j + cols) % cols;
                    count += grid[row][col];
                }
            }
            return count;
        }

        // Evolving Behavior
        canvas.addEventListener('click', () => {
            randomizeGrid();
        });

        canvas.addEventListener('mousemove', (e) => {
            const x = Math.floor(e.clientX / 10);
            const y = Math.floor(e.clientY / 10);
            grid[y][x] = 1;
        });

        // Animation Loop
        function animate() {
            drawGrid();
            updateGrid();
            requestAnimationFrame(animate);
        }

        randomizeGrid();
        animate();
    </script>
</body>
</html>
