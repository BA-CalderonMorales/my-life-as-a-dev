import * as THREE from "../../vendor/three/three.module.min.js";

/* Close-up objects for the workbench. Their state comes from the HTML experiments. */
export function makeBenchObjects(materials) {
  const paper = materials.material("#f5efdf");
  const edge = materials.material("#d8ccb2");
  const pine = materials.material("#486851");
  const sage = materials.material("#8d9f80");
  const clay = materials.material("#b77c56");
  const dark = materials.material("#263e33");
  const brass = materials.material("#a99766", {
    metalness: 0.2,
    roughness: 0.6,
  });
  const objects = new Map();

  function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(width, height, depth, material, parent, x, y, z) {
    return mesh(
      new THREE.BoxGeometry(width, height, depth),
      material,
      parent,
      x,
      y,
      z,
    );
  }
  function cylinder(
    top,
    bottom,
    height,
    material,
    parent,
    x,
    y,
    z,
    sides = 32,
  ) {
    return mesh(
      new THREE.CylinderGeometry(top, bottom, height, sides),
      material,
      parent,
      x,
      y,
      z,
    );
  }
  function wire(points, color, parent) {
    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map((point) => new THREE.Vector3(...point)),
    );
    const material = new THREE.LineBasicMaterial({ color });
    materials.owned.add(material);
    const object = new THREE.Line(geometry, material);
    parent.add(object);
    return object;
  }
  function artifact(id) {
    const group = new THREE.Group();
    group.userData.project = id;
    const outline = materials.label(
      id === "jarvis"
        ? "01 / THE TOOL SHED"
        : id === "agent"
          ? "02 / UNDER THE HOOD"
          : id === "algorithm"
            ? "03 / A LITTLE ORDER"
            : "04 / AN OPEN PAGE",
      "#6b7560",
      0.28,
    );
    outline.position.set(0, 0.025, 1.85);
    group.add(outline);
    const result = { group, id };
    objects.set(id, result);
    return result;
  }
  function printed(texture, options = {}) {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
      side: THREE.DoubleSide,
      ...options,
    });
    materials.owned.add(material);
    return material;
  }
  function labelFace(text, width, height, parent, x, y, z, color = "#405747") {
    const texture = materials.inkTexture(
      (ctx, w, h) => {
        ctx.fillStyle = "#f7f1e3";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.font = "25px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, w / 2, h / 2);
      },
      512,
      128,
    );
    return mesh(
      new THREE.PlaneGeometry(width, height),
      printed(texture),
      parent,
      x,
      y,
      z,
    );
  }

  const jarvis = artifact("jarvis"),
    terminal = jarvis.group;
  box(3.4, 0.12, 2.35, edge, terminal, 0, 0.08, 0.1);
  box(2.55, 1.96, 0.92, pine, terminal, 0, 1.7, -0.42);
  box(2.34, 1.73, 0.025, dark, terminal, 0, 1.72, 0.055);
  const crtCanvas = document.createElement("canvas");
  crtCanvas.width = 768;
  crtCanvas.height = 512;
  const crtTexture = new THREE.CanvasTexture(crtCanvas);
  crtTexture.colorSpace = THREE.SRGBColorSpace;
  materials.owned.add(crtTexture);
  const screenMaterial = printed(crtTexture);
  mesh(
    new THREE.PlaneGeometry(2.08, 1.42),
    screenMaterial,
    terminal,
    0,
    1.79,
    0.075,
  );
  for (let index = 0; index < 4; index++)
    box(0.16, 0.05, 0.03, sage, terminal, -0.8 + index * 0.23, 0.93, 0.092);
  const power = cylinder(
    0.065,
    0.065,
    0.025,
    clay,
    terminal,
    0.95,
    1.03,
    0.085,
    16,
  );
  power.rotation.x = Math.PI / 2;
  box(0.4, 0.4, 0.5, pine, terminal, 0, 0.61, -0.38);
  box(1.25, 0.11, 0.9, pine, terminal, 0, 0.36, -0.35);
  box(2.65, 0.15, 0.87, pine, terminal, -0.08, 0.25, 1.05);
  const keys = [];
  for (let row = 0; row < 3; row++)
    for (let column = 0; column < 12; column++) {
      const key = box(
        0.16,
        0.065,
        0.17,
        column === 0 ? clay : paper,
        terminal,
        -1.18 + column * 0.2,
        0.36,
        0.75 + row * 0.23,
      );
      keys.push(key);
    }
  box(0.9, 0.065, 0.15, paper, terminal, -0.1, 0.36, 1.35);
  const cable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.2, 0.13, 1.1),
    new THREE.Vector3(2, 0.12, 0.9),
    new THREE.Vector3(2.1, 0.13, -0.8),
    new THREE.Vector3(0.9, 0.15, -1.05),
  ]);
  mesh(new THREE.TubeGeometry(cable, 30, 0.025, 5, false), dark, terminal);
  labelFace("try a tool ↓", 1.2, 0.28, terminal, 0.6, 0.55, 1.45);
  Object.assign(jarvis, { crtCanvas, crtTexture, keys });

  const agent = artifact("agent"),
    machine = agent.group,
    gears = [];
  box(3.8, 0.2, 2.7, edge, machine, 0, 0.16, 0);
  box(3.6, 0.03, 2.5, paper, machine, 0, 0.275, 0);
  function gear(radius, teeth, material, x, z) {
    const root = new THREE.Group();
    root.position.set(x, 0.46, z);
    machine.add(root);
    const shape = new THREE.Shape();
    for (let index = 0; index < teeth * 4; index++) {
      const angle = (index / (teeth * 4)) * Math.PI * 2;
      const r = index % 4 === 1 || index % 4 === 2 ? radius : radius * 0.79;
      const px = Math.cos(angle) * r,
        py = Math.sin(angle) * r;
      if (index === 0) shape.moveTo(px, py);
      else shape.lineTo(px, py);
    }
    shape.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, radius * 0.22, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.13,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.02,
    });
    const disc = mesh(geometry, material, root);
    disc.rotation.x = -Math.PI / 2;
    cylinder(0.07, 0.07, 0.24, brass, root, 0, 0.03, 0, 16);
    root.userData.speed = radius > 0.8 ? 1 : -1.25;
    gears.push(root);
    return root;
  }
  gear(0.96, 13, clay, -0.75, -0.35);
  gear(0.73, 10, pine, 0.7, -0.6);
  gear(0.53, 9, brass, 0.57, 0.59);
  const lever = new THREE.Group();
  lever.position.set(-1.45, 0.29, 0.95);
  machine.add(lever);
  cylinder(0.14, 0.14, 0.1, brass, lever, 0, 0.05, 0);
  const handle = cylinder(0.035, 0.035, 0.65, dark, lever, 0, 0.36, 0, 12);
  handle.rotation.z = 0.16;
  mesh(new THREE.SphereGeometry(0.115, 12, 8), clay, lever, -0.05, 0.7, 0);
  const placardCanvas = document.createElement("canvas");
  placardCanvas.width = 768;
  placardCanvas.height = 256;
  const placardTexture = new THREE.CanvasTexture(placardCanvas);
  placardTexture.colorSpace = THREE.SRGBColorSpace;
  materials.owned.add(placardTexture);
  box(3.1, 0.7, 0.12, paper, machine, 0, 1.5, -1.12);
  mesh(
    new THREE.PlaneGeometry(2.9, 0.59),
    printed(placardTexture),
    machine,
    0,
    1.5,
    -1.05,
  );
  for (const x of [-1.25, 1.25])
    cylinder(0.025, 0.025, 1.2, brass, machine, x, 0.87, -1.15, 10);
  Object.assign(agent, { gears, lever, placardCanvas, placardTexture });

  const algorithm = artifact("algorithm"),
    skyline = algorithm.group,
    bars = new Map();
  box(4.6, 0.12, 2.2, edge, skyline, 0, 0.08, 0);
  box(4.45, 0.025, 2.05, paper, skyline, 0, 0.155, 0);
  const barMaterials = [pine, sage, clay, brass];
  for (let value = 1; value <= 8; value++) {
    const height = value * 0.29;
    const root = new THREE.Group();
    root.position.set(-1.78 + (value - 1) * 0.51, 0.17, 0);
    skyline.add(root);
    const material = barMaterials[(value - 1) % 4].clone();
    materials.owned.add(material);
    box(0.37, height, 0.72, material, root, 0, height / 2, 0);
    const number = labelFace(
      String(value),
      0.28,
      0.24,
      root,
      0,
      height - 0.15,
      0.365,
      "#2d483a",
    );
    root.userData.value = value;
    bars.set(value, { root, material, base: material.color.clone(), number });
  }
  for (let index = 0; index < 9; index++)
    wire(
      [
        [-2.1 + index * 0.51, 0.18, -0.65],
        [-2.1 + index * 0.51, 0.18, 0.65],
      ],
      "#c1bdab",
      skyline,
    );
  Object.assign(algorithm, { bars });

  const notebook = artifact("notebook"),
    book = notebook.group;
  box(5.4, 0.13, 3.4, pine, book, 0, 0.08, 0);
  for (const side of [-1, 1]) {
    box(2.6, 0.12, 3.2, edge, book, side * 1.35, 0.2, 0);
    box(2.58, 0.04, 3.18, paper, book, side * 1.35, 0.28, 0);
  }
  for (const z of [-1.1, 0, 1.1]) {
    const ring = mesh(
      new THREE.TorusGeometry(0.18, 0.025, 6, 24),
      brass,
      book,
      0,
      0.31,
      z,
    );
  }
  const sketchCanvas = document.createElement("canvas");
  sketchCanvas.width = 1000;
  sketchCanvas.height = 640;
  const sketchTexture = new THREE.CanvasTexture(sketchCanvas);
  sketchTexture.colorSpace = THREE.SRGBColorSpace;
  materials.owned.add(sketchTexture);
  const sketchSurface = mesh(
    new THREE.PlaneGeometry(2.5, 3.06),
    printed(sketchTexture),
    book,
    1.35,
    0.31,
    0,
  );
  sketchSurface.rotation.x = -Math.PI / 2;
  const leftPage = materials.inkTexture(
    (ctx, w, h) => {
      ctx.fillStyle = "#f5efdf";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#b8c3bc88";
      ctx.lineWidth = 1;
      for (let y = 40; y < h; y += 38) {
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(w - 20, y);
        ctx.stroke();
      }
      ctx.fillStyle = "#44634f";
      ctx.font = "italic 35px Georgia";
      ctx.fillText("A life in progress.", 40, 95);
      ctx.font = "23px monospace";
      ["make something", "learn something", "pass it on"].forEach(
        (text, index) => ctx.fillText(text, 40, 190 + index * 55),
      );
      ctx.font = "italic 24px Georgia";
      ctx.fillStyle = "#976344";
      ctx.fillText("there’s room for you, too.", 40, 430);
    },
    512,
    640,
  );
  const page = mesh(
    new THREE.PlaneGeometry(2.5, 3.06),
    printed(leftPage),
    book,
    -1.35,
    0.31,
    0,
  );
  page.rotation.x = -Math.PI / 2;
  const pencil = cylinder(0.045, 0.045, 2.2, clay, book, 3, 0.16, 0.2, 6);
  pencil.rotation.z = Math.PI / 2;
  pencil.rotation.y = 0.45;
  const tip = mesh(
    new THREE.ConeGeometry(0.045, 0.23, 6),
    dark,
    book,
    2,
    0.16,
    0.68,
  );
  tip.rotation.z = Math.PI / 2;
  Object.assign(notebook, { sketchCanvas, sketchTexture, sketchSurface });

  const desk = new THREE.Group();
  box(13.7, 0.12, 10, edge, desk, 0, -0.15, 0);
  const deskTexture = materials.inkTexture(
    (ctx, w, h) => {
      ctx.fillStyle = "#f6f0e1";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#a6bab533";
      ctx.lineWidth = 1.5;
      for (let y = 20; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#bc8b7566";
      ctx.beginPath();
      ctx.moveTo(90, 0);
      ctx.lineTo(90, h);
      ctx.stroke();
    },
    1024,
    1024,
  );
  box(
    13.6,
    0.025,
    9.9,
    materials.material("#ffffff", { map: deskTexture }),
    desk,
    0,
    -0.07,
    0,
  );
  const note = materials.label(
    "PICK SOMETHING UP. IT’S HERE TO BE USED.",
    "#8d6b49",
    0.25,
  );
  note.position.set(0, -0.045, 4.2);
  desk.add(note);
  const tape = box(
    1,
    0.015,
    0.32,
    materials.material("#d8c494", { transparent: true, opacity: 0.65 }),
    desk,
    -5.8,
    -0.04,
    -4.8,
  );
  tape.rotation.y = -0.2;
  return { objects, desk };
}
