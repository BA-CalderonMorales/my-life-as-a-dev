/* Blender-baked SVG poses. Opt in locally with ?flight=1. */
(function () {
  "use strict";
  if (new URLSearchParams(location.search).get("flight") !== "1") return;
  const assetBase = new URL("../", document.currentScript.src);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ns = "http://www.w3.org/2000/svg";
  let geometry;

  function makeSvg(tag, attributes) {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  }

  async function mountPaperFlight(original) {
    const anchor = original.parentElement;
    if (anchor.querySelector(".paper-flight-host")) return;
    try {
      geometry ||= fetch(new URL("geometry/paper-flight.json", assetBase))
        .then(response => {
          if (!response.ok) throw new Error("Paper flight asset unavailable");
          return response.json();
        });
      const data = await geometry;
      if (!anchor.isConnected) return;
      const root = document.createElement("span");
      root.className = "paper-flight-host";
      const trail = makeSvg("svg", { viewBox: "0 0 700 34", "aria-hidden": "true", class: "paper-flight-trail" });
      trail.appendChild(makeSvg("path", { d: "M6,22 C90,10 180,26 270,16 C350,8 430,24 510,16 C560,10 600,12 630,14" }));
      const shadow = document.createElement("span");
      shadow.className = "paper-flight-shadow";
      shadow.setAttribute("aria-hidden", "true");
      const button = document.createElement("button");
      button.className = "paper-flight-launch";
      button.type = "button";
      button.setAttribute("aria-label", "Launch the paper plane");
      button.title = "Send the paper plane on a little flight";
      const svg = makeSvg("svg", { viewBox: "0 0 64 48", "aria-hidden": "true" });
      const polygons = data.faces.map(() => {
        const polygon = makeSvg("polygon", {});
        svg.appendChild(polygon);
        return polygon;
      });
      button.appendChild(svg);
      root.append(trail, shadow, button);
      anchor.appendChild(root);
      anchor.classList.add("paper-flight-ready");
      let raf = 0;
      let travel = 0;
      let started;

      function pose(progress) {
        const index = progress * (data.frames.length - 1);
        const first = data.frames[Math.floor(index)];
        const second = data.frames[Math.min(Math.ceil(index), data.frames.length - 1)];
        const blend = index % 1;
        const points = first.map((value, i) => value + (second[i] - value) * blend);
        const orderedFaces = data.faces.map((face, index) => ({ face, index }));
        // Reverse the fold overlap when the plane banks through its underside.
        if (progress > 0.5) orderedFaces.reverse();
        orderedFaces.forEach(({ face, index }) => {
          polygons[index].setAttribute("points", face.map(v => `${points[v * 2].toFixed(2)},${points[v * 2 + 1].toFixed(2)}`).join(" "));
          svg.appendChild(polygons[index]);
        });
      }

      function rest() {
        cancelAnimationFrame(raf);
        raf = 0;
        root.removeAttribute("data-flying");
        button.style.transform = "";
        button.style.removeProperty("--fold-opacity");
        shadow.style.opacity = "0";
        shadow.style.transform = "";
        pose(0);
      }

      function frame(now) {
        if (!root.isConnected || document.hidden || reduced.matches) return rest();
        started ??= now;
        const t = Math.min((now - started) / data.duration, 1);
        const arc = Math.sin(t * Math.PI);
        const x = -travel * arc * arc;
        const y = -12 * Math.sin(t * Math.PI * 2);
        pose(t);
        button.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${1 + arc * 0.16})`;
        button.style.setProperty("--fold-opacity", String(0.035 + arc * 0.17));
        shadow.style.transform = `translateX(${x.toFixed(2)}px) scaleX(${1 - arc * 0.25})`;
        shadow.style.opacity = String(arc * 0.13);
        if (t < 1) raf = requestAnimationFrame(frame);
        else rest();
      }

      button.addEventListener("click", () => {
        if (reduced.matches || raf) return;
        travel = Math.max(0, root.clientWidth - 74);
        started = null;
        root.setAttribute("data-flying", "");
        raf = requestAnimationFrame(frame);
      });
      const observer = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting && raf) rest();
      });
      observer.observe(root);
      const cancelIfHidden = () => { if (document.hidden && raf) rest(); };
      document.addEventListener("visibilitychange", cancelIfHidden);
      reduced.addEventListener("change", rest);
      let subscription;
      // Instant navigation can remove this drawing while a flight is running.
      const cleanup = () => {
        if (!root.isConnected) {
          rest();
          observer.disconnect();
          reduced.removeEventListener("change", rest);
          document.removeEventListener("visibilitychange", cancelIfHidden);
          subscription?.unsubscribe();
        }
      };
      if (typeof document$ !== "undefined") subscription = document$.subscribe(cleanup);
      rest();
    } catch (error) {
      // Keep the original drawing if the optional asset cannot load.
      console.warn("Paper flight preview unavailable", error);
    }
  }

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("css/paper-flight.css", assetBase);
  document.head.appendChild(stylesheet);
  function discoverPaperPlane() {
    if (new URLSearchParams(location.search).get("flight") !== "1") return;
    const original = document.querySelector(".doodle-plane");
    if (!original || original.dataset.paperFlightObserved || original.parentElement.querySelector(".paper-flight-host")) return;
    original.dataset.paperFlightObserved = "true";
    const near = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        near.disconnect();
        mountPaperFlight(original);
      }
    }, { rootMargin: "200px" });
    near.observe(original);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", discoverPaperPlane);
  else discoverPaperPlane();
  if (typeof document$ !== "undefined") document$.subscribe(() => requestAnimationFrame(discoverPaperPlane));
})();
