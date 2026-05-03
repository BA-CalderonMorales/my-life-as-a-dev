import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.rocks = [];
        this.lights = [];

        this.init();
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050502);
        this.scene.fog = new THREE.FogExp2(0x050502, 0.03);

        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 80);
        this.camera.position.set(0, 2, 12);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(0x112211, 0.3));

        const caveGeo = new THREE.SphereGeometry(25, 32, 32);
        const caveMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.8,
            roughness: 0.6,
            side: THREE.BackSide,
        });
        this.scene.add(new THREE.Mesh(caveGeo, caveMat));
    }

    createLights(count) {
        for (let i = 0; i < count; i++) {
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
    }

    createRocks(count) {
        for (let i = 0; i < count; i++) {
            const radius = 0.4 + Math.random() * 0.8;
            const geo = new THREE.DodecahedronGeometry(radius, 0);

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
                emissiveIntensity: 1.0,
                metalness: 0.4,
                roughness: 0.7,
            });
            const rock = new THREE.Mesh(geo, mat);

            const angle = Math.random() * Math.PI * 2;
            const dist = 1.5 + Math.random() * 5;
            rock.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 5, Math.sin(angle) * dist);
            rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

            rock.userData = {
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
