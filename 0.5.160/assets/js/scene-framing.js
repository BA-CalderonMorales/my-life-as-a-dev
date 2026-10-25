import * as THREE from "../vendor/three/three.module.min.js";

// Fit a world-space box into an orthographic view without stretching its objects.
export function frameBox(box, camera, aspect, fill = 0.82) {
  const view = new THREE.Box3();
  const inverse = camera.quaternion.clone().invert();
  for (const x of [box.min.x, box.max.x])
    for (const y of [box.min.y, box.max.y])
      for (const z of [box.min.z, box.max.z])
        view.expandByPoint(new THREE.Vector3(x, y, z).applyQuaternion(inverse));
  const size = view.getSize(new THREE.Vector3());
  return {
    center: box.getCenter(new THREE.Vector3()),
    span: Math.max(size.y, size.x / aspect) / fill,
  };
}

export function setFrustum(camera, span, aspect) {
  camera.left = -span * aspect / 2;
  camera.right = span * aspect / 2;
  camera.top = span / 2;
  camera.bottom = -span / 2;
  camera.updateProjectionMatrix();
}
