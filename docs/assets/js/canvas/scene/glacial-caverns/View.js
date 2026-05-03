import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.instancedMesh = null;

        this.init();
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000818);
        this.scene.fog = new THREE.FogExp2(0x000818, 0.02);

        this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 80);
        this.camera.position.set(0, 2, 14);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(0x223344, 0.5));
    }

    createCavern(lightPositions, blockCount, iceColors) {
        lightPositions.forEach((pos) => {
            const pl = new THREE.PointLight(0x44aaff, 3, 18);
            pl.position.set(...pos);
            this.scene.add(pl);
        });

        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const boxMat = new THREE.MeshPhysicalMaterial({
            transmission: 0.6,
            thickness: 2.0,
            ior: 1.31,
            roughness: 0.15,
            metalness: 0.0,
            transparent: true,
            opacity: 0.85,
        });

        this.instancedMesh = new THREE.InstancedMesh(boxGeo, boxMat, blockCount);
        this.scene.add(this.instancedMesh);

        const blockConfigs = [];
        const color = new THREE.Color();
        for (let i = 0; i < blockCount; i++) {
            const scale = {
                x: 0.6 + Math.random() * 1.4,
                y: 0.6 + Math.random() * 1.4,
                z: 0.6 + Math.random() * 1.4,
            };
            const angle = Math.random() * Math.PI * 2;
            const dist = 2 + Math.random() * 8;
            const initialPos = new THREE.Vector3(
                Math.cos(angle) * dist,
                (Math.random() - 0.5) * 6,
                Math.sin(angle) * dist
            );
            const rot = new THREE.Euler(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            const rotSpeed = {
                x: (Math.random() - 0.5) * 0.3,
                y: (Math.random() - 0.5) * 0.3,
                z: (Math.random() - 0.5) * 0.3,
            };
            
            color.setHex(iceColors[Math.floor(Math.random() * iceColors.length)]);
            this.instancedMesh.setColorAt(i, color);

            blockConfigs.push({ scale, initialPos, rot, rotSpeed });
        }
        
        return blockConfigs;
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
