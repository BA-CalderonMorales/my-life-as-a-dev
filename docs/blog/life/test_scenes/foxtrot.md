# Foxtrot

----

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rick's AGI Artifact</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background: radial-gradient(circle, #1e1e1e, #000);
        }
        canvas {
            display: block;
        }
    </style>
</head>
<body>
    <canvas id="rickCanvas"></canvas>
    <script>
        const canvas = document.getElementById('rickCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF4500', '#00FF00', '#1E90FF'];

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 5 + 1;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.velocityX = Math.random() * 2 - 1;
                this.velocityY = Math.random() * 2 - 1;
                this.opacity = Math.random();
            }
            update() {
                this.x += this.velocityX;
                this.y += this.velocityY;
                if (this.x < 0 || this.x > canvas.width) this.velocityX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.velocityY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        }

        function init() {
            for (let i = 0; i < 100; i++) {
                particles.push(new Particle());
            }
            animate();
        }

        init();

        // Interaction logic: adapting particle behavior
        canvas.addEventListener('mousemove', (e) => {
            const { offsetX, offsetY } = e;
            particles.forEach((particle) => {
                const dx = offsetX - particle.x;
                const dy = offsetY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    particle.velocityX = dx / 20;
                    particle.velocityY = dy / 20;
                }
            });
        });

        // Adaptive feedback loop
        let userInteractionCount = 0;
        canvas.addEventListener('click', () => {
            userInteractionCount++;
            if (userInteractionCount % 5 === 0) {
                for (let i = 0; i < 10; i++) {
                    particles.push(new Particle());
                }
            }
        });
    </script>
</body>
</html>