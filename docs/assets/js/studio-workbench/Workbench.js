import * as THREE from "../../vendor/three/three.module.min.js";
import { PaperMaterials } from "../studio-world/materials.js";
import { places } from "../studio-world/projects.js";
import { makeBenchObjects } from "./models.js";
import { frameBox, setFrustum } from "../scene-framing.js";

export class Workbench {
  constructor(host) {
    this.host = host;
    this.section = host.closest(".studio-projects");
    this.root = host.closest(".studio-home");
    this.abort = new AbortController();
    this.materials = new PaperMaterials();
    this.motion = matchMedia("(prefers-reduced-motion: reduce)");
    this.frame = 0;
    this.last = 0;
    this.visible = true;
    this.destroyed = false;
    this.selection = null;
    this.compact = matchMedia("(max-width:1100px), (pointer:coarse)").matches;
    this.focus = new THREE.Vector3(0, 0.65, -0.4);
    this.focusTarget = this.focus.clone();
    this.viewSpan = 12;
    this.spanTarget = 12;
    this.inspectTarget = 0;
    this.drawing = false;
    this.stroke = null;
    this.strokeCount = 0;
    this.agentStep = -1;
    this.gearUntil = 0;
    this.tool = null;
    this.keyUntil = 0;
    this.textureSignature = "";
    this.ray = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.drag = null;
  }
  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-8, 8, 6, -6, 0.1, 70);
    this.camera.position.set(6.3, 9.5, 13);
    this.camera.lookAt(0, 0.65, -0.4);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(
      Math.min(devicePixelRatio, this.compact ? 1.4 : 1.7),
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    const canvas = this.renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Project workbench. Click an object to pick it up. Drag to turn it. Left and right arrow keys choose a project. R resets the view.",
    );
    this.host.prepend(canvas);
    this.scene.add(new THREE.AmbientLight("#fff7e7", 2.2));
    this.sun = new THREE.DirectionalLight("#ffe7be", 3);
    this.sun.position.set(-6, 14, 8);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(
      this.compact ? 512 : 1024,
      this.compact ? 512 : 1024,
    );
    Object.assign(this.sun.shadow.camera, {
      left: -10,
      right: 10,
      top: 9,
      bottom: -9,
      near: 1,
      far: 40,
    });
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.025;
    this.scene.add(this.sun);
    const models = makeBenchObjects(this.materials);
    this.objects = models.objects;
    this.objectBounds = new Map();
    this.objects.forEach((artifact, id) =>
      this.objectBounds.set(id, new THREE.Box3().setFromObject(artifact.group)),
    );
    this.scene.add(models.desk);
    this.objects.forEach((artifact) => this.scene.add(artifact.group));
    this.targets = new Map();
    this.makeLabels();
    this.bindInput();
    this.selectionObserver = new MutationObserver(() => {
      this.overview = false;
      this.readState();
      this.arrangeObjects();
    });
    this.selectionObserver.observe(
      this.section.querySelector(".studio-project-list"),
      { subtree: true, attributes: true, attributeFilter: ["aria-current"] },
    );
    this.stateObserver = new MutationObserver(() => this.readState());
    this.stateObserver.observe(
      this.section.querySelector(".studio-experiments"),
      {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["aria-current", "aria-pressed", "d"],
      },
    );
    this.themeObserver = new MutationObserver(() => {
      this.updateTheme();
      this.paintNotebook();
    });
    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"],
    });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.intersection = new IntersectionObserver((entries) => {
      this.visible = entries[0].isIntersecting;
      if (this.visible) this.requestRender();
      else this.stop();
    });
    this.intersection.observe(this.host);
    this.readState();
    this.resize();
    this.updateTheme();
    this.host.dataset.benchState = "ready";
    this.section.classList.add("bench-live");
    this.requestRender();
    return this;
  }
  makeLabels() {
    this.labels = [];
    this.labelDock = document.createElement("nav");
    this.labelDock.className = "bench-object-choices";
    this.labelDock.setAttribute("aria-label", "Pick up an object");
    this.host.appendChild(this.labelDock);
    this.drawGuide = document.createElement("span");
    this.drawGuide.className = "bench-pencil-target";
    this.drawGuide.textContent = "draw here";
    this.drawGuide.setAttribute("aria-hidden", "true");
    this.drawGuide.hidden = true;
    this.host.appendChild(this.drawGuide);
    for (const place of places) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bench-object-label";
      button.dataset.benchProject = place.id;
      button.setAttribute("aria-label", `Pick up ${place.project}`);
      button.textContent = `${place.number} / ${place.name}`;
      button.addEventListener("click", () => this.choose(place.id), {
        signal: this.abort.signal,
      });
      this.labelDock.appendChild(button);
      this.labels.push({ place, button });
    }
  }
  choose(id) {
    if (!this.objects.has(id)) return;
    this.overview = false;
    this.arrangeObjects();
    this.root.dispatchEvent(
      new CustomEvent("studio:select-project", { detail: { id } }),
    );
  }
  readState() {
    const chosen =
      this.section.querySelector("[data-project][aria-current]")?.dataset
        .project || "jarvis";
    if (chosen !== this.selection) {
      this.selection = chosen;
      this.inspectTarget = 0;
      this.setDrawing(false);
      this.overview = false;
      this.arrangeObjects();
      const place = places.find((place) => place.id === chosen);
      this.section.querySelector(".bench-active-caption").textContent =
        `${place.number} / ${place.name}`;
      this.section.querySelector("[data-bench-draw]").hidden =
        chosen !== "notebook";
      this.host.dataset.activeProject = chosen;
      this.labels.forEach(({ place, button }) =>
        button.setAttribute("aria-pressed", String(place.id === chosen)),
      );
    }
    const tool =
      this.section.querySelector("[data-tool][aria-pressed='true']")?.dataset
        .tool || null;
    if (tool !== this.tool) {
      this.tool = tool;
      this.keyUntil = performance.now() + 260;
      this.paintTerminal();
    } else if (!this.terminalPainted) this.paintTerminal();
    const currentStep = Number(
      this.section.querySelector("[data-agent-step][aria-current]")?.dataset
        .agentStep || 0,
    );
    if (currentStep !== this.agentStep) {
      this.agentStep = currentStep;
      this.gearUntil =
        currentStep === 1 || currentStep === 3 ? performance.now() + 1400 : 0;
      this.paintPlacard();
    }
    this.values = [
      ...this.section.querySelectorAll(".studio-sort-bars > span"),
    ].map((node) => Number(node.textContent));
    this.comparing = new Set(
      [
        ...this.section.querySelectorAll(
          ".studio-sort-bars > span[data-comparing]",
        ),
      ].map((node) => Number(node.textContent)),
    );
    this.paintNotebook();
    this.requestRender();
  }
  arrangeObjects() {
    if (!this.selection) return;
    const shelf = [
      [-4.35, -2.7],
      [0, -3.9],
      [4.35, -2.7],
    ];
    const spread = [
      [-3.2, -2.1],
      [3.2, -2.1],
      [-3.2, 2.4],
      [3.2, 2.4],
    ];
    let index = 0;
    this.objects.forEach((artifact, id) => {
      const active = id === this.selection;
      const position = this.overview
        ? spread[index++]
        : active
          ? [0, 1.2]
          : shelf[index++];
      this.targets.set(id, {
        position: new THREE.Vector3(position[0], 0, position[1]),
        scale: this.overview ? 0.72 : active ? 1.5 : 0.38,
      });
    });
    this.host.dataset.benchMode = this.overview ? "overview" : "closeup";
    this.section.querySelector("[data-bench-turn]").disabled = Boolean(
      this.overview,
    );
    const hints = {
      jarvis: "Click a key to try another tool. Drag the terminal to turn it.",
      agent:
        "Make a plan, then decide what happens next. Drag to inspect the gears.",
      algorithm: "Click a block for the next comparison. Watch the pair move.",
      notebook:
        "Pick up the pencil to draw on the page. Your sketch stays in this tab.",
    };
    this.section.querySelector(".bench-action-hint").textContent = this.overview
      ? "Back on the workbench. Pick up whatever catches your eye."
      : hints[this.selection];
    this.resize();
    this.requestRender();
  }
  frameSelection() {
    if (!this.camera || !this.selection || !this.host.clientHeight) return;
    const aspect = this.aspect || 1;
    if (!this.compact || this.overview) {
      this.focusTarget.set(0, 0.65, -0.4);
      this.spanTarget = Math.max(8.8, 14 / aspect);
      return;
    }
    const target = this.targets.get(this.selection);
    if (!target) return;
    const matrix = new THREE.Matrix4().compose(
      target.position,
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), this.inspectTarget,
      ),
      new THREE.Vector3().setScalar(target.scale),
    );
    const box = this.objectBounds.get(this.selection).clone().applyMatrix4(matrix);
    const framing = frameBox(box, this.camera, aspect);
    this.focusTarget.copy(framing.center);
    this.spanTarget = Math.max(6.5, framing.span);
  }
  paintTerminal() {
    const { crtCanvas, crtTexture } = this.objects.get("jarvis");
    const ctx = crtCanvas.getContext("2d"),
      w = crtCanvas.width,
      h = crtCanvas.height;
    ctx.fillStyle = "#243e32";
    ctx.fillRect(0, 0, w, h);
    const lines = [
      ["$ terminal-jarvis", 34, "#dbd6a8"],
      ["choose a tool", 25, "#a9bfa4"],
    ];
    let y = 62;
    for (const [text, size, color] of lines) {
      ctx.font = `${size}px monospace`;
      ctx.fillStyle = color;
      ctx.fillText(text, 45, y);
      y += 56;
    }
    [
      ["codex", "Codex"],
      ["claude", "Claude Code"],
      ["gemini", "Gemini CLI"],
    ].forEach(([id, name], index) => {
      const selected = this.tool === id;
      if (selected) {
        ctx.fillStyle = "#dce7c8";
        ctx.fillRect(32, 169 + index * 63, w - 64, 52);
      }
      ctx.fillStyle = selected ? "#2b4636" : "#d8e3c7";
      ctx.font = "29px monospace";
      ctx.fillText(`${selected ? ">" : " "} ${name}`, 49, 205 + index * 63);
    });
    ctx.font = "20px monospace";
    ctx.fillStyle = "#a4ba9b";
    ctx.fillText(
      this.tool
        ? "a small browser sketch / explore the source"
        : "one place to start exploring",
      45,
      h - 38,
    );
    ctx.strokeStyle = "#22382c33";
    for (let row = 0; row < h; row += 5) {
      ctx.beginPath();
      ctx.moveTo(0, row);
      ctx.lineTo(w, row);
      ctx.stroke();
    }
    crtTexture.needsUpdate = true;
    this.terminalPainted = true;
  }
  paintPlacard() {
    const { placardCanvas, placardTexture } = this.objects.get("agent"),
      ctx = placardCanvas.getContext("2d");
    ctx.fillStyle = "#f7f0df";
    ctx.fillRect(0, 0, 768, 256);
    ctx.textAlign = "center";
    ctx.fillStyle = this.agentStep === 2 ? "#955839" : "#3f614b";
    ctx.font = "36px monospace";
    ctx.fillText(
      ["YOUR QUESTION", "MAKE A PLAN", "YOUR CALL", "TRY, THEN REVIEW"][
        this.agentStep
      ],
      384,
      105,
    );
    ctx.font = "22px monospace";
    ctx.fillText(
      this.agentStep === 2 ? "WAITING FOR YOUR APPROVAL" : "HUMAN IN THE LOOP",
      384,
      165,
    );
    placardTexture.needsUpdate = true;
  }
  paintNotebook() {
    const pad = this.section.querySelector(".studio-sketchpad");
    const ink =
      this.section.querySelector("[data-ink][aria-pressed='true']")?.dataset
        .ink || "pine";
    // The physical page stays cream in either theme, so it keeps paper-safe inks.
    const color =
      { pine: "#3f6552", clay: "#995637", blue: "#365e7d" }[ink] || "#3f6552";
    const paths = [...pad.querySelectorAll("path")].map((path) =>
      path.getAttribute("d"),
    );
    const signature = color + paths.join("|");
    if (signature === this.textureSignature) return;
    this.textureSignature = signature;
    const { sketchCanvas, sketchTexture } = this.objects.get("notebook"),
      ctx = sketchCanvas.getContext("2d");
    ctx.fillStyle = "#f5efdf";
    ctx.fillRect(0, 0, 1000, 640);
    ctx.strokeStyle = "#b8c3bc88";
    ctx.lineWidth = 1.4;
    for (let y = 40; y < 640; y += 38) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(980, y);
      ctx.stroke();
    }
    if (paths.length) {
      ctx.save();
      ctx.scale(2, 4);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      paths.forEach((path) => ctx.stroke(new Path2D(path)));
      ctx.restore();
    } else {
      ctx.fillStyle = "#7b806d";
      ctx.font = "italic 34px Georgia";
      ctx.textAlign = "center";
      ctx.fillText("A little room for you.", 500, 260);
      ctx.font = "22px monospace";
      ctx.fillText("pick up the pencil", 500, 320);
    }
    sketchTexture.needsUpdate = true;
  }
  bindInput() {
    const canvas = this.renderer.domElement,
      options = { signal: this.abort.signal };
    canvas.addEventListener(
      "pointerdown",
      (event) => {
        if (event.button !== 0 || !event.isPrimary) return;
        if (
          this.drawing &&
          this.selection === "notebook" &&
          this.beginStroke(event)
        ) {
          canvas.setPointerCapture(event.pointerId);
          return;
        }
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
        if (this.stroke) {
          this.extendStroke(event);
          return;
        }
        if (this.drag) {
          const dx = event.clientX - this.drag.x,
            dy = event.clientY - this.drag.y;
          if (!this.drag.moved && Math.hypot(dx, dy) > 8) {
            this.drag.moved = true;
            this.drag.horizontal = Math.abs(dx) > Math.abs(dy);
          }
          if (this.drag.moved && this.drag.horizontal && !this.overview) {
            this.inspectTarget += (event.clientX - this.drag.lastX) * 0.012;
            this.requestRender();
          }
          this.drag.lastX = event.clientX;
        }
      },
      options,
    );
    canvas.addEventListener(
      "pointerup",
      (event) => {
        if (this.stroke) {
          this.stroke = null;
          return;
        }
        const drag = this.drag;
        this.drag = null;
        if (!drag || drag.moved) return;
        this.setPointer(event);
        this.ray.setFromCamera(this.pointer, this.camera);
        const hit = this.ray.intersectObjects(
          [...this.objects.values()]
            .filter((artifact) =>
              !this.compact || this.overview || artifact.id === this.selection,
            )
            .map((artifact) => artifact.group),
          true,
        )[0];
        if (!hit) return;
        let object = hit.object;
        while (object && !object.userData.project) object = object.parent;
        if (!object) return;
        const id = object.userData.project;
        if (this.overview || id !== this.selection) {
          this.choose(id);
          return;
        }
        if (id === "jarvis") {
          const tools = [...this.section.querySelectorAll("[data-tool]")];
          const current = tools.findIndex(
            (button) => button.getAttribute("aria-pressed") === "true",
          );
          tools[(current + 1) % tools.length].click();
        } else if (id === "algorithm")
          this.section.querySelector("[data-sort-step]").click();
        else if (id === "agent") {
          const next = this.section.querySelector("[data-agent-next]");
          if (this.agentStep === 2) next.focus({ preventScroll: true });
          else next.click();
        }
      },
      options,
    );
    for (const type of ["pointercancel", "lostpointercapture"])
      canvas.addEventListener(
        type,
        () => {
          this.stroke = null;
          this.drag = null;
        },
        options,
      );
    canvas.addEventListener(
      "keydown",
      (event) => {
        const ids = places.map((place) => place.id),
          index = ids.indexOf(this.selection);
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          this.choose(ids[(index + (event.key === "ArrowRight" ? 1 : 3)) % 4]);
        } else if (event.key.toLowerCase() === "r") {
          this.inspectTarget = 0;
          this.requestRender();
        }
      },
      options,
    );
    this.section.querySelector("[data-bench-reset]").addEventListener(
      "click",
      () => {
        this.inspectTarget = 0;
        this.setDrawing(false);
        this.overview = true;
        this.arrangeObjects();
        this.requestRender();
      },
      options,
    );
    this.section.querySelector("[data-bench-turn]").addEventListener(
      "click",
      () => {
        this.inspectTarget += Math.PI / 3;
        this.requestRender();
      },
      options,
    );
    this.section
      .querySelector("[data-bench-draw]")
      .addEventListener("click", () => this.setDrawing(!this.drawing), options);
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) this.stop();
        else this.requestRender();
      },
      options,
    );
    this.motion.addEventListener(
      "change",
      () => {
        this.gearUntil = 0;
        this.requestRender();
      },
      options,
    );
    canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        this.stop();
        this.section.classList.remove("bench-live");
        this.host.dataset.benchState = "fallback";
      },
      options,
    );
    canvas.addEventListener(
      "webglcontextrestored",
      () => {
        this.section.classList.add("bench-live");
        this.host.dataset.benchState = "ready";
        this.requestRender();
      },
      options,
    );
  }
  setDrawing(active) {
    this.drawing = active;
    if (active) {
      this.overview = false;
      this.arrangeObjects();
      const artifact = this.objects.get("notebook"),
        target = this.targets.get("notebook");
      artifact.group.position.copy(target.position);
      artifact.group.scale.setScalar(target.scale);
      artifact.group.rotation.y = 0;
    }
    this.stroke = null;
    this.inspectTarget = 0;
    const button = this.section.querySelector("[data-bench-draw]");
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? "Put the pencil down" : "Pick up the pencil";
    this.host.classList.toggle("bench-drawing", active);
    if (active) {
      // Keep the page still under the pencil, even during a quick project change.
      this.frameSelection();
      this.focus.copy(this.focusTarget);
      this.viewSpan = this.spanTarget;
    }
    this.requestRender();
  }
  setPointer(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
  }
  strokePoint(event) {
    this.setPointer(event);
    this.ray.setFromCamera(this.pointer, this.camera);
    const hit = this.ray.intersectObject(
      this.objects.get("notebook").sketchSurface,
    )[0];
    return hit?.uv ? [hit.uv.x * 500, (1 - hit.uv.y) * 160] : null;
  }
  beginStroke(event) {
    const point = this.strokePoint(event),
      pad = this.section.querySelector(".studio-sketchpad");
    if (!point || pad.querySelectorAll("path").length >= 64) return false;
    pad.querySelector("text")?.remove();
    this.strokeCount = 0;
    this.stroke = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    this.stroke.setAttribute(
      "d",
      `M${point[0].toFixed(1)} ${point[1].toFixed(1)}`,
    );
    pad.appendChild(this.stroke);
    this.section.querySelector(".studio-mark-status").textContent =
      "A little of you, on the page. This sketch isn’t saved or shared.";
    return true;
  }
  extendStroke(event) {
    if (this.strokeCount >= 512) return;
    const point = this.strokePoint(event);
    if (!point) return;
    this.strokeCount++;
    this.stroke.setAttribute(
      "d",
      `${this.stroke.getAttribute("d")} L${point[0].toFixed(1)} ${point[1].toFixed(1)}`,
    );
  }
  updateTheme() {
    const dark = document.body.dataset.mdColorScheme === "slate";
    this.renderer.setClearColor(dark ? "#1d2723" : "#f8f5ed", 0);
    this.renderer.toneMappingExposure = dark ? 0.95 : 1.15;
    this.requestRender();
  }
  resize() {
    this.compact = matchMedia("(max-width:1100px), (pointer:coarse)").matches;
    const width = this.host.clientWidth,
      height = this.host.clientHeight -
        (this.compact && this.overview ? this.labelDock.offsetHeight : 0);
    if (!width || !height || this.destroyed) return;
    this.renderer.setSize(width, height, false);
    this.aspect = width / height;
    this.frameSelection();
    setFrustum(this.camera, this.viewSpan, width / height);
    this.requestRender();
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
    const ease = this.motion.matches ? 1 : 1 - Math.exp(-dt * 8);
    let moving = false;
    this.frameSelection();
    this.objects.forEach((artifact, id) => {
      const target = this.targets.get(id);
      if (!target) return;
      artifact.group.visible = !this.compact || this.overview || id === this.selection;
      artifact.group.position.lerp(target.position, ease);
      const scale = THREE.MathUtils.lerp(
        artifact.group.scale.x,
        target.scale,
        ease,
      );
      artifact.group.scale.setScalar(scale);
      const yaw = !this.overview && id === this.selection ? this.inspectTarget : 0;
      artifact.group.rotation.y += (yaw - artifact.group.rotation.y) * ease;
      if (Math.abs(yaw - artifact.group.rotation.y) > 0.001) moving = true;
      if (
        artifact.group.position.distanceTo(target.position) > 0.005 ||
        Math.abs(scale - target.scale) > 0.001
      )
        moving = true;
    });
    const agent = this.objects.get("agent");
    if (
      this.selection === "agent" &&
      time < this.gearUntil &&
      !this.motion.matches
    ) {
      agent.gears.forEach(
        (gear) => (gear.rotation.y += dt * gear.userData.speed),
      );
      moving = true;
    }
    agent.lever.rotation.z = THREE.MathUtils.lerp(
      agent.lever.rotation.z,
      this.agentStep === 2 ? 0.45 : -0.18,
      ease,
    );
    const algorithm = this.objects.get("algorithm");
    if (this.values?.length === 8)
      this.values.forEach((value, index) => {
        const bar = algorithm.bars.get(value);
        if (!bar) return;
        const target = -1.78 + index * 0.51;
        bar.root.position.x = THREE.MathUtils.lerp(
          bar.root.position.x,
          target,
          ease,
        );
        if (Math.abs(bar.root.position.x - target) > 0.003) moving = true;
        bar.material.emissive.set(
          this.comparing.has(value) ? "#8d421b" : "#000000",
        );
        bar.material.emissiveIntensity = this.comparing.has(value) ? 0.18 : 0;
      });
    if (
      this.selection === "jarvis" &&
      time < this.keyUntil &&
      !this.motion.matches
    ) {
      this.objects.get("jarvis").keys.forEach((key, index) => {
        key.position.y =
          0.36 -
          (index % 3 === 0 ? 0.035 : 0) *
            Math.sin((1 - (this.keyUntil - time) / 260) * Math.PI);
      });
      moving = true;
    }
    this.focus.lerp(this.focusTarget, ease);
    this.viewSpan = THREE.MathUtils.lerp(this.viewSpan, this.spanTarget, ease);
    if (
      this.focus.distanceTo(this.focusTarget) > 0.005 ||
      Math.abs(this.viewSpan - this.spanTarget) > 0.005
    ) moving = true;
    this.camera.position.copy(this.focus).add(new THREE.Vector3(6.3, 8.85, 13.4));
    this.camera.lookAt(this.focus);
    setFrustum(this.camera, this.viewSpan, this.aspect || 1);
    this.camera.updateMatrixWorld();
    this.renderer.render(this.scene, this.camera);
    for (const { place, button } of this.labels) {
      const artifact = this.objects.get(place.id);
      button.hidden = !this.overview && (this.compact || place.id === this.selection);
      const point = new THREE.Vector3()
        .copy(artifact.group.position)
        .add(new THREE.Vector3(0, 1.65 * artifact.group.scale.x, 0))
        .project(this.camera);
      button.style.left = `${(point.x * 0.5 + 0.5) * this.host.clientWidth}px`;
      button.style.top = `${(-point.y * 0.5 + 0.5) * this.host.clientHeight}px`;
    }
    this.drawGuide.hidden =
      !this.drawing ||
      this.selection !== "notebook" ||
      this.section.querySelector(".studio-sketchpad path") !== null;
    if (!this.drawGuide.hidden) {
      const point = this.objects
        .get("notebook")
        .sketchSurface.getWorldPosition(new THREE.Vector3())
        .project(this.camera);
      this.drawGuide.style.left = `${(point.x * 0.5 + 0.5) * this.host.clientWidth}px`;
      this.drawGuide.style.top = `${(-point.y * 0.5 + 0.5) * this.host.clientHeight}px`;
    }
    if (moving) this.requestRender();
  }
  stop() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.last = 0;
  }
  destroy() {
    this.destroyed = true;
    this.stop();
    this.abort.abort();
    this.selectionObserver?.disconnect();
    this.stateObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.resizeObserver?.disconnect();
    this.intersection?.disconnect();
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
    this.drawGuide?.remove();
    this.labelDock?.remove();
    this.section.classList.remove("bench-live");
  }
}
