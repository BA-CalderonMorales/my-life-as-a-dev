const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const degrees = (radians) => radians * 180 / Math.PI;

// Fixed-length upper arm and forearm, with one consistent elbow bend direction.
export function solveArm(shoulder, target, upper, lower) {
  const dx = target.x - shoulder.x, dy = target.y - shoulder.y;
  const distance = Math.hypot(dx, dy);
  const reach = clamp(distance, Math.abs(upper - lower) + .05, upper + lower - .05);
  const ux = distance > .001 ? dx / distance : 0;
  const uy = distance > .001 ? dy / distance : 1;
  const along = (upper * upper - lower * lower + reach * reach) / (2 * reach);
  const across = Math.sqrt(Math.max(0, upper * upper - along * along));
  const elbow = { x: shoulder.x + ux * along - uy * across, y: shoulder.y + uy * along + ux * across };
  const wrist = { x: shoulder.x + ux * reach, y: shoulder.y + uy * reach };
  return {
    elbow, wrist,
    upperAngle: Math.atan2(elbow.y - shoulder.y, elbow.x - shoulder.x) - Math.PI / 2,
    forearmAngle: Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) - Math.PI / 2,
  };
}

// These contacts use the same transform as the baby, including the parent's bob.
export function infantContacts(node) {
  const matrix = node.transform.baseVal.consolidate().matrix;
  return {
    body: new DOMPoint(4, 32).matrixTransform(matrix),
    neck: new DOMPoint(-7, 4).matrixTransform(matrix),
  };
}

export class ArmRig {
  constructor(node, svg, phase) {
    this.node = node;
    this.owner = node.dataset.owner;
    this.near = node.classList.contains("life-arm-right");
    this.upper = Number(node.dataset.upper);
    this.lower = Number(node.dataset.lower);
    this.handScale = Number(node.dataset.handScale);
    this.palmOffset = Number(svg.querySelector("#life-hand-grip").dataset.contact);
    this.phase = phase;
    const matrix = node.transform.baseVal.consolidate().matrix;
    this.shoulder = { x: matrix.e, y: matrix.f };
    this.forearm = node.querySelector(".life-forearm");
    this.hand = node.querySelector(".life-hand");
    this.relaxed = node.querySelector(".life-relaxed-fingers");
    this.gripping = node.querySelector(".life-gripping-fingers");
    if (this.near && this.owner !== "kid") {
      const ns = "http://www.w3.org/2000/svg";
      this.front = document.createElementNS(ns, "g");
      this.front.setAttribute("class", "life-front-hand");
      this.front.dataset.parent = this.owner;
      this.front.style.color = node.dataset.skin;
      this.front.style.opacity = "0";
      const fingers = document.createElementNS(ns, "use");
      fingers.setAttribute("href", "#life-hand-grip");
      this.front.append(fingers);
      svg.querySelector(".life-people").append(this.front);
    }
  }

  paint(phase, walking, strength, carrying = 0, contacts = null, parent = null) {
    const swing = walking ? Math.sin(phase + this.phase) * .21 * strength : 0;
    const forearmSwing = swing - .12;
    const rest = {
      x: this.shoulder.x - Math.sin(swing) * this.upper - Math.sin(forearmSwing) * this.lower,
      y: this.shoulder.y + Math.cos(swing) * this.upper + Math.cos(forearmSwing) * this.lower,
    };
    const weight = contacts && parent ? clamp(carrying, 0, 1) : 0;
    const contact = this.near ? contacts?.body : contacts?.neck;
    const poseWeight = Math.min(1, weight * 2);
    const target = contact ? {
      x: rest.x + (contact.x - parent.x - this.palmOffset * this.handScale - rest.x) * poseWeight,
      y: rest.y + (contact.y - parent.y - rest.y) * poseWeight,
    } : rest;
    const pose = solveArm(this.shoulder, target, this.upper, this.lower);
    const turn = Math.atan2(Math.sin(-Math.PI / 2 - pose.forearmAngle), Math.cos(-Math.PI / 2 - pose.forearmAngle));
    const handAngle = pose.forearmAngle + turn * poseWeight;
    this.node.setAttribute("transform", `translate(${this.shoulder.x} ${this.shoulder.y}) rotate(${degrees(pose.upperAngle)})`);
    this.forearm.setAttribute("transform", `translate(0 ${this.upper}) rotate(${degrees(pose.forearmAngle - pose.upperAngle)})`);
    this.hand.setAttribute("transform", `translate(0 ${this.lower}) rotate(${degrees(handAngle - pose.forearmAngle)}) scale(${this.handScale})`);
    this.hand.style.opacity = this.front ? 1 - weight : 1;
    this.relaxed.style.opacity = this.front ? 1 : 1 - weight;
    this.gripping.style.opacity = this.front ? 0 : weight;
    if (this.front) {
      this.front.style.opacity = weight;
      this.front.setAttribute("transform", `translate(${(parent?.x ?? 0) + pose.wrist.x} ${(parent?.y ?? 0) + pose.wrist.y}) rotate(${degrees(handAngle)}) scale(${this.handScale})`);
    }
  }
}
