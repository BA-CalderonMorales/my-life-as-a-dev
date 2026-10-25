// The preview stays visible until textures, shaders, and the first frame are ready.
export async function prepareScene(owner, assets = Promise.resolve()) {
  await assets;
  if (owner.destroyed) return false;
  await owner.renderer.compileAsync(owner.scene, owner.camera);
  if (owner.destroyed) return false;
  owner.prepareView();
  owner.render(performance.now());
  await new Promise((resolve) => requestAnimationFrame(resolve));
  return !owner.destroyed;
}
