/**
 * Neon Geode View - Passive Three.js Stage
 * 
 * ZERO logic. Only handles object instantiation and rendering.
 */
import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Passive refs
        this.geodeGroup = null;
        this.core = null;
        this.crystals = [];
        this.lights = [];
        this.sparkles = null;
    }

    init(colors, perf) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, 0.028);

        this.camera = new THREE.PerspectiveCamera(this.isMobile ? 58 : 50, w / h, 0.1, 100);
        this.camera.position.set(0, 3.2, perf.camDist);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance',
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.35 : 1.75));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.35;
        this.container.appendChild(this.renderer.domElement);

        this._createEnvironment(colors);
    }

    _createEnvironment(colors) {
        const floor = new THREE.Mesh(
            new THREE.CircleGeometry(18, 96),
            new THREE.MeshStandardMaterial({
                color: colors.floor,
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
    }

    addPointLights(configs) {
        configs.forEach((config) => {
            const light = new THREE.PointLight(config.color, config.intensity, 13);
            light.position.set(...config.position);
            this.scene.add(light);
            this.lights.push(light);
        });
    }

    addGeode(coreSize, colors) {
        this.geodeGroup = new THREE.Group();
        this.scene.add(this.geodeGroup);

        this.core = new THREE.Mesh(
            new THREE.IcosahedronGeometry(coreSize, 2),
            new THREE.MeshStandardMaterial({
                color: 0xb7ffff,
                emissive: colors.core,
                emissiveIntensity: 1.6,
                metalness: 0.12,
                roughness: 0.18,
                transparent: true,
                opacity: 0.88,
            })
        );
        this.core.position.set(0, -0.55, 0);
        this.geodeGroup.add(this.core);
    }

    addCrystal(color, emissiveInt) {
        const crystal = new THREE.Mesh(
            new THREE.ConeGeometry(1, 1, 5),
            new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: emissiveInt,
                metalness: 0.22,
                roughness: 0.16,
            })
        );
        this.geodeGroup.add(crystal);
        this.crystals.push(crystal);
        return crystal;
    }

    addSparkles(positions, colors, size) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.sparkles = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                size,
                vertexColors: true,
                transparent: true,
                opacity: 0.86,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                sizeAttenuation: true,
            })
        );
        this.scene.add(this.sparkles);
    }

    onResize() {
        const { clientWidth: w, clientHeight: h } = this.container;
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
        if (this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
    }
}
