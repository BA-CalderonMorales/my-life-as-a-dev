/* Load the paper world when it is near the reader; retain the HTML workbench as a fallback. */
(function () {
  "use strict";
  const scriptURL = document.currentScript.src;
  const assetBase = new URL("../", scriptURL);
  let activeHost = null,
    instance = null,
    observer = null,
    generation = 0;

  function releaseNotebookWorld() {
    generation++;
    observer?.disconnect();
    observer = null;
    instance?.destroy();
    instance = null;
    activeHost = null;
  }
  async function startNotebookWorld(host, token) {
    if (
      host.dataset.worldState === "loading" ||
      host.dataset.worldState === "ready"
    )
      return;
    host.dataset.worldState = "loading";
    try {
      const { NotebookWorld } = await import(
        new URL("studio-world/World.js", scriptURL).href
      );
      if (token !== generation || !host.isConnected) return;
      instance = new NotebookWorld(host, assetBase);
      instance.init();
    } catch {
      instance?.destroy();
      instance = null;
      if (!host.isConnected) return;
      host.dataset.worldState = "fallback";
      const section = host.closest(".paper-world");
      section.querySelector(".paper-world-status").textContent =
        "The 3D notebook couldn’t open in this browser. All four projects and their experiments are in the workbench below.";
      section.querySelector(".paper-world-fallback p").textContent =
        "Keep exploring in the workbench below.";
    }
  }
  function discoverNotebookWorld() {
    const host = document.querySelector(".paper-world-viewport");
    if (host === activeHost) return;
    releaseNotebookWorld();
    if (!host) return;
    activeHost = host;
    const token = generation;
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          startNotebookWorld(host, token);
        }
      },
      { rootMargin: "250px" },
    );
    observer.observe(host);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", discoverNotebookWorld);
  else discoverNotebookWorld();
  if (typeof document$ !== "undefined")
    document$.subscribe(discoverNotebookWorld);
})();
