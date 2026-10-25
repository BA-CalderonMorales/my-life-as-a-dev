import * as THREE from "../../vendor/three/three.module.min.js";
import { PaperMaterials } from "./materials.js";
import { buildPaperWorld } from "./models.js";
import { places, home } from "./projects.js";
import { setFrustum } from "../scene-framing.js";

export class NotebookWorld {
  constructor(host, assetBase) {
    this.host = host;
    this.assetBase = assetBase;
    this.abort = new AbortController();
    this.materials = new PaperMaterials();
    this.motion = matchMedia("(prefers-reduced-motion: reduce)");
    this.compact = matchMedia("(max-width:1100px), (pointer:coarse)").matches;
    this.viewSpan = 26;
    this.spanTarget = 26;
    this.frame = 0;
    this.destroyed = false;
    this.visible = true;
    this.selected = null;
    this.visited = new Set();
    this.yaw = 0.63;
    this.targetYaw = 0.63;
    this.pointer = new THREE.Vector2();
    this.ray = new THREE.Raycaster();
    this.target = new THREE.Vector3(home.x, 1.4, home.z);
    this.focus = new THREE.Vector3(0, 0.2, 0);
    this.focusTarget = this.focus.clone();
    this.last = 0;
    this.activeUntil = 0;
    this.hover = null;
    this.drag = null;
    this.drift = 0;
  }
  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-22, 22, 14, -14, 0.1, 150);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: this.compact ? "low-power" : "default",
    });
    this.renderer.setPixelRatio(
      Math.min(devicePixelRatio, this.compact ? 1.5 : 2),
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    const canvas = this.renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Explore Brandon’s paper notebook. Click a place to fly there. Arrow keys move the plane; Enter opens the nearest project. Escape returns to the whole notebook.",
    );
    this.host.prepend(canvas);
    this.scene.add(new THREE.AmbientLight("#fff7e5", 2.0));
    this.sun = new THREE.DirectionalLight("#ffe5ba", 3.0);
    this.sun.position.set(-12, 25, 9);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(
      this.compact ? 512 : 1024,
      this.compact ? 512 : 1024,
    );
    Object.assign(this.sun.shadow.camera, {
      left: -24,
      right: 24,
      top: 20,
      bottom: -20,
      near: 1,
      far: 70,
    });
    this.sun.shadow.bias = -0.0007;
    this.sun.shadow.normalBias = 0.035;
    this.sun.shadow.radius = 3;
    this.scene.add(this.sun);
    this.world = buildPaperWorld(this.materials, this.assetBase, () =>
      this.requestRender(),
    );
    this.scene.add(this.world.group);
    this.createMarkers();
    this.bindInputs();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.intersection = new IntersectionObserver((entries) => {
      this.visible = entries[0].isIntersecting;
      if (this.visible) this.requestRender();
      else this.stop();
    });
    this.intersection.observe(this.host);
    this.themeObserver = new MutationObserver(() => this.updateTheme());
    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"],
    });
    this.updateTheme();
    this.resize();
    this.host.dataset.worldState = "ready";
    this.host.closest(".paper-world").classList.add("paper-world-ready");
    this.status(
      "You’re at home base. Pick a place, or click the paper to fly.",
    );
    this.requestRender();
    return this;
  }
  createMarkers() {
    this.markers = [];
    this.markerDock = document.createElement("nav");
    this.markerDock.className = "paper-world-places";
    this.markerDock.setAttribute("aria-label", "Notebook places");
    this.host.appendChild(this.markerDock);
    for (const place of [home, ...places]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "paper-world-marker";
      button.dataset.place = place.id;
      button.setAttribute("aria-pressed", String(place.id === home.id));
      button.setAttribute(
        "aria-label",
        `Visit ${place.name}: ${place.project}`,
      );
      const number = document.createElement("span");
      number.textContent = place.number;
      const name = document.createElement("span");
      name.textContent = place.name;
      button.append(number, name);
      button.addEventListener("click", () => this.travel(place.id), {
        signal: this.abort.signal,
      });
      this.markerDock.appendChild(button);
      this.markers.push({ button, place });
    }
  }
  bindInputs() {
    const canvas = this.renderer.domElement,
      options = { signal: this.abort.signal };
    canvas.addEventListener(
      "pointerdown",
      (event) => {
        if (event.button !== 0 || !event.isPrimary) return;
        this.drag = {
          x: event.clientX,
          y: event.clientY,
          lastX: event.clientX,
          moved: false,
          horizontal: false,
        };
        canvas.setPointerCapture(event.pointerId);
      },
      options,
    );
    canvas.addEventListener(
      "pointermove",
      (event) => {
        if (this.drag) {
          const dx = event.clientX - this.drag.lastX;
          const totalX = event.clientX - this.drag.x,
            totalY = event.clientY - this.drag.y;
          if (!this.drag.moved && Math.hypot(totalX, totalY) > 8) {
            this.drag.moved = true;
            this.drag.horizontal = Math.abs(totalX) > Math.abs(totalY);
          }
          if (this.drag.moved && this.drag.horizontal) {
            this.targetYaw += dx * 0.006;
            this.activeUntil = performance.now() + 500;
            this.requestRender();
          }
          this.drag.lastX = event.clientX;
        } else {
          this.setPointer(event);
          this.ray.setFromCamera(this.pointer, this.camera);
          const hit = this.ray.intersectObjects(this.world.pickables)[0];
          canvas.style.cursor = hit ? "pointer" : "grab";
        }
      },
      options,
    );
    canvas.addEventListener(
      "pointerup",
      (event) => {
        const drag = this.drag;
        this.drag = null;
        if (!drag || drag.moved) return;
        this.setPointer(event);
        this.ray.setFromCamera(this.pointer, this.camera);
        const hit = this.ray.intersectObjects(this.world.pickables)[0];
        if (hit) {
          this.travel(hit.object.userData.project);
          return;
        }
        const paper = this.ray.intersectObject(this.world.ground)[0];
        if (paper) {
          this.target.set(
            THREE.MathUtils.clamp(paper.point.x, -13, 13),
            1.4,
            THREE.MathUtils.clamp(paper.point.z, -9, 9),
          );
          this.requestRender();
        }
      },
      options,
    );
    canvas.addEventListener(
      "pointercancel",
      () => {
        this.drag = null;
      },
      options,
    );
    canvas.addEventListener(
      "keydown",
      (event) => {
        const key = event.key.toLowerCase();
        const directions = {
          arrowup: [0, -1],
          w: [0, -1],
          arrowdown: [0, 1],
          s: [0, 1],
          arrowleft: [-1, 0],
          a: [-1, 0],
          arrowright: [1, 0],
          d: [1, 0],
        };
        if (directions[key]) {
          event.preventDefault();
          const [x, z] = directions[key];
          this.target.x = THREE.MathUtils.clamp(
            this.target.x + x * 1.2,
            -13,
            13,
          );
          this.target.z = THREE.MathUtils.clamp(this.target.z + z * 1.2, -9, 9);
          this.requestRender();
        } else if (key === "enter") {
          event.preventDefault();
          const nearest = [...places].sort(
            (a, b) =>
              Math.hypot(a.x - this.target.x, a.z - this.target.z) -
              Math.hypot(b.x - this.target.x, b.z - this.target.z),
          )[0];
          this.travel(nearest.id);
        } else if (key === "escape") {
          this.reset();
        }
      },
      options,
    );
    const section = this.host.closest(".paper-world");
    section
      .querySelector("[data-world-immersive]")
      .addEventListener("click", () => this.toggleImmersive(), options);
    section.addEventListener(
      "keydown",
      (event) => {
        if (!section.classList.contains("paper-world-immersive")) return;
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          this.toggleImmersive(false);
          return;
        }
        if (event.key !== "Tab") return;
        const controls = [
          ...section.querySelectorAll("button,canvas[tabindex],a[href]"),
        ].filter((node) => node.getClientRects().length && !node.disabled);
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      },
      { ...options, capture: true },
    );
    section
      .querySelector("[data-world-reset]")
      .addEventListener("click", () => this.reset(), options);
    section
      .querySelector("[data-world-sort]")
      .addEventListener("click", () => this.sortSkyline(), options);
    section.querySelector("[data-world-notes]").addEventListener(
      "click",
      () => {
        if (this.selected)
          this.host.closest(".studio-home").dispatchEvent(
            new CustomEvent("studio:select-project", {
              detail: { id: this.selected },
            }),
          );
        if (section.classList.contains("paper-world-immersive"))
          this.toggleImmersive(false);
        document
          .querySelector("#building")
          .scrollIntoView({ behavior: "instant", block: "start" });
      },
      options,
    );
    this.motion.addEventListener(
      "change",
      () => {
        this.activeUntil = 0;
        this.requestRender();
      },
      options,
    );
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) this.stop();
        else this.requestRender();
      },
      options,
    );
    canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        this.stop();
        this.status(
          "The 3D view paused. All four projects are still available in the workbench below.",
        );
      },
      options,
    );
    canvas.addEventListener(
      "webglcontextrestored",
      () => this.requestRender(),
      options,
    );
    window.addEventListener(
      "studio:world-select",
      (event) => {
        if (places.some((place) => place.id === event.detail?.id))
          this.travel(event.detail.id);
      },
      options,
    );
  }
  setPointer(event) {
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
  }
  travel(id) {
    if (id === home.id) {
      this.reset();
      return;
    }
    const place = places.find((place) => place.id === id);
    if (!place) return;
    this.selected = id;
    this.visited.add(id);
    this.world.routes.forEach((route, routeId) => {
      route.material.opacity = routeId === id ? 1 : 0.5;
      route.material.color.set(routeId === id ? "#365d45" : "#68795f");
    });
    this.target.set(place.x, 1.5, place.z + 2.3);
    this.frameSelection();
    this.activeUntil = performance.now() + 2200;
    this.markers.forEach(({ button, place: item }) =>
      button.setAttribute("aria-pressed", String(item.id === id)),
    );
    const section = this.host.closest(".paper-world"),
      note = section.querySelector(".paper-world-note");
    note.hidden = false;
    note.querySelector(".paper-world-note-label").textContent =
      `${place.number} / ${place.project}`;
    note.querySelector("h3").textContent = place.name;
    note.querySelector("p").textContent = place.note;
    section.querySelector("[data-world-sort]").hidden = id !== "algorithm";
    section.querySelector(".paper-world-progress").textContent =
      `${this.visited.size} / 4 places found`;
    this.host
      .closest(".studio-home")
      .dispatchEvent(
        new CustomEvent("studio:select-project", { detail: { id } }),
      );
    this.status(`${place.name}. ${place.description}`);
    this.requestRender();
  }
  sortSkyline() {
    if (this.sorting) return;
    const bars = this.world.skyline;
    const arranged = [...bars].sort(
      (a, b) => a.userData.value - b.userData.value,
    );
    this.sorting = {
      start: performance.now(),
      moves: arranged.map((bar, index) => ({
        bar,
        from: bar.position.x,
        to: -1.6 + index * 0.46,
      })),
    };
    this.activeUntil = performance.now() + 1300;
    this.status("The skyline is finding its order, from smallest to largest.");
    this.requestRender();
  }
  reset() {
    this.selected = null;
    this.world.routes.forEach((route) => {
      route.material.opacity = 0.8;
      route.material.color.set("#68795f");
    });
    this.target.set(home.x, 1.4, home.z);
    this.frameSelection();
    this.targetYaw = 0.63;
    this.host
      .closest(".paper-world")
      .querySelector(".paper-world-note").hidden = true;
    this.markers.forEach(({ button }) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.place === home.id),
      ),
    );
    this.activeUntil = performance.now() + 1000;
    this.status("Back at home base. Pick a place whenever you’re ready.");
    this.requestRender();
  }
  toggleImmersive(force) {
    const section = this.host.closest(".paper-world");
    const open = force ?? !section.classList.contains("paper-world-immersive");
    if (open) this.pageScroll = { left: scrollX, top: scrollY };
    section.classList.toggle("paper-world-immersive", open);
    document.body.classList.toggle("paper-world-is-open", open);
    const button = section.querySelector("[data-world-immersive]");
    button.textContent = open ? "Back to the page ↙" : "Step inside ↗";
    if (open) {
      section.setAttribute("role", "dialog");
      section.setAttribute("aria-modal", "true");
      this.renderer.domElement.focus({ preventScroll: true });
    } else {
      section.removeAttribute("role");
      section.removeAttribute("aria-modal");
      if (button.isConnected) button.focus({ preventScroll: true });
      if (this.pageScroll) window.scrollTo({ ...this.pageScroll, behavior: "instant" });
    }
    this.resize();
  }
  status(text) {
    this.host
      .closest(".paper-world")
      .querySelector(".paper-world-status").textContent = text;
  }
  updateTheme() {
    const dark = document.body.dataset.mdColorScheme === "slate";
    this.renderer.setClearColor(dark ? "#1d2723" : "#f8f5ed", 0);
    this.sun.intensity = dark ? 2.1 : 3;
    this.renderer.toneMappingExposure = dark ? 0.95 : 1.18;
    this.requestRender();
  }
  resize() {
    if (this.destroyed) return;
    this.compact = matchMedia("(max-width:1100px), (pointer:coarse)").matches;
    const width = this.host.clientWidth,
      height = this.host.clientHeight -
        (this.compact ? this.markerDock.offsetHeight : 0);
    if (!width || !height) return;
    this.aspect = width / height;
    this.renderer.setSize(width, height, false);
    this.frameSelection();
    setFrustum(this.camera, this.viewSpan, width / height);
    this.requestRender();
  }
  frameSelection() {
    const aspect = this.aspect || 1;
    const place = places.find((item) => item.id === this.selected);
    if (this.compact && place) {
      this.focusTarget.set(place.x, 0.8, place.z + 0.4);
      this.spanTarget = Math.max(10, 9 / aspect);
    } else {
      this.focusTarget.set(
        place ? place.x * 0.13 : 0,
        0.2,
        place ? place.z * 0.13 : 0,
      );
      this.spanTarget = this.compact ? Math.max(26, 42 / aspect) : 26;
    }
    this.host.dataset.worldView = this.compact && place ? "closeup" : "overview";
  }
  requestRender() {
    if (!this.frame && !this.destroyed && this.visible && !document.hidden)
      this.frame = requestAnimationFrame((time) => this.render(time));
  }
  render(time) {
    this.frame = 0;
    if (this.destroyed || !this.visible || document.hidden) return;
    const dt = Math.min(0.05, this.last ? (time - this.last) / 1000 : 0.016);
    this.last = time;
    const plane = this.world.plane;
    const distance = plane.position.distanceTo(this.target);
    const easing = this.motion.matches ? 1 : 1 - Math.exp(-dt * 3.4);
    if (distance > 0.015) {
      const dx = this.target.x - plane.position.x,
        dz = this.target.z - plane.position.z;
      const rotation = Math.atan2(-dx, -dz);
      plane.rotation.y +=
        THREE.MathUtils.euclideanModulo(
          rotation - plane.rotation.y + Math.PI,
          Math.PI * 2,
        ) - Math.PI;
      plane.position.lerp(this.target, easing);
      plane.rotation.z = this.motion.matches
        ? 0
        : Math.sin(time * 0.004) * Math.min(distance, 0.5) * 0.2;
    } else plane.rotation.z = 0;
    this.world.planeShadow.position.set(
      plane.position.x,
      0.16,
      plane.position.z,
    );
    this.yaw += (this.targetYaw - this.yaw) * easing;
    this.focus.lerp(this.focusTarget, easing);
    this.camera.position.set(
      Math.sin(this.yaw) * 33 + (this.compact ? this.focus.x : 0),
      31 + (this.compact ? this.focus.y : 0),
      Math.cos(this.yaw) * 33 + (this.compact ? this.focus.z : 0),
    );
    this.viewSpan = THREE.MathUtils.lerp(this.viewSpan, this.spanTarget, easing);
    setFrustum(this.camera, this.viewSpan, this.aspect || 1);
    this.camera.lookAt(this.focus);
    this.camera.updateMatrixWorld();
    let changing =
      Math.abs(this.viewSpan - this.spanTarget) > 0.01 ||
      distance > 0.015 ||
      Math.abs(this.yaw - this.targetYaw) > 0.001 ||
      this.focus.distanceTo(this.focusTarget) > 0.01;
    if (
      this.selected === "agent" &&
      time < this.activeUntil &&
      !this.motion.matches
    ) {
      this.world.gears.forEach((gear) => {
        gear.rotation.y += dt * gear.userData.speed;
      });
      changing = true;
    }
    if (this.sorting) {
      const progress = this.motion.matches
        ? 1
        : Math.min(1, (time - this.sorting.start) / 1200);
      const p = progress * progress * (3 - 2 * progress);
      this.sorting.moves.forEach(({ bar, from, to }) => {
        bar.position.x = THREE.MathUtils.lerp(from, to, p);
        bar.position.z =
          -Math.sin(progress * Math.PI) * (to > from ? 0.65 : -0.65);
      });
      if (progress === 1) {
        this.sorting = null;
        this.status(
          "A little order. You can step through the comparisons in the workbench below.",
        );
      } else changing = true;
    }
    this.renderer.render(this.scene, this.camera);
    for (const { button, place } of this.markers) {
      if (this.compact) continue;
      const point = new THREE.Vector3(place.x, 3.4, place.z).project(
        this.camera,
      );
      button.style.left = `${(point.x * 0.5 + 0.5) * this.host.clientWidth}px`;
      button.style.top = `${(-point.y * 0.5 + 0.5) * this.host.clientHeight}px`;
    }
    if (changing) this.requestRender();
  }
  stop() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.last = 0;
  }
  destroy() {
    if (
      this.host
        .closest(".paper-world")
        ?.classList.contains("paper-world-immersive")
    )
      this.toggleImmersive(false);
    this.destroyed = true;
    this.stop();
    this.abort.abort();
    this.resizeObserver?.disconnect();
    this.intersection?.disconnect();
    this.themeObserver?.disconnect();
    const geometries = new Set();
    this.scene?.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
    });
    geometries.forEach((geometry) => geometry.dispose());
    this.materials.dispose();
    this.sun?.shadow.map?.dispose();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer?.domElement.remove();
    this.markerDock?.remove();
    this.host.dataset.worldState = "disposed";
  }
}
