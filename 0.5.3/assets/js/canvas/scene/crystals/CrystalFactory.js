/**
 * Crystal Factory - Creates crystal geometries and materials
 * 
 * Produces elongated octahedron crystals with glass-like physical materials
 * that refract light like real gemstones.
 */
import * as THREE from 'three';
import { crystalConfigs } from './CrystalConfig.js';

/**
 * Create elongated octahedron geometry for crystal shape
 */
export function createCrystalGeometry(height, radius) {
    const geo = new THREE.OctahedronGeometry(radius, 0);

    // Stretch vertically for natural crystal proportions
    const positions = geo.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] *= height / radius;
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();

    return geo;
}

/**
 * Create physical material for realistic crystal appearance
 */
export function createCrystalMaterial(color) {
    return new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.0,
        roughness: 0.08,
        transmission: 0.88,
        thickness: 1.6,
        ior: 1.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        envMapIntensity: 0.7,
        flatShading: true,
        emissive: 0x000000,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0.94,
    });
}

/**
 * Create all crystals for the scene
 * @param {THREE.Group} parent - Group to add crystals to
 * @param {number[]} crystalColors - Array of color values
 * @returns {{ crystals: THREE.Mesh[], materials: THREE.Material[] }}
 */
export function createCrystals(parent, crystalColors) {
    const crystals = [];
    const materials = [];

    crystalConfigs.forEach((config, i) => {
        const colorIndex = i % crystalColors.length;
        const material = createCrystalMaterial(crystalColors[colorIndex]);
        materials.push(material);

        const geometry = createCrystalGeometry(config.height, config.radius);
        const crystal = new THREE.Mesh(geometry, material);
        crystal.position.set(...config.pos);
        crystal.rotation.x = config.rotX;
        crystal.rotation.z = config.rotZ;

        // Store animation data
        crystal.userData = {
            baseRotX: config.rotX,
            baseRotZ: config.rotZ,
            animOffset: Math.random() * Math.PI * 2,
            animSpeed: 0.3 + Math.random() * 0.4,
            basePos: new THREE.Vector3(...config.pos),
            glowIntensity: 0,
            targetGlow: 0
        };

        parent.add(crystal);
        crystals.push(crystal);
    });

    return { crystals, materials };
}

/**
 * Update crystal colors for theme change
 */
export function updateCrystalColors(materials, crystalColors) {
    materials.forEach((mat, i) => {
        const colorIndex = i % crystalColors.length;
        mat.color.setHex(crystalColors[colorIndex]);
    });
}
