/**
 * Radioactive Slag Scene
 *
 * Glowing green toxic crystals with aggressively pulsing emissive intensity.
 * Irregular rock shapes inside dark metallic cave walls with flickering lights.
 */
import * as THREE from 'three';

export class RadioactiveSlagScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isDestroyed = false;
        this.createdContainer = false;
        this.clock = new THREE.Clock();

        this.rocks = [];
        this.lights = [];
        this._boundUpdatePosition = this._updateCanvasPosition.bind(this);
        this._boundResize = this._onResize.bind(this);
    }

    async init() {
        this.container = document.getElementById(this.containerId);
        this.isEmbedded = Boolean(this.container);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
            this.createdContainer = true;
        }
        this._updateCanvasPosition();
        window.addEventListener('resize', this._boundResize);
        window.addEventListener('scroll', this._boundUpdatePosition);

        const isMobile = window.innerWidth < 768;
        const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050502);
        this.scene.fog = new THREE.FogExp2(0x050502, 0.03);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            80
        );
        this.camera.position.set(0, 2, 12);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: !isMobile,
            alpha: false,
            powerPreference: isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        // Ambient
        const ambient = new THREE.AmbientLight(0x112211, 0.3);
        this.scene.add(ambient);

        // Dark metallic cave walls (large sphere)
        const caveGeo = new THREE.SphereGeometry(25, 32, 32);
        const caveMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.8,
            roughness: 0.6,
            side: THREE.BackSide,
        });
        const cave = new THREE.Mesh(caveGeo, caveMat);
        this.scene.add(cave);

        // Flickering green point lights
        const lightCount = isMobile ? 4 : 7;
        for (let i = 0; i < lightCount; i++) {
            const pl = new THREE.PointLight(0x33ff33, 2, 12);
            const angle = Math.random() * Math.PI * 2;
            const dist = 4 + Math.random() * 6;
            pl.position.set(
                Math.cos(angle) * dist,
                (Math.random() - 0.5) * 6,
                Math.sin(angle) * dist
            );
            pl.userData = {
                flickerSpeed: 5 + Math.random() * 10,
                flickerOffset: Math.random() * Math.PI * 2,
                baseIntensity: 1.5 + Math.random(),
            };
            this.scene.add(pl);
            this.lights.push(pl);
        }

        // Irregular rock-like shapes
        const rockCount = isMobile ? 10 : 20;
        for (let i = 0; i < rockCount; i++) {
            const radius = 0.4 + Math.random() * 0.8;
            const geo = new THREE.DodecahedronGeometry(radius, 0);

            // Randomize vertices for irregular look
            const posAttr = geo.attributes.position;
            for (let v = 0; v < posAttr.count; v++) {
                const x = posAttr.getX(v);
                const y = posAttr.getY(v);
                const z = posAttr.getZ(v);
                posAttr.setXYZ(
                    v,
                    x + (Math.random() - 0.5) * radius * 0.4,
                    y + (Math.random() - 0.5) * radius * 0.4,
                    z + (Math.random() - 0.5) * radius * 0.4
                );
            }
            geo.computeVertexNormals();

            const mat = new THREE.MeshStandardMaterial({
                color: 0x1a331a,
                emissive: 0x33ff33,
                emissiveIntensity: 1.0 + Math.random() * 2.0,
                metalness: 0.4,
                roughness: 0.7,
            });
            const rock = new THREE.Mesh(geo, mat);

            const angle = Math.random() * Math.PI * 2;
            const dist = 1.5 + Math.random() * 5;
            rock.position.set(
                Math.cos(angle) * dist,
                (Math.random() - 0.5) * 5,
                Math.sin(angle) * dist
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            rock.userData = {
                baseEmissive: mat.emissiveIntensity,
                pulseSpeed: 2.0 + Math.random() * 4.0,
                pulseOffset: Math.random() * Math.PI * 2,
                rotSpeed: {
                    x: (Math.random() - 0.5) * 0.5,
                    y: (Math.random() - 0.5) * 0.5,
                },
            };

            this.scene.add(rock);
            this.rocks.push(rock);
        }

        // Start animation loop
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();

            // Camera orbit
            const radius = 12;
            this.camera.position.x = Math.sin(elapsed * 0.09) * radius;
            this.camera.position.z = Math.cos(elapsed * 0.09) * radius;
            this.camera.lookAt(0, 0, 0);

            // Aggressively pulse rocks (1.0 to 5.0 over ~0.5s)
            this.rocks.forEach((rock) => {
                const ud = rock.userData;
                const pulse = Math.sin(elapsed * ud.pulseSpeed + ud.pulseOffset);
                // Map pulse from [-1, 1] to [1.0, 5.0]
                rock.material.emissiveIntensity = 3.0 + pulse * 2.0;

                rock.rotation.x += ud.rotSpeed.x * 0.01;
                rock.rotation.y += ud.rotSpeed.y * 0.01;
            });

            // Flicker lights
            this.lights.forEach((light) => {
                const ud = light.userData;
                const flicker = Math.sin(elapsed * ud.flickerSpeed + ud.flickerOffset);
                light.intensity = ud.baseIntensity + flicker * 0.8;
            });

            this.renderer.render(this.scene, this.camera);
        };
        animate();

        return true;
    }

    _updateCanvasPosition() {
        if (this.isEmbedded) {
            this.container.style.top = '';
            this.container.style.height = '';
            return;
        }
        const header = document.querySelector('.md-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const viewportHeight = Math.max(window.innerHeight - headerHeight, 0);
        document.documentElement.style.setProperty('--canvas-header-offset', `${headerHeight}px`);
        this.container.style.top = headerHeight + 'px';
        this.container.style.height = viewportHeight + 'px';
    }

    _onResize() {
        this._updateCanvasPosition();
        if (!this.camera || !this.renderer || !this.container) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (!width || !height) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    destroy() {
        this.isDestroyed = true;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this._boundResize);
        window.removeEventListener('scroll', this._boundUpdatePosition);

        this.rocks.forEach((r) => {
            if (r.geometry) r.geometry.dispose();
            if (r.material) r.material.dispose();
        });
        this.lights.forEach((l) => {
            if (l.parent) l.parent.remove(l);
        });

        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
        }
        if (this.createdContainer && this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
