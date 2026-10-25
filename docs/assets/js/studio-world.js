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
    host.setAttribute("aria-busy", "true");
    host.closest(".paper-world").querySelector(".paper-world-status").textContent =
      "Opening the notebook. The workbench below is already open.";
    let candidate = null;
    try {
      const { NotebookWorld } = await import(
        new URL("studio-world/World.js", scriptURL).href
      );
      if (token !== generation || !host.isConnected) return;
      candidate = new NotebookWorld(host, assetBase);
      instance = candidate;
      await candidate.init();
      if (token !== generation || !host.isConnected) candidate.destroy();
    } catch {
      candidate?.destroy();
      if (token !== generation || !host.isConnected) return;
      instance = null;
      host.setAttribute("aria-busy", "false");
      host.dataset.worldState = "fallback";
      const section = host.closest(".paper-world");
      section.querySelector(".paper-world-status").textContent =
        "The 3D notebook couldn’t open in this browser. All four projects and their experiments are in the workbench below.";
    }
  }
  function discoverNotebookWorld() {
    const host = document.querySelector(".paper-world-viewport");
    if (host === activeHost) return;
    releaseNotebookWorld();
    if (!host) return;
    activeHost = host;
    const token = generation;
    if (document.documentElement.classList.contains("studio-arrival-pending")) {
      startNotebookWorld(host, token);
      return;
    }
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
