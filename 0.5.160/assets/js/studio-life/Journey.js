import { FamilyIllustration } from "./Illustration.js";

export class LifeJourney {
  constructor(root) {
    this.root = root;
    this.events = new AbortController();
    this.motion = matchMedia("(prefers-reduced-motion: reduce)");
    this.chapters = [...root.querySelectorAll(".life-chapter")];
    this.years = this.chapters.map((chapter) => Number(chapter.dataset.year));
    this.milestones = this.chapters.map((chapter) => ({
      year: Number(chapter.dataset.year), land: chapter.dataset.land,
      arrival: chapter.hasAttribute("data-arrival"), wedding: chapter.hasAttribute("data-wedding"),
      beard: chapter.hasAttribute("data-beard"),
      hat: chapter.hasAttribute("data-hat"), thinning: chapter.hasAttribute("data-thinning"),
    }));
    this.links = [...root.querySelectorAll("[data-life-stop]")];
    this.range = root.querySelector(".life-range");
    this.play = root.querySelector(".life-play");
    this.scene = root.querySelector(".life-scene");
    this.year = this.years[0];
    this.target = this.year;
    this.playing = false;
    this.visible = false;
    this.destroyed = false;
    this.frame = 0;
    this.lastPaint = 0;
    this.gait = 0;
    this.phase = 0;
    this.illustration = null;
    this.chapter = null;
  }

  init() {
    const options = { signal: this.events.signal };
    this.root.addEventListener("click", (event) => {
      const link = event.target.closest("[data-life-stop]");
      const arrow = event.target.closest("[data-life-direction]");
      if (link) {
        event.preventDefault();
        event.stopPropagation();
        this.select(Number(link.dataset.lifeStop));
      } else if (arrow) {
        const index = this.chapters.indexOf(this.chapter);
        this.select(this.years[index + Number(arrow.dataset.lifeDirection)] ?? this.target);
      }
    }, options);
    this.range.addEventListener("input", () => this.scrub(Number(this.range.value)), options);
    this.range.addEventListener("change", () => this.settleScrub(), options);
    this.range.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      this.select(Math.round(this.target) + (event.key === "ArrowRight" ? 1 : -1));
    }, options);
    this.play.addEventListener("click", () => this.toggleWalk(), options);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.pause();
    }, options);
    this.motion.addEventListener("change", () => {
      if (this.motion.matches) this.select(this.target, false);
    }, options);
    this.visibility = new IntersectionObserver((entries) => {
      this.visible = entries[0].isIntersecting;
      if (this.visible) {
        this.loadIllustration();
        if (this.playing) this.schedule();
      }
      else {
        this.pause();
        this.year = this.target;
        this.illustration?.paint(this.year, 0, false);
        cancelAnimationFrame(this.frame);
        this.frame = 0;
      }
    }, { rootMargin: "150px" });
    this.visibility.observe(this.scene);
    this.range.disabled = false;
    this.play.disabled = false;
    this.root.classList.add("life-ready");
    const requested = Number(location.hash.match(/^#life-(\d{4})$/)?.[1]);
    this.select(this.years.includes(requested) ? requested : this.years[0], false);
    return this;
  }

  async loadIllustration() {
    if (this.loading || this.illustration || this.destroyed) return;
    this.loading = true;
    try {
      const image = this.scene.querySelector("img");
      const response = await fetch(image.src, { signal: this.events.signal });
      if (!response.ok) throw new Error("The illustrated walk is unavailable");
      const document = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
      if (document.querySelector("parsererror") || document.documentElement.localName !== "svg")
        throw new Error("The illustrated walk could not open");
      if (this.destroyed) return;
      const svg = window.document.importNode(document.documentElement, true);
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      this.illustration = new FamilyIllustration(svg, this.milestones);
      this.illustration.paint(this.year, 0, false);
      this.scene.append(svg);
      this.scene.dataset.sceneReady = "true";
    } catch {
      if (!this.destroyed) this.scene.dataset.sceneReady = "fallback";
    }
  }

  select(year, animate = true) {
    clearTimeout(this.scrubTimer);
    this.pause();
    this.target = Math.max(this.years[0], Math.min(this.years.at(-1), Number.isFinite(year) ? year : this.years[0]));
    this.updateChapter(this.target);
    if (this.motion.matches || !animate || !this.visible || !this.illustration) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.year = this.target;
      this.gait = 0;
      this.illustration?.paint(this.year, 0, false);
      this.root.dataset.lifeWalking = "false";
      return;
    }
    this.from = this.year;
    this.started = performance.now();
    if (this.gait === 0) this.lastPaint = this.started;
    this.duration = 850 + Math.min(Math.abs(this.target - this.year) * 90, 950);
    this.schedule();
  }

  scrub(year) {
    const previousGait = this.gait;
    this.select(year, false);
    if (this.motion.matches || !this.visible || !this.illustration) return;
    this.gait = Math.min(1, previousGait + .25);
    this.phase = (this.year - this.years[0]) * 8;
    this.illustration.paint(this.year, this.phase, true, this.gait);
    this.root.dataset.lifeWalking = "true";
    this.scrubTimer = setTimeout(() => this.settleScrub(), 120);
  }

  settleScrub() {
    clearTimeout(this.scrubTimer);
    if (this.destroyed || this.playing) return;
    if (this.motion.matches || !this.visible || !this.illustration) return this.select(this.target, false);
    this.from = this.year;
    this.target = this.year;
    this.started = performance.now();
    this.duration = 1;
    this.schedule();
  }

  updateChapter(year) {
    const index = Math.max(0, this.years.findLastIndex((value) => value <= year));
    const chapter = this.chapters[index];
    this.root.dataset.lifeYear = String(Math.floor(year));
    this.range.value = String(year);
    this.range.setAttribute("aria-valuetext", `${Math.floor(year)}: ${chapter.querySelector("h3").textContent}`);
    this.root.querySelector("output").value = String(Math.floor(year));
    if (this.chapter === chapter) return;
    this.chapter = chapter;
    for (const item of this.chapters) {
      item.inert = item !== chapter;
      item.setAttribute("aria-hidden", String(item !== chapter));
      item.classList.toggle("is-current", item === chapter);
    }
    for (const link of this.links) {
      if (Number(link.dataset.lifeStop) === this.years[index]) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    }
    this.root.querySelector(".life-place").textContent = chapter.dataset.location;
    this.root.querySelector(".life-family-count").textContent = chapter.dataset.family;
    this.scene.setAttribute("aria-label", `${chapter.dataset.location}. ${chapter.dataset.family}`);
    this.root.querySelector('[data-life-direction="-1"]').disabled = index === 0;
    this.root.querySelector('[data-life-direction="1"]').disabled = index === this.years.length - 1;
    const nav = this.links[index].parentElement;
    const itemBox = this.links[index].getBoundingClientRect();
    const navBox = nav.getBoundingClientRect();
    if (itemBox.left < navBox.left || itemBox.right > navBox.right)
      nav.scrollTo({ left: nav.scrollLeft + itemBox.left - navBox.left - (nav.clientWidth - itemBox.width) / 2, behavior: "instant" });
  }

  toggleWalk() {
    if (this.playing) return this.pause();
    if (this.motion.matches) return;
    this.playing = true;
    this.play.setAttribute("aria-pressed", "true");
    this.play.textContent = "Pause here Ⅱ";
    if (this.year >= this.years.at(-1) - .1) this.year = this.years[0];
    this.from = this.year;
    this.started = performance.now();
    if (this.gait === 0) this.lastPaint = this.started;
    this.schedule();
  }

  pause() {
    clearTimeout(this.scrubTimer);
    if (this.playing) {
      this.target = this.year;
      this.from = this.year;
      this.started = performance.now();
      this.duration = 1;
    }
    this.playing = false;
    const offscreen = !this.visible || document.hidden;
    if (offscreen) {
      this.gait = 0;
      this.illustration?.paint(this.year, 0, false);
    }
    this.root.dataset.lifeWalking = String(this.gait > .005 && !offscreen);
    this.play.setAttribute("aria-pressed", "false");
    this.play.textContent = "Play the walk ↗";
  }

  schedule() {
    if (!this.frame && !this.destroyed)
      this.frame = requestAnimationFrame((now) => this.tick(now));
  }

  tick(now) {
    this.frame = 0;
    if (this.destroyed || !this.visible || document.hidden) return;
    if (now - this.lastPaint < 30) return this.schedule();
    const delta = Math.min(.06, (now - this.lastPaint) / 1000);
    this.lastPaint = now;
    let moving;
    if (this.playing) {
      this.year = Math.min(this.years.at(-1), this.from + (now - this.started) / 2100);
      this.target = this.year;
      this.updateChapter(this.year);
      moving = this.year < this.years.at(-1);
      if (!moving) this.pause();
    } else {
      const t = Math.min(1, (now - this.started) / this.duration);
      const eased = t * t * t * (t * (t * 6 - 15) + 10);
      this.year = this.from + (this.target - this.from) * eased;
      moving = t < 1;
    }
    this.gait += ((moving ? 1 : 0) - this.gait) * (1 - Math.exp(-delta * (moving ? 9 : 16)));
    if (!moving && this.gait < .005) this.gait = 0;
    this.phase += delta * 8.7;
    const active = moving || this.gait > 0;
    this.root.dataset.lifeWalking = String(active);
    this.illustration?.paint(this.year, this.phase, active, this.gait);
    if (active) this.schedule();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.events.abort();
    this.visibility?.disconnect();
    cancelAnimationFrame(this.frame);
    clearTimeout(this.scrubTimer);
    this.scene.querySelector("svg")?.remove();
    this.scene.removeAttribute("data-scene-ready");
    this.root.classList.remove("life-ready");
    for (const chapter of this.chapters) {
      chapter.inert = false;
      chapter.removeAttribute("aria-hidden");
    }
  }
}
