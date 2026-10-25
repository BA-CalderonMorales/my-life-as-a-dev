/* The workbench enhances the existing experiments; it owns only its own canvas. */
(function () {
  "use strict";
  const entry = new URL(
    "studio-workbench/Workbench.js",
    document.currentScript.src,
  );
  let host = null,
    instance = null,
    observer = null,
    generation = 0;
  function releaseWorkbench() {
    generation++;
    observer?.disconnect();
    instance?.destroy();
    instance = null;
    observer = null;
    host = null;
  }
  async function openWorkbench(target, token) {
    target.dataset.benchState = "loading";
    target.setAttribute("aria-busy", "true");
    target.closest(".studio-projects").querySelector(".bench-active-caption").textContent =
      "Opening the workbench…";
    let candidate = null;
    try {
      const { Workbench } = await import(entry.href);
      if (token !== generation || !target.isConnected) return;
      candidate = new Workbench(target);
      instance = candidate;
      await candidate.init();
      if (token !== generation || !target.isConnected) candidate.destroy();
    } catch {
      candidate?.destroy();
      if (token !== generation || !target.isConnected) return;
      instance = null;
      target.dataset.benchState = "fallback";
      target.setAttribute("aria-busy", "false");
      target.closest(".studio-projects").classList.add("bench-fallback");
    }
  }
  function discoverWorkbench() {
    const target = document.querySelector(".bench-viewport");
    if (target === host) return;
    releaseWorkbench();
    if (!target) return;
    host = target;
    const token = generation;
    if (document.documentElement.classList.contains("studio-arrival-pending")) {
      openWorkbench(target, token);
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          openWorkbench(target, token);
        }
      },
      { rootMargin: "220px" },
    );
    observer.observe(target);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", discoverWorkbench);
  else discoverWorkbench();
  if (typeof document$ !== "undefined") document$.subscribe(discoverWorkbench);
})();
