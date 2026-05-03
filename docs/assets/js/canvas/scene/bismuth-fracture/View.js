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
        this.scene.background = new THREE.Color(0x080808);
        this.scene.fog = new THREE.FogExp2(0x080808, 0.025);

        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        this.camera.position.set(0, 5, 14);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.container.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(0x333333, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);
    }

    createStacks(stackCount, stepsMin, stepsMax) {
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const boxMat = new THREE.MeshStandardMaterial({
            metalness: 0.8,
            roughness: 0.2,
        });

        // Calculate total instances
        let totalInstances = 0;
        const stackConfigs = [];
        for (let s = 0; s < stackCount; s++) {
            const steps = stepsMin + Math.floor(Math.random() * (stepsMax - stepsMin + 1));
            const baseSize = 1.2 + Math.random() * 1.0;
            const stackHue = (s / stackCount) % 1.0;
            const angle = (s / stackCount) * Math.PI * 2 + Math.random() * 0.5;
            const dist = 2 + Math.random() * 6;
            const rotSpeed = (Math.random() - 0.5) * 0.004;
            
            stackConfigs.push({ steps, baseSize, stackHue, angle, dist, rotSpeed, currentRot: Math.random() * Math.PI * 2 });
            totalInstances += steps;
        }

        this.instancedMesh = new THREE.InstancedMesh(boxGeo, boxMat, totalInstances);
        this.scene.add(this.instancedMesh);
        return stackConfigs;
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
