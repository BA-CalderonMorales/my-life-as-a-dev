/* The family walk is independent of the two WebGL scenes and their welcome screen. */
(function () {
  "use strict";
  const entry = new URL("studio-life/Journey.js", document.currentScript.src);
  let host = null, journey = null, generation = 0;

  async function discoverFamilyWalk() {
    const root = document.querySelector(".life-journey");
    if (root === host) return;
    const token = ++generation;
    journey?.destroy();
    journey = null;
    host = root;
    if (!root) return;
    try {
      const { LifeJourney } = await import(entry.href);
      if (token !== generation || !root.isConnected) return;
      journey = new LifeJourney(root);
      journey.init();
    } catch {
      if (token !== generation || !root.isConnected) return;
      journey?.destroy();
      journey = null;
      root.classList.add("life-fallback");
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", discoverFamilyWalk);
  else discoverFamilyWalk();
  if (typeof document$ !== "undefined") document$.subscribe(discoverFamilyWalk);
})();
