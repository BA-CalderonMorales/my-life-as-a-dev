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
        this.scene.background = new THREE.Color(0x111111);
        this.scene.fog = new THREE.FogExp2(0x111111, 0.015);

        this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
        this.camera.position.set(0, 3, 16);

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

        const grid = new THREE.GridHelper(40, 40, 0x222222, 0x222222);
        grid.position.y = -4;
        this.scene.add(grid);

        this.scene.add(new THREE.AmbientLight(0x222222, 0.4));
    }

    createShards(lightColors, lightPositions, count) {
        lightPositions.forEach((pos, i) => {
            const pl = new THREE.PointLight(lightColors[i], 2, 20);
            pl.position.set(...pos);
            this.scene.add(pl);
        });

        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const boxMat = new THREE.MeshPhysicalMaterial({
            color: 0x050505,
            metalness: 1.0,
            roughness: 0.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
        });

        this.instancedMesh = new THREE.InstancedMesh(boxGeo, boxMat, count);
        this.scene.add(this.instancedMesh);

        const shardConfigs = [];
        for (let i = 0; i < count; i++) {
            const scale = {
                w: 0.3 + Math.random() * 0.4,
                h: 3 + Math.random() * 5,
                d: 0.2 + Math.random() * 0.3,
            };
            const angle = Math.random() * Math.PI * 2;
            const dist = 2 + Math.random() * 7;
            const initialPos = new THREE.Vector3(
                Math.cos(angle) * dist,
                (Math.random() - 0.5) * 4,
                Math.sin(angle) * dist
            );
            const rot = new THREE.Euler(
                Math.random() * 0.4,
                Math.random() * Math.PI * 2,
                Math.random() * 0.4
            );
            const rotSpeed = {
                x: (Math.random() - 0.5) * 0.2,
                y: (Math.random() - 0.5) * 0.3,
                z: (Math.random() - 0.5) * 0.2,
            };
            const floatSpeed = 0.3 + Math.random() * 0.7;
            const floatOffset = Math.random() * Math.PI * 2;

            shardConfigs.push({ scale, initialPos, rot, rotSpeed, floatSpeed, floatOffset });
        }
        return shardConfigs;
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
