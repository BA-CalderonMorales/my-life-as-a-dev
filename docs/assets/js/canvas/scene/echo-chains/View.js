import * as THREE from 'three';

export class View {
    constructor(container, colors, isMobile) {
        this.container = container;
        this.colors = colors;
        this.isMobile = isMobile;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.ambientLight = null;

        this.centralForm = null;
        this.nodes = null; // InstancedMesh
        this.connections = [];
        this.ringPool = [];

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.colors.background);
        this.scene.fog = new THREE.FogExp2(this.colors.fogColor, 0.009);

        const fov = this.isMobile ? 60 : 50;
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);

        const camDistance = this.isMobile ? 14 : 20;
        this.camera.position.set(0, 0, camDistance);
        this.camera.userData.baseDistance = camDistance;

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);

        this.ambientLight = new THREE.AmbientLight(this.colors.ambientLight, 0.5);
        this.scene.add(this.ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
        keyLight.position.set(5, 10, 7);
        this.scene.add(keyLight);
    }

    createGeometry(nodeDefinitions, connections) {
        // Central form
        const icoSize = this.isMobile ? 2.2 : 2.5;
        const icoGeo = new THREE.IcosahedronGeometry(icoSize, 1);
        const icoMat = new THREE.MeshPhysicalMaterial({
            color: this.colors.centralColor,
            metalness: 0.04,
            roughness: 0.56,
            transmission: 0.18,
            transparent: true,
            opacity: 0.94,
            emissive: this.colors.glowColor,
            emissiveIntensity: 0.014,
        });
        this.centralForm = new THREE.Mesh(icoGeo, icoMat);
        this.scene.add(this.centralForm);

        // Wireframe
        const wireGeo = new THREE.IcosahedronGeometry(icoSize * 1.02, 1);
        const wireMat = new THREE.MeshBasicMaterial({
            color: this.colors.lineColor,
            wireframe: true,
            transparent: true,
            opacity: 0.14,
        });
        const wireframe = new THREE.Mesh(wireGeo, wireMat);
        this.centralForm.add(wireframe);
        this.centralForm.userData.wireframe = wireframe;

        // Instanced Nodes
        const nodeScale = this.isMobile ? 0.85 : 1;
        const nodeGeo = new THREE.OctahedronGeometry(1, 0);
        const nodeMat = new THREE.MeshPhysicalMaterial({
            color: this.colors.nodeColor,
            metalness: 0.02,
            roughness: 0.72,
            emissive: this.colors.glowColor,
            emissiveIntensity: 0.03,
        });

        this.nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeDefinitions.length);
        this.scene.add(this.nodes);

        // Connections
        const lineMat = new THREE.LineBasicMaterial({
            color: this.colors.lineColor,
            transparent: true,
            opacity: 0.08,
        });

        connections.forEach(([fromIdx, toIdx]) => {
            const points = [new THREE.Vector3(), new THREE.Vector3()];
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geo, lineMat.clone());
            line.userData = { fromIdx, toIdx, baseOpacity: 0.08, targetOpacity: 0.08 };
            this.scene.add(line);
            this.connections.push(line);
        });

        // Ring pool
        const poolSize = 20;
        const ringGeo = new THREE.TorusGeometry(1, 0.03, 8, 48);
        for (let i = 0; i < poolSize; i++) {
            const ringMat = new THREE.MeshBasicMaterial({
                color: this.colors.glowColor,
                transparent: true,
                opacity: 0,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.visible = false;
            ring.userData = { active: false, life: 0, maxLife: 3, origin: new THREE.Vector3() };
            this.scene.add(ring);
            this.ringPool.push(ring);
        }
    }

    updateTheme(colors) {
        this.colors = colors;
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);
        this.ambientLight.color.setHex(colors.ambientLight);
        this.centralForm.material.color.setHex(colors.centralColor);
        this.centralForm.material.emissive.setHex(colors.glowColor);
        this.centralForm.userData.wireframe.material.color.setHex(colors.lineColor);
        this.nodes.material.color.setHex(colors.nodeColor);
        this.nodes.material.emissive.setHex(colors.glowColor);
        this.connections.forEach(line => line.material.color.setHex(colors.lineColor));
        this.ringPool.forEach(ring => ring.material.color.setHex(colors.glowColor));
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
