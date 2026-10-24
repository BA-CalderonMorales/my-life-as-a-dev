import * as THREE from "../../vendor/three/three.module.min.js";

export class PaperMaterials {
  constructor() {
    this.owned = new Set();
    this.cache = new Map();
  }
  material(color, options = {}) {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.92,
      metalness: 0,
      ...options,
    });
    this.owned.add(material);
    return material;
  }
  inkTexture(draw, width = 1024, height = 512) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    draw(context, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    this.owned.add(texture);
    return texture;
  }
  label(text, color = "#40584a", size = 1) {
    const texture = this.inkTexture(
      (ctx, w, h) => {
        ctx.font = "500 76px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = color;
        ctx.fillText(text, w / 2, h / 2);
      },
      1024,
      128,
    );
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.owned.add(material);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(size * 8, size),
      material,
    );
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }
  dispose() {
    this.owned.forEach((resource) => resource.dispose());
    this.owned.clear();
  }
}
