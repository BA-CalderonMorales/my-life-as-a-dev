import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.geodeGroup = null;
        this.core = null;
        this.crystals = [];
        this.lights = [];
        this.sparkles = null;

        this.init();
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x04030a);
        this.scene.fog = new THREE.FogExp2(0x04030a, 0.028);

        this.camera = new THREE.PerspectiveCamera(this.isMobile ? 58 : 50, width / height, 0.1, 100);
        this.camera.position.set(0, 3.2, this.isMobile ? 11 : 10.5);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance',
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.35 : 1.75));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.35;
        this.container.appendChild(this.renderer.domElement);
    }

    createEnvironment(lightConfigs) {
        const floor = new THREE.Mesh(
            new THREE.CircleGeometry(18, 96),
            new THREE.MeshStandardMaterial({
                color: 0x08070d,
                metalness: 0.82,
                roughness: 0.16,
                emissive: 0x130018,
                emissiveIntensity: 0.22,
            })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        this.scene.add(floor);

        this.scene.add(new THREE.HemisphereLight(0x252570, 0x030308, 0.72));
        this.scene.add(new THREE.AmbientLight(0x15142a, 0.46));

        lightConfigs.forEach((config) => {
            const light = new THREE.PointLight(config.color, config.intensity, 13);
            light.position.set(...config.position);
            this.scene.add(light);
            this.lights.push(light);
        });
    }

    createGeode(crystalCount, palette) {
        this.geodeGroup = new THREE.Group();
        this.scene.add(this.geodeGroup);

        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0xb7ffff,
            emissive: 0x00f6ff,
            emissiveIntensity: 1.6,
            metalness: 0.12,
            roughness: 0.18,
            transparent: true,
            opacity: 0.88,
        });
        this.core = new THREE.Mesh(new THREE.IcosahedronGeometry(this.isMobile ? 0.82 : 1.08, 2), coreMaterial);
        this.core.position.set(0, -0.55, 0);
        this.geodeGroup.add(this.core);

        const crystalGeo = new THREE.ConeGeometry(1, 1, 5); // Base unit geometry

        for (let i = 0; i < crystalCount; i++) {
            const color = palette[i % palette.length];
            const spread = i / Math.max(crystalCount - 1, 1);
            const angle = spread * Math.PI * 8 + Math.sin(i * 12.9898) * 0.28;
            const dist = 0.8 + Math.pow(spread, 0.7) * (this.isMobile ? 4.2 : 5.4);
            const height = (i < 5 ? 2.3 : 1.15) + (Math.sin(i * 78.233) * 0.5 + 0.5) * 2.35;
            const radius = 0.18 + (Math.sin(i * 31.719) * 0.5 + 0.5) * 0.32;

            const crystal = new THREE.Mesh(
                crystalGeo,
                new THREE.MeshStandardMaterial({
                    color,
                    emissive: color,
                    emissiveIntensity: 1.05 + (i % 5) * 0.12,
                    metalness: 0.22,
                    roughness: 0.16,
                })
            );

            crystal.scale.set(radius, height, radius);
            crystal.position.set(Math.cos(angle) * dist, -2 + height / 2, Math.sin(angle) * dist);
            crystal.rotation.set(Math.sin(angle) * 0.22, angle, Math.cos(angle) * 0.24);
            
            crystal.userData = {
                baseEmissive: crystal.material.emissiveIntensity,
                pulseSpeed: 0.75 + (i % 7) * 0.18,
                pulseOffset: i * 0.71,
            };

            this.geodeGroup.add(crystal);
            this.crystals.push(crystal);
        }
    }

    createSparkles(count, palette) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = 1.2 + Math.random() * 7.2;
            const color = new THREE.Color(palette[i % palette.length]);

            positions[idx] = Math.cos(angle) * radius;
            positions[idx + 1] = -1.45 + Math.random() * 5.8;
            positions[idx + 2] = Math.sin(angle) * radius;
            colors[idx] = color.r;
            colors[idx + 1] = color.g;
            colors[idx + 2] = color.b;
            
            velocities[idx] = (Math.random() - 0.5) * 0.0025;
            velocities[idx + 1] = 0.003 + Math.random() * 0.006;
            velocities[idx + 2] = (Math.random() - 0.5) * 0.0025;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.sparkles = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                size: this.isMobile ? 0.06 : 0.045,
                vertexColors: true,
                transparent: true,
                opacity: 0.86,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                sizeAttenuation: true,
            })
        );
        this.scene.add(this.sparkles);
        return velocities;
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
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
