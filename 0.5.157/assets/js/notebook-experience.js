/* A living notebook. All motion is finite and belongs to a reader action. */
(function () {
  "use strict";
  const query = new URLSearchParams(location.search);
  if (query.has("baseline") || query.get("flight") === "1") return;
  const assets = new URL("../", document.currentScript.src);
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const ns = "http://www.w3.org/2000/svg";
  const jobs = new Set();
  let planeData;
  let disposePage = () => {};
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function svg(tag, attrs = {}) {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  }
  function animate(duration, paint, done = () => {}) {
    if (motion.matches || document.hidden) { paint(1); done(); return () => {}; }
    let start, frame;
    const cancel = () => { cancelAnimationFrame(frame); jobs.delete(cancel); paint(1); done(); };
    jobs.add(cancel);
    function tick(now) {
      start ??= now;
      const t = Math.min((now - start) / duration, 1);
      paint(t);
      if (t < 1) frame = requestAnimationFrame(tick);
      else { jobs.delete(cancel); done(); }
    }
    frame = requestAnimationFrame(tick);
    return cancel;
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) [...jobs].forEach(cancel => cancel()); });
  motion.addEventListener("change", () => { if (motion.matches) [...jobs].forEach(cancel => cancel()); });
  function ink(path) {
    path.setAttribute("pathLength", "1");
    path.style.strokeDasharray = "1";
    animate(1000, t => { path.style.strokeDashoffset = String(1 - t); });
  }
  function sectionContent(heading) {
    const nodes = [];
    for (let next = heading.nextElementSibling; next && next.tagName !== "H2"; next = next.nextElementSibling) nodes.push(next);
    return nodes;
  }
  function icon(source) {
    const art = svg("svg", { viewBox: source?.getAttribute("viewBox") || "0 0 70 70", class: "margin-icon", "aria-hidden": "true" });
    if (source?.classList.contains("doodle-plane")) art.setAttribute("viewBox", "620 0 80 34");
    if (source) {
      const path = source.querySelector("path").cloneNode(true);
      path.removeAttribute("class"); path.removeAttribute("style"); path.removeAttribute("pathLength");
      art.appendChild(path);
    }
    return art;
  }
  function station(after, label, source, content) {
    const root = el("div", "margin-station");
    const button = el("button", "margin-action");
    button.type = "button";
    button.append(icon(source), el("span", "", label));
    button.setAttribute("aria-expanded", "false");
    const note = el("div", "margin-note");
    note.id = `note-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
    note.hidden = true;
    button.setAttribute("aria-controls", note.id);
    root.append(button, note); after.after(root);
    let built = false;
    button.addEventListener("click", () => {
      const open = note.hidden;
      note.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      if (open && !built) { content(note); built = true; }
      if (open) {
        if (!motion.matches) note.animate([{ transform: "translateY(5px)" }, { transform: "translateY(0)" }], { duration: 300 });
        note.querySelectorAll("path[data-ink]").forEach(ink);
      }
    });
    return button;
  }
  function threadNote(note) {
    const sketch = svg("svg", { viewBox: "0 0 520 90", class: "thread-sketch", "aria-hidden": "true" });
    const path = svg("path"); sketch.appendChild(path); note.appendChild(sketch);
    animate(1600, t => {
      const amplitude = 30 * (1 - t) + 3;
      const points = Array.from({ length: 90 }, (_, i) => `${i ? "L" : "M"}${10 + i * 5.6},${45 + Math.sin(i * (0.65 * (1 - t) + .12)) * amplitude}`);
      path.setAttribute("d", points.join(" "));
    });
    note.append(el("p", "", "A loose thread becomes a clearer thought."), el("p", "note-signature", "Small tools. Clear explanations. Something useful to pass on."));
  }
  function signalNote(note) {
    const sketch = svg("svg", { viewBox: "0 0 520 100", class: "signal-sketch", "aria-hidden": "true" });
    const wire = svg("path", { d: "M45 38 C150 -40 135 115 250 38 S365 -35 470 38", "data-ink": "" });
    sketch.appendChild(wire);
    for (const [x, name] of [[45, "PEOPLE"], [250, "TOOLS"], [470, "UNDERSTANDING"]]) {
      sketch.appendChild(svg("circle", { cx: x, cy: 38, r: 5, fill: "var(--paper)" }));
      const text = svg("text", { x, y: 78, "text-anchor": "middle" }); text.textContent = name; sketch.appendChild(text);
    }
    animate(1400, t => { const bend = 80 * (1 - t); wire.setAttribute("d", `M45 38 C150 ${38 - bend} 135 ${38 + bend} 250 38 S365 ${38 - bend} 470 38`); });
    note.append(sketch, el("p", "", "Getting people and tools to make sense to each other."));
  }
  function lifeNote(note) {
    const sketch = svg("svg", { viewBox: "0 0 520 110", class: "constellation-sketch", "aria-hidden": "true" });
    const points = [[125,55], [195,30], [260,60], [325,25], [400,55], [315,92], [220,94]];
    const wire = svg("path", { d: "M125 55 L195 30 L260 60 L325 25 L400 55 L315 92 L220 94 L125 55", "data-ink": "" });
    sketch.appendChild(wire);
    points.forEach(([x,y], i) => {
      const star = svg("circle", { cx: 35 + i * 72, cy: 10 + (i % 3) * 40, r: i === 2 ? 4 : 2.5 });
      sketch.appendChild(star);
      animate(1400, t => { const p = 1 - (1 - t) ** 3; star.setAttribute("cx", 35 + i * 72 + (x - 35 - i * 72) * p); star.setAttribute("cy", 10 + (i % 3) * 40 + (y - 10 - (i % 3) * 40) * p); });
    });
    note.append(sketch, el("p", "", "Family time. Little tools. Still a student."), el("p", "note-signature", "A few good things to keep close."));
  }
  async function travelNote(note) {
    const area = el("div", "travel-sketch");
    const art = svg("svg", { viewBox: "0 0 520 100", "aria-hidden": "true" });
    art.appendChild(svg("path", { d: "M24 68 C90 10 150 90 260 35 S390 85 496 50", class: "travel-route" }));
    const group = svg("g", { class: "travel-plane", transform: "translate(-8 44) scale(.7)" });
    // A simple ink plane remains available while Blender's optional poses load.
    group.appendChild(svg("path", { d: "M4 20 L60 3 L39 40 L30 24 Z M30 24 L60 3" }));
    art.appendChild(group); area.appendChild(art);
    const stops = el("div", "travel-stops");
    const caption = el("p", "travel-caption", "Nebraska is home."); caption.setAttribute("aria-live", "polite");
    const names = ["Nebraska", "Spain", "Germany", "Gibraltar", "Home"];
    const positions = [[24,68], [142,51], [260,35], [378,53], [496,50]];
    let current = 0, cancel = () => {}, polygons;
    const buttons = names.map((name, index) => {
      const button = el("button", "", name); button.type = "button";
      if (!index) button.setAttribute("aria-current", "location");
      button.addEventListener("click", () => {
        cancel(); const from = positions[current], to = positions[index]; current = index;
        buttons.forEach(item => item.removeAttribute("aria-current")); button.setAttribute("aria-current", "location");
        caption.textContent = index === 4 ? "The long way around. Back to the Midwest." : `${name}${index === 0 ? " is home." : ". A stop along the way."}`;
        const backwards = to[0] < from[0];
        cancel = animate(1500, t => {
          const p = t * t * (3 - 2 * t), x = from[0] + (to[0] - from[0]) * p, y = from[1] + (to[1] - from[1]) * p - Math.sin(t * Math.PI) * 28;
          group.setAttribute("transform", `translate(${x - 22} ${y - 17}) scale(.7)${backwards ? " translate(64 0) scale(-1 1)" : ""}`);
          if (polygons) {
            const frame = planeData.frames[Math.min(planeData.frames.length - 1, Math.floor(t * (planeData.frames.length - 1)))];
            planeData.faces.forEach((face, i) => polygons[i].setAttribute("points", face.map(v => `${frame[v*2]},${frame[v*2+1]}`).join(" ")));
          }
        });
      });
      stops.appendChild(button); return button;
    });
    note.append(area, stops, caption);
    try {
      planeData ||= await fetch(new URL("geometry/paper-flight.json", assets)).then(r => { if (!r.ok) throw Error("Unavailable"); return r.json(); });
      group.replaceChildren();
      polygons = planeData.faces.map(face => { const polygon = svg("polygon", { points: face.map(v => `${planeData.frames[0][v*2]},${planeData.frames[0][v*2+1]}`).join(" ") }); group.appendChild(polygon); return polygon; });
    } catch { /* The ink plane stays usable when its optional asset is unavailable. */ }
  }
  function workNote(note, heading) {
    const cards = el("div", "workbench");
    const links = sectionContent(heading).flatMap(node => [...node.querySelectorAll("li > a")]).slice(0, 3);
    links.forEach((source, i) => { const card = el("a", "", source.textContent); card.href = source.href; card.appendChild(el("small", "", ["A home for coding agents ↗", "Learn by building ↗", "What I learn, written down ↗"][i])); cards.appendChild(card); });
    note.append(cards, el("p", "note-signature", "One small tool at a time."));
  }
  function helloNote(note) {
    const art = svg("svg", { viewBox: "0 0 100 65", class: "envelope-sketch", "aria-hidden": "true" });
    art.appendChild(svg("path", { d: "M5 25 L50 3 L95 25 L95 60 L5 60 Z M5 25 L50 50 L95 25 M5 60 L35 43 M95 60 L65 43", "data-ink": "" }));
    const link = el("a", "", "Let's talk ↗"); link.href = "mailto:b.dev.c.m@gmail.com";
    note.append(art, el("p", "", "A stubborn problem, a small tool, or something to teach me?"), link);
  }
  function ending(article) {
    const root = el("section", "notebook-ending");
    root.setAttribute("aria-label", "Leave a little mark");
    root.append(el("p", "note-signature", "You made it to the bottom of the page. Leave a little of yourself here."));
    const board = svg("svg", { viewBox: "0 0 600 100", class: "guest-mark", role: "img", "aria-label": "Your notebook sketch" });
    const hint = svg("text", { x: 300, y: 55, "text-anchor": "middle" }); hint.textContent = "Draw a little something, or leave a star."; board.appendChild(hint);
    const actions = el("div", "mark-actions"), star = el("button", "note-button", "Leave a star"), clear = el("button", "note-button", "A clean corner");
    star.type = clear.type = "button";
    const thanks = el("p", "note-signature"); thanks.setAttribute("aria-live", "polite");
    const maxMarks = 64, maxSegments = 512;
    let drawn = null, count = 0, segments = 0;
    function point(event) {
      const matrix = board.getScreenCTM();
      if (!matrix) return [0, 0];
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      return [Math.max(0, Math.min(600, p.x)), Math.max(0, Math.min(100, p.y))];
    }
    function begin(event) {
      if (event.button !== 0 || drawn || board.querySelectorAll("path").length >= maxMarks) return;
      hint.remove(); board.setPointerCapture(event.pointerId); segments = 0;
      const [x,y] = point(event); drawn = svg("path", { d: `M${x.toFixed(1)} ${y.toFixed(1)}` }); board.appendChild(drawn);
    }
    board.addEventListener("pointerdown", begin);
    board.addEventListener("pointermove", event => { if (!drawn || segments >= maxSegments) return; segments++; const [x,y] = point(event); drawn.setAttribute("d", drawn.getAttribute("d") + ` L${x.toFixed(1)} ${y.toFixed(1)}`); });
    function finish() { if (drawn) thanks.textContent = "Thanks for leaving a little light here."; drawn = null; }
    board.addEventListener("pointerup", finish); board.addEventListener("pointercancel", finish);
    board.addEventListener("lostpointercapture", finish);
    star.addEventListener("click", () => {
      if (board.querySelectorAll("path").length >= maxMarks) return;
      hint.remove(); const x = 50 + (count++ * 83 % 500), y = 40 + (count % 2) * 20;
      const path = svg("path", { d: Array.from({length:11}, (_,i) => { const radius = i % 2 ? 6 : 14, angle = i * Math.PI / 5 - Math.PI / 2; return `${i ? "L" : "M"}${x + Math.cos(angle) * radius},${y + Math.sin(angle) * radius}`; }).join(" ") + "Z" });
      board.appendChild(path); ink(path); thanks.textContent = "Thanks for leaving a little light here.";
    });
    clear.addEventListener("click", () => { finish(); board.replaceChildren(hint); thanks.textContent = ""; count = 0; });
    actions.append(star, clear); root.append(board, actions, thanks); article.appendChild(root);
  }
  function init() {
    const article = document.querySelector("article.md-typeset");
    if (!article?.querySelector("#been-around")) { disposePage(); disposePage = () => {}; return; }
    if (article.classList.contains("notebook-experience")) return;
    disposePage();
    article.classList.add("notebook-experience");
    const title = article.querySelector("h1");
    title.before(el("div", "notebook-eyebrow notebook-arrival", "Field notes / a life in progress"));
    const introEnd = article.querySelector("h2").previousElementSibling;
    const intro = station(introEnd, "Pull the thread", article.querySelector(".doodle-yarn"), threadNote);
    const welcome = el("div", "notebook-welcome notebook-arrival");
    welcome.append(el("span", "", "A few stories. A few small tools. A little life in the margins."));
    const start = el("button", "notebook-start", "Follow the thread"); start.type = "button";
    start.addEventListener("click", () => { if (intro.getAttribute("aria-expanded") !== "true") intro.click(); intro.scrollIntoView({behavior: motion.matches ? "instant" : "smooth", block:"center"}); intro.focus({preventScroll:true}); });
    welcome.appendChild(start); title.nextElementSibling.after(welcome);
    const specs = [["the-day-job", "Find the signal", ".doodle-storm", signalNote], ["lately", "Gather the good stuff", ".doodle-cloud", lifeNote], ["been-around", "Take the long way home", ".doodle-plane", travelNote], ["building", "Open the workbench", ".doodle-bulb", workNote], ["connect", "Unfold a note", ".doodle-envelope", helloNote]];
    for (const [id,label,selector,build] of specs) {
      const heading = article.querySelector(`#${id}`), last = sectionContent(heading).at(-1);
      station(last, label, article.querySelector(selector), note => build(note, heading));
    }
    ending(article);
    const rail = el("nav", "reader-rail"); rail.setAttribute("aria-label", "Notebook chapters");
    const progress = el("div", "reader-progress"), bar = el("span"); progress.appendChild(bar); rail.appendChild(progress);
    const chapters = [[title, "01 / Intro"], ...specs.map(([id], i) => [article.querySelector(`#${id}`), ["02 / Work", "03 / Life", "04 / Places", "05 / Tools", "06 / Hello"][i]])];
    const anchors = chapters.map(([heading,name]) => { const link = el("a", "", name); link.href = `#${heading.id}`; rail.appendChild(link); return link; });
    document.body.appendChild(rail);
    let scheduled = false;
    function readerPosition() {
      scheduled = false;
      if (!article.isConnected) { rail.remove(); window.removeEventListener("scroll", onScroll); return; }
      const tops = chapters.map(([heading]) => heading.getBoundingClientRect().top);
      const current = Math.max(0, tops.findLastIndex(top => top < innerHeight * .4));
      anchors.forEach((anchor, i) => { if (i === current) anchor.setAttribute("aria-current", "location"); else anchor.removeAttribute("aria-current"); });
      bar.style.width = `${Math.min(100, Math.max(0, scrollY / (document.documentElement.scrollHeight - innerHeight) * 100))}%`;
    }
    function onScroll() { if (!scheduled) { scheduled = true; requestAnimationFrame(readerPosition); } }
    window.addEventListener("scroll", onScroll, {passive:true}); readerPosition();
    disposePage = () => { rail.remove(); window.removeEventListener("scroll", onScroll); [...jobs].forEach(cancel => cancel()); };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  if (typeof document$ !== "undefined") document$.subscribe(() => requestAnimationFrame(init));
})();
