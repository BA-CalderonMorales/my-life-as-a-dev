/**
 * GeometryFactory - Creates toon-style geometric objects
 * Inspired by Bruno Simon and other creative Three.js portfolios
 */
import * as THREE from 'three';

export class GeometryFactory {
    constructor() {
        this.toonGradient = this.createToonGradient();
    }
    
    /**
     * Create a gradient texture for toon shading effect
     */
    createToonGradient() {
        const colors = new Uint8Array(3);
        colors[0] = 0;
        colors[1] = 128;
        colors[2] = 255;
        
        const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
        gradientMap.needsUpdate = true;
        
        return gradientMap;
    }
    
    /**
     * Create toon-style material with cel-shading effect
     */
    createToonMaterial(options = {}) {
        const {
            color = 0x26A69A,
            opacity = 0.7,
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
            color = 0x26A69A,
            opacity = 0.6,
            position = { x: 0, y: 0, z: 0 }
        } = options;
        
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        const material = this.createToonMaterial({ color, opacity });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(position.x, position.y, position.z);
        mesh.userData.originalPosition = { ...position };
        mesh.userData.rotationSpeed = { x: 0.001, y: 0.002, z: 0 };
        mesh.userData.floatSpeed = 0.5 + Math.random() * 0.5;
        mesh.userData.floatAmplitude = 0.3 + Math.random() * 0.3;
        
        return mesh;
    }
    
    /**
     * Create a floating toon-style icosahedron (20-sided polyhedron)
     */
    createIcosahedron(options = {}) {
        const {
            radius = 1,
            detail = 0,
            color = 0xFF8A65,
            opacity = 0.5,
            position = { x: 0, y: 0, z: 0 }
        } = options;
        
        const geometry = new THREE.IcosahedronGeometry(radius, detail);
        const material = this.createToonMaterial({ color, opacity });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(position.x, position.y, position.z);
        mesh.userData.originalPosition = { ...position };
        mesh.userData.rotationSpeed = { x: 0.003, y: 0.002, z: 0.001 };
        mesh.userData.floatSpeed = 0.4 + Math.random() * 0.4;
        mesh.userData.floatAmplitude = 0.4 + Math.random() * 0.4;
        
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
            color = 0x4DB6AC,
            opacity = 0.4,
            position = { x: 0, y: 0, z: 0 }
        } = options;
        
        const geometry = new THREE.TorusGeometry(
            radius, tube, radialSegments, tubularSegments
        );
        const material = this.createToonMaterial({ color, opacity });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(position.x, position.y, position.z);
        mesh.userData.originalPosition = { ...position };
        mesh.userData.rotationSpeed = { x: 0.002, y: 0.003, z: 0.001 };
        mesh.userData.floatSpeed = 0.3 + Math.random() * 0.3;
        mesh.userData.floatAmplitude = 0.2 + Math.random() * 0.3;
        
        return mesh;
    }
    
    /**
     * Create a floating toon-style octahedron
     */
    createOctahedron(options = {}) {
        const {
            radius = 1,
            detail = 0,
            color = 0x00796B,
            opacity = 0.5,
            position = { x: 0, y: 0, z: 0 }
        } = options;
        
        const geometry = new THREE.OctahedronGeometry(radius, detail);
        const material = this.createToonMaterial({ color, opacity });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(position.x, position.y, position.z);
        mesh.userData.originalPosition = { ...position };
        mesh.userData.rotationSpeed = { x: 0.002, y: 0.001, z: 0.002 };
        mesh.userData.floatSpeed = 0.35 + Math.random() * 0.35;
        mesh.userData.floatAmplitude = 0.25 + Math.random() * 0.35;
        
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
            color = 0x26A69A,
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
        mesh.userData.rotationSpeed = { x: 0, y: 0.001, z: 0.0005 };
        
        return mesh;
    }
    
    dispose() {
        if (this.toonGradient) {
            this.toonGradient.dispose();
        }
    }
}
