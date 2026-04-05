/**
 * GeometryFactory - Creates restrained geometric objects
 */
import * as THREE from 'three';

let sharedToonGradient = null;

export class GeometryFactory {
    constructor() {
        if (!sharedToonGradient) {
            sharedToonGradient = this.createToonGradient();
        }
        this.toonGradient = sharedToonGradient;
    }

    /**
     * Create a gradient texture for toon shading effect
     * Uses 5 steps for smoother cel-shading appearance
     */
    createToonGradient() {
        const colors = new Uint8Array(5);
        colors[0] = 0;
        colors[1] = 64;
        colors[2] = 128;
        colors[3] = 192;
        colors[4] = 255;

        const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
        gradientMap.needsUpdate = true;

        return gradientMap;
    }

    /**
     * Create toon-style material with cel-shading effect
     */
    createToonMaterial(options = {}) {
        const {
            color = 0x5c5c5c,
            opacity = 0.5,
            transparent = true
        } = options;

        const material = new THREE.MeshToonMaterial({
            color,
            transparent,
            opacity,
            gradientMap: this.toonGradient
        });

        return material;
    }

    /**
     * Create a floating toon-style sphere
     */
    createSphere(options = {}) {
        const {
            radius = 1,
            segments = 32,
            color = 0x5c5c5c,
            opacity = 0.48,
            position = { x: 0, y: 0, z: 0 }
        } = options;

        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        const material = this.createToonMaterial({ color, opacity });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(position.x, position.y, position.z);
        mesh.userData.originalPosition = { ...position };
        mesh.userData.rotationSpeed = { x: 0.0003, y: 0.00055, z: 0 };
        mesh.userData.floatSpeed = 0.16 + Math.random() * 0.14;
        mesh.userData.floatAmplitude = 0.08 + Math.random() * 0.06;

        return mesh;
    }

    /**
     * Create a floating toon-style icosahedron (20-sided polyhedron)
     */
    createIcosahedron(options = {}) {
        const {
            radius = 1,
            detail = 0,
            color = 0xbdbdb8,
            opacity = 0.42,
            position = { x: 0, y: 0, z: 0 }
        } = options;

        const geometry = new THREE.IcosahedronGeometry(radius, detail);
        const material = this.createToonMaterial({ color, opacity });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(position.x, position.y, position.z);
        mesh.userData.originalPosition = { ...position };
        mesh.userData.rotationSpeed = { x: 0.00045, y: 0.00038, z: 0.00022 };
        mesh.userData.floatSpeed = 0.15 + Math.random() * 0.12;
        mesh.userData.floatAmplitude = 0.08 + Math.random() * 0.08;

        return mesh;
    }

    /**
     * Create a floating toon-style torus
     */
    createTorus(options = {}) {
        const {
            radius = 1,
            tube = 0.3,
            radialSegments = 16,
            tubularSegments = 48,
            color = 0x404040,
            opacity = 0.32,
            position = { x: 0, y: 0, z: 0 }
        } = options;

        const geometry = new THREE.TorusGeometry(
            radius, tube, radialSegments, tubularSegments
        );
        const material = this.createToonMaterial({ color, opacity });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(position.x, position.y, position.z);
        mesh.userData.originalPosition = { ...position };
        mesh.userData.rotationSpeed = { x: 0.00032, y: 0.00048, z: 0.0002 };
        mesh.userData.floatSpeed = 0.12 + Math.random() * 0.1;
        mesh.userData.floatAmplitude = 0.06 + Math.random() * 0.08;

        return mesh;
    }

    /**
     * Create a floating toon-style octahedron
     */
    createOctahedron(options = {}) {
        const {
            radius = 1,
            detail = 0,
            color = 0x4a4a4a,
            opacity = 0.4,
            position = { x: 0, y: 0, z: 0 }
        } = options;

        const geometry = new THREE.OctahedronGeometry(radius, detail);
        const material = this.createToonMaterial({ color, opacity });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(position.x, position.y, position.z);
        mesh.userData.originalPosition = { ...position };
        mesh.userData.rotationSpeed = { x: 0.00034, y: 0.0002, z: 0.00036 };
        mesh.userData.floatSpeed = 0.14 + Math.random() * 0.12;
        mesh.userData.floatAmplitude = 0.07 + Math.random() * 0.08;

        return mesh;
    }

    /**
     * Create wireframe version for subtle depth
     */
    createWireframeRing(options = {}) {
        const {
            innerRadius = 2,
            outerRadius = 3,
            segments = 32,
            color = 0x8c8c8c,
            opacity = 0.15,
            position = { x: 0, y: 0, z: 0 }
        } = options;

        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            wireframe: true,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(position.x, position.y, position.z);
        mesh.rotation.x = Math.PI * 0.5;
        mesh.userData.originalPosition = { ...position };
        mesh.userData.rotationSpeed = { x: 0, y: 0.00018, z: 0.00008 };

        return mesh;
    }

    dispose() {
    }

    static disposeSharedResources() {
        if (sharedToonGradient) {
            sharedToonGradient.dispose();
            sharedToonGradient = null;
        }
    }
}
