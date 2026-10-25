/* A real readiness check, followed by an invitation. The page stays usable if it fails. */
(function () {
  "use strict";
  let disposeArrival = () => {};
  let activeDialog = null;

  function mountArrival() {
    const html = document.documentElement;
    const dialog = document.querySelector(".studio-arrival");
    if (dialog === activeDialog) return;
    disposeArrival();
    activeDialog = dialog;
    if (!dialog || !html.classList.contains("studio-arrival-pending")) return;
    const root = document.querySelector(".studio-home");
    const world = root.querySelector(".paper-world-viewport");
    const bench = root.querySelector(".bench-viewport");
    const enter = dialog.querySelector(".arrival-enter");
    const skip = dialog.querySelector(".arrival-skip");
    const status = dialog.querySelector("#arrival-status");
    const events = new AbortController();
    const options = { signal: events.signal };
    let paperReady = false, entered = false, disposed = false, closing = 0;
    let deadline = 0;

    function releaseArrival() {
      disposed = true;
      events.abort();
      observer.disconnect();
      clearTimeout(deadline);
      clearTimeout(closing);
      dialog.close();
      html.classList.remove("studio-arrival-pending");
    }

    function enterStudio() {
      if (entered || disposed) return;
      entered = true;
      try { sessionStorage.setItem("studio-entered", "1"); } catch {}
      dialog.classList.add("arrival-leaving");
      html.classList.remove("studio-arrival-pending");
      const finish = () => {
        releaseArrival();
        const heading = root.querySelector("h1");
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      };
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
      else closing = setTimeout(finish, 360);
    }

    function offerEntry(timedOut = false) {
      if (entered || disposed) return;
      const state = {
        paper: paperReady,
        world: ["ready", "fallback"].includes(world.dataset.worldState),
        bench: ["ready", "fallback"].includes(bench.dataset.benchState),
      };
      for (const [name, ready] of Object.entries(state)) {
        const check = dialog.querySelector(`[data-arrival-check="${name}"]`);
        check.dataset.ready = String(ready);
        check.setAttribute("aria-label", `${check.textContent}: ${ready ? "ready" : "preparing"}`);
      }
      if (!timedOut && (!Object.values(state).every(Boolean) || !root.classList.contains("studio-ready"))) return;
      clearTimeout(deadline);
      observer.disconnect();
      dialog.dataset.arrivalState = "ready";
      const fallback = world.dataset.worldState === "fallback" || bench.dataset.benchState === "fallback";
      status.textContent = timedOut
        ? "The little world is taking its time. You can come in now."
        : fallback
          ? "The pages are open. There’s plenty to explore."
          : "The notebook is open. Take your time.";
      enter.textContent = "Come on in!";
      enter.disabled = false;
      const moveFocus = document.activeElement === skip;
      skip.disabled = true;
      if (moveFocus) enter.focus({ preventScroll: true });
    }

    const observer = new MutationObserver(() => offerEntry());
    observer.observe(world, { attributes: true, attributeFilter: ["data-world-state"] });
    observer.observe(bench, { attributes: true, attributeFilter: ["data-bench-state"] });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    dialog.dataset.arrivalState = "loading";
    enter.addEventListener("click", enterStudio, options);
    skip.addEventListener("click", enterStudio, options);
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const buttons = [...dialog.querySelectorAll("button:not(:disabled)")];
      const first = buttons[0], last = buttons.at(-1);
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }, options);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      enterStudio();
    }, options);
    dialog.addEventListener("close", () => {
      if (!entered && !disposed) enterStudio();
    }, options);
    try { dialog.showModal(); } catch { releaseArrival(); return; }
    deadline = setTimeout(() => offerEntry(true), 15000);
    document.fonts.ready.then(() => {
      paperReady = true;
      offerEntry();
    });
    offerEntry();
    disposeArrival = releaseArrival;
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mountArrival);
  else mountArrival();
  if (typeof document$ !== "undefined") document$.subscribe(mountArrival);
})();
