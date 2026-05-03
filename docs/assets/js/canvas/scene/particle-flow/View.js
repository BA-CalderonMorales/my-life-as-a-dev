import * as THREE from 'three';

export class View {
    constructor(container, colors, isMobile) {
        this.container = container;
        this.colors = colors;
        this.isMobile = isMobile;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.colors.background);
        this.scene.fog = new THREE.FogExp2(this.colors.background, 0.015);

        const fov = this.isMobile ? 60 : 50;
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
        this.camera.position.set(0, 0, 18);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.container.appendChild(this.renderer.domElement);
    }

    createParticles(count, size) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colorBuffer = new Float32Array(count * 3);

        const particleColor = new THREE.Color(this.colors.particle);
        const accentColor = new THREE.Color(this.colors.accent);

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            positions[idx] = (Math.random() - 0.5) * 32;
            positions[idx + 1] = (Math.random() - 0.5) * 18;
            positions[idx + 2] = (Math.random() - 0.5) * 8;

            const mix = 0.12 + Math.random() * 0.28;
            const color = particleColor.clone().lerp(accentColor, mix);
            colorBuffer[idx] = color.r;
            colorBuffer[idx + 1] = color.g;
            colorBuffer[idx + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colorBuffer, 3));

        const material = new THREE.PointsMaterial({
            size: size,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.86,
            depthWrite: false,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        return {
            positions: geometry.attributes.position.array,
            colors: geometry.attributes.color.array
        };
    }

    updateTheme(colors) {
        this.colors = colors;
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.background);
    }

    onResize() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.renderer.dispose();
        this.scene.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        });
    }
}
