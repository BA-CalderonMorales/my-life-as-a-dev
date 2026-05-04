/**
 * Origami Unfolding View - Three.js Rendering
 */
import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.planes = [];
        this.connections = [];
        this.ambientLight = null;
    }

    init(config, colors) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.Fog(colors.fog, 5, 25);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 12);

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(this.isMobile ? config.performance.mobile.pixelRatio : config.performance.desktop.pixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.ambientLight = new THREE.AmbientLight(colors.ambient, 0.6);
        this.scene.add(this.ambientLight);

        this._createGeometry(config, colors);
    }

    _createGeometry(config, colors) {
        const perf = this.isMobile ? config.performance.mobile : config.performance.desktop;
        const geo = new THREE.BufferGeometry();
        const half = perf.planeSize / 2;
        const vertices = new Float32Array([
            0, half, 0,
            -half, -half, 0,
            half, -half, 0,
        ]);
        geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geo.computeVertexNormals();

        config.normals.forEach(n => {
            const normal = new THREE.Vector3(...n).normalize();
            const mat = new THREE.MeshPhysicalMaterial({
                color: colors.plane,
                metalness: 0.1,
                roughness: 0.5,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9,
                emissive: colors.glow,
                emissiveIntensity: 0.05
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(normal.clone().multiplyScalar(perf.distance));
            mesh.lookAt(0, 0, 0);
            
            mesh.userData = {
                baseNormal: normal.clone(),
                basePos: mesh.position.clone(),
                rotationSpeed: 0.2 + Math.random() * 0.3,
                axis: new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize()
            };
            
            this.scene.add(mesh);
            this.planes.push(mesh);
        });

        const lineMat = new THREE.LineBasicMaterial({
            color: colors.line,
            transparent: true,
            opacity: 0.15
        });

        for (let i = 0; i < this.planes.length; i++) {
            for (let j = i + 1; j < this.planes.length; j++) {
                const dist = this.planes[i].position.distanceTo(this.planes[j].position);
                if (dist < (this.isMobile ? 6 : 8)) {
                    const points = [this.planes[i].position.clone(), this.planes[j].position.clone()];
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(lineGeo, lineMat.clone());
                    line.userData = { from: i, to: j };
                    this.scene.add(line);
                    this.connections.push(line);
                }
            }
        }
    }

    updateTheme(colors) {
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fog);
        this.ambientLight.color.setHex(colors.ambient);
        this.planes.forEach(p => {
            p.material.color.setHex(colors.plane);
            p.material.emissive.setHex(colors.glow);
        });
        this.connections.forEach(l => l.material.color.setHex(colors.line));
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
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
        }
        this.planes.forEach(p => p.geometry.dispose());
        this.connections.forEach(l => l.geometry.dispose());
    }
}
