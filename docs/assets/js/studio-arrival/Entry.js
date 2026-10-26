/* The invitation is a cover: open it, then let the paper plane lead the way. */
export function openNotebook({ dialog, world, complete }) {
  if (typeof Element.prototype.animate !== "function") { complete(); return () => {}; }
  const html = document.documentElement;
  const card = dialog.querySelector(".arrival-card");
  const source = dialog.querySelector(".arrival-plane");
  const origin = source.getBoundingClientRect();
  const bounds = source.getBBox();
  const stage = document.createElement("div");
  stage.className = "arrival-opening-pages";
  stage.setAttribute("aria-hidden", "true");
  const leaves = ["left", "right"].map((side) => {
    const leaf = document.createElement("div");
    leaf.className = `arrival-page arrival-page-${side}`;
    stage.append(leaf);
    return leaf;
  });
  const flight = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  flight.classList.add("arrival-entry-plane");
  flight.setAttribute("aria-hidden", "true");
  flight.setAttribute("viewBox", `${bounds.x - 3} ${bounds.y - 3} ${bounds.width + 6} ${bounds.height + 6}`);
  for (const path of source.children) flight.append(path.cloneNode(true));
  const padding = origin.width * 3 / bounds.width;
  Object.assign(flight.style, {
    left: `${origin.left - padding}px`, top: `${origin.top - padding}px`,
    width: `${origin.width + padding * 2}px`, height: `${origin.height + padding * 2}px`,
  });
  const animations = [];
  let disposed = false, timer = 0;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    clearTimeout(timer);
    for (const animation of animations) animation.cancel();
    stage.remove();
    flight.remove();
    dialog.classList.remove("arrival-opening");
  };
  const finish = () => {
    if (disposed) return;
    cleanup();
    complete();
  };
  const play = (element, keyframes, options) => {
    const animation = element.animate(keyframes, { fill: "both", ...options });
    animations.push(animation);
    return animation;
  };

  try {
    dialog.prepend(stage);
    dialog.append(flight);
    dialog.classList.add("arrival-opening");
    html.classList.add("studio-arrival-entering");
    html.classList.remove("studio-arrival-pending");
    const curve = "cubic-bezier(.45, 0, .18, 1)";
    play(card, [
      { transform: "perspective(1100px) rotateY(0deg) translateZ(0)" },
      { transform: "perspective(1100px) rotateY(-12deg) translateZ(24px)", offset: .22 },
      { transform: "perspective(1100px) rotateY(-106deg) translateZ(0)" },
    ], { duration: 760, easing: curve });
    leaves.forEach((leaf, index) => {
      const direction = index === 0 ? -1 : 1;
      play(leaf, [
        { transform: "rotateY(0deg)", filter: "brightness(1)" },
        { transform: `rotateY(${direction * 104}deg)`, filter: "brightness(.82)" },
      ], { delay: index === 0 ? 140 : 230, duration: 1020, easing: curve });
    });
    const target = world.getBoundingClientRect();
    const endX = Math.min(innerWidth - 28, Math.max(28, target.left + target.width * .47));
    const endY = Math.min(innerHeight + 55, target.top + target.height * .65);
    const dx = endX - origin.left - origin.width / 2;
    const dy = endY - origin.top - origin.height / 2;
    // Sample one Bezier curve so position and heading stay continuous through the bank.
    const lift = Math.min(95, innerWidth * .2);
    const flightFrames = Array.from({ length: 41 }, (_, index) => {
      const t = index / 40, u = 1 - t;
      const x = 3 * u * u * t * lift + 3 * u * t * t * (dx + lift) + t * t * t * dx;
      const y = -3 * u * u * t * 90 + 3 * u * t * t * (dy - 130) + t * t * t * dy;
      const vx = 3 * u * u * lift + 6 * u * t * dx - 3 * t * t * lift;
      const vy = -270 * u * u + 6 * u * t * (dy - 40) + 390 * t * t;
      const bank = (Math.atan2(vy, vx) * 180 / Math.PI + 32) * Math.min(1, t / .16);
      const scale = 1 + .1 * Math.sin(t * Math.PI) - .78 * t * t;
      return {
        offset: t, transform: `translate(${x}px, ${y}px) rotate(${bank}deg) scale(${scale})`,
        opacity: Math.min(1, (1 - t) / .16),
      };
    });
    play(flight, flightFrames, { duration: 1180, easing: "cubic-bezier(.3, .05, .3, 1)" });
    play(world, [
      { transform: "translateY(16px) scale(.975)" },
      { transform: "translateY(0) scale(1)" },
    ], { delay: 300, duration: 950, easing: "cubic-bezier(.2, .65, .25, 1)" });
    timer = setTimeout(finish, 1500);
    Promise.allSettled(animations.map((animation) => animation.finished)).then(finish);
    return cleanup;
  } catch {
    cleanup();
    throw new Error("Notebook entrance could not start");
  }
}
