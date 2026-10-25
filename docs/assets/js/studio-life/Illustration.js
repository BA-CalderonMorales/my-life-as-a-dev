import { ArmRig, infantContacts } from "./ArmRig.js";

const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const soften = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };

export class FamilyIllustration {
  constructor(svg, chapters) {
    this.svg = svg;
    this.chapters = chapters;
    this.births = chapters.filter((chapter) => chapter.arrival).map((chapter) => chapter.year);
    this.wedding = chapters.find((chapter) => chapter.wedding)?.year;
    this.beardYear = chapters.find((chapter) => chapter.beard)?.year ?? Infinity;
    this.beard = svg.querySelector(".life-beard");
    this.hatYear = chapters.find((chapter) => chapter.hat)?.year ?? Infinity;
    this.thinningYear = chapters.find((chapter) => chapter.thinning)?.year ?? Infinity;
    this.hat = svg.querySelector(".life-hat");
    this.fullHair = svg.querySelector(".life-hair-full");
    this.thinHair = svg.querySelector(".life-hair-thin");
    this.dad = svg.querySelector(".life-person-dad");
    this.mum = svg.querySelector(".life-person-mum");
    this.first = svg.querySelector(".life-child-first");
    this.second = svg.querySelector(".life-child-second");
    this.future = svg.querySelector(".life-future");
    this.scenery = [...svg.querySelectorAll(".life-scenery")];
    this.nearby = svg.querySelector(".life-nearby");
    this.repeat = this.nearby.cloneNode(true);
    this.repeat.removeAttribute("class");
    this.nearby.after(this.repeat);
    const gaitPhase = (node) => {
      const side = node.classList.contains("life-leg-right") || node.classList.contains("life-arm-right") ? 0 : Math.PI;
      const arm = node.classList.contains("life-arm") ? Math.PI : 0;
      const offset = node.closest("#life-mum") ? .55 : node.closest("#life-kid") ? 1.15 : 0;
      return side + arm + offset;
    };
    this.arms = [...svg.querySelectorAll(".life-arm")].map((node) => new ArmRig(node, svg, gaitPhase(node)));
    this.limbs = [...svg.querySelectorAll(".life-leg")].map((node) => ({
      node, base: node.getAttribute("transform"), phase: gaitPhase(node),
      amplitude: node.classList.contains("life-leg") ? 18 : 12,
    }));
    this.shins = [...svg.querySelectorAll(".life-shin")].map((node) => ({
      node, base: node.getAttribute("transform"), phase: gaitPhase(node.closest(".life-leg")),
    }));
    this.softParts = [...svg.querySelectorAll(".life-skirt, .life-hair-tail")].map((node) => ({
      node, base: node.getAttribute("transform"), amplitude: node.classList.contains("life-skirt") ? 1.4 : 2,
    }));
  }

  paint(year, phase, walking, strength = 1) {
    const [first, second, third] = this.births.map((birth) => soften((year - birth + .65) / .65));
    const bob = walking ? Math.abs(Math.sin(phase)) * 2 * strength : 0;
    this.beard.style.opacity = soften((year - this.beardYear + .65) / .65);
    this.hat.style.opacity = soften((year - this.hatYear + .65) / .65);
    const thinning = soften((year - this.thinningYear + .65) / .65);
    this.fullHair.style.opacity = 1 - thinning;
    this.thinHair.style.opacity = thinning;
    const dadX = 453 - first * 48 - second * 35 - third * 9;
    const mumX = 550 - first * 35 - second * 30 - third * 10;
    this.dad.setAttribute("transform", `translate(${dadX} ${128 - bob})`);
    this.mum.setAttribute("transform", `translate(${mumX} ${128 - bob * .8})`);
    const firstCarry = this.paintChild(this.first, year - this.births[0], first, 590, mumX + 20, bob, bob * .8);
    const secondCarry = this.paintChild(this.second, year - this.births[1], second, 658, dadX + 24, bob * 1.3, bob);
    this.future.style.opacity = third;
    this.future.setAttribute("transform", `translate(${mumX + 20} ${236 - bob * .8}) rotate(-18) scale(.72)`);
    const mumCarry = clamp(firstCarry + third);
    const mumContacts = infantContacts(third > 0 ? this.future : this.first.querySelector(".life-child-bundle"));
    const dadContacts = infantContacts(this.second.querySelector(".life-child-bundle"));
    for (const arm of this.arms) {
      if (arm.owner === "mum") arm.paint(phase, walking, strength, mumCarry, mumContacts, { x: mumX, y: 128 - bob * .8 });
      else if (arm.owner === "dad") arm.paint(phase, walking, strength, secondCarry, dadContacts, { x: dadX, y: 128 - bob });
      else arm.paint(phase, walking, strength);
    }
    const index = Math.max(0, this.chapters.findLastIndex((chapter) => chapter.year <= year));
    const current = this.chapters[index], next = this.chapters[index + 1];
    const blend = next ? soften((year - next.year + .65) / .65) : 0;
    for (const layer of this.scenery)
      layer.style.opacity = (layer.dataset.land === current.land ? 1 - blend : 0) + (layer.dataset.land === next?.land ? blend : 0);
    this.svg.querySelector(".life-bunting").style.opacity = clamp(1 - Math.abs(year - this.wedding) * 1.8);
    const distance = (year - this.chapters[0].year) * 42;
    this.svg.querySelector(".life-clouds").setAttribute("transform", `translate(${-distance * .1} 0)`);
    this.svg.querySelector(".life-distant").setAttribute("transform", `translate(${-distance * .04} 0)`);
    this.nearby.setAttribute("transform", `translate(${-distance} 0)`);
    this.repeat.setAttribute("transform", `translate(${1000 - distance} 0)`);
    this.svg.querySelector(".life-trail").setAttribute("stroke-dashoffset", distance.toFixed(2));
    for (const limb of this.limbs) {
      const angle = walking ? Math.sin(phase + limb.phase) * limb.amplitude * strength : 0;
      limb.node.setAttribute("transform", `${limb.base} rotate(${angle.toFixed(2)})`);
    }
    for (const shin of this.shins) {
      const bend = walking ? Math.max(0, Math.sin(phase + shin.phase)) * 25 * strength : 0;
      shin.node.setAttribute("transform", `${shin.base} rotate(${bend.toFixed(2)})`);
    }
    for (const part of this.softParts) {
      const sway = walking ? Math.sin(phase + .5) * part.amplitude * strength : 0;
      part.node.setAttribute("transform", `${part.base} rotate(${sway.toFixed(2)})`);
    }
  }

  paintChild(node, age, presence, x, parentX, bob, carryBob = bob) {
    node.style.opacity = presence;
    const walking = soften((age - 1) / .55);
    const steppingAway = soften((age - 1.55) / .45);
    const scale = clamp(.48 + age * .043, .48, .85);
    const walker = node.querySelector(".life-child-walker");
    const bundle = node.querySelector(".life-child-bundle");
    node.removeAttribute("transform");
    walker.style.display = walking === 0 ? "none" : "";
    walker.style.opacity = walking;
    bundle.style.display = walking === 1 ? "none" : "";
    bundle.style.opacity = 1 - walking;
    const headX = parentX + 1 + (x + 5 * scale - parentX - 1) * steppingAway;
    const headY = (231 - carryBob) * (1 - walking) + (342 - 135 * scale - bob) * walking;
    bundle.setAttribute("transform", `translate(${headX - 1} ${headY + 5}) rotate(${-18 * (1 - walking)}) scale(.72)`);
    walker.setAttribute("transform", `translate(${headX - 5 * scale} ${headY - 25 * scale}) scale(${scale})`);
    return presence * (1 - walking);
  }
}
