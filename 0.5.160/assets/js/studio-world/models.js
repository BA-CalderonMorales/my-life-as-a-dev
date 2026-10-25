import * as THREE from "../../vendor/three/three.module.min.js";
import { places, home } from "./projects.js";

export function buildPaperWorld(materials, assetBase, invalidate) {
  const group = new THREE.Group();
  const paper = materials.material("#f6f0df");
  const edge = materials.material("#e3d8bd");
  const pine = materials.material("#58745b");
  const mint = materials.material("#82947b");
  const clay = materials.material("#bc8663");
  const dark = materials.material("#304c40");
  const brass = materials.material("#a5956c", {
    metalness: 0.3,
    roughness: 0.6,
  });
  const pickables = [],
    stations = new Map(),
    gears = [],
    skyline = [];

  function mesh(geometry, material, parent = group, x = 0, y = 0, z = 0) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(w, h, d, material, parent, x, y, z) {
    return mesh(new THREE.BoxGeometry(w, h, d), material, parent, x, y, z);
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
    sides = 24,
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
  function sphere(radius, material, parent, x, y, z) {
    return mesh(
      new THREE.SphereGeometry(radius, 12, 8),
      material,
      parent,
      x,
      y,
      z,
    );
  }
  function line(points, color, parent = group, dashed = false) {
    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(...p)),
    );
    const material = dashed
      ? new THREE.LineDashedMaterial({
          color,
          dashSize: 0.28,
          gapSize: 0.18,
          transparent: true,
          opacity: 0.8,
        })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
    materials.owned.add(material);
    const path = new THREE.Line(geometry, material);
    if (dashed) path.computeLineDistances();
    parent.add(path);
    return path;
  }
  // Each leaf has its own inner margin. The gap exposes the binding below.
  const pageWidth = 15.1;
  const pageGap = 0.22;
  box(31, 0.28, 21, materials.material("#647965"), group, 0, -0.38, 0);
  box(0.24, 0.06, 20.5, dark, group, 0, -0.05, 0);
  for (const side of [-1, 1]) {
    const centerX = (side * (pageWidth + pageGap)) / 2;
    for (let layer = 0; layer < 5; layer++) {
      box(
        pageWidth + 0.08,
        0.055,
        20.5,
        layer % 2 ? paper : edge,
        group,
        centerX + side * (layer % 2) * 0.025,
        -0.19 + layer * 0.055,
        0,
      );
    }
    const texture = materials.inkTexture(
      (ctx, width, height) => {
        ctx.fillStyle = "#f7f1e2";
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "#aab9b840";
        ctx.lineWidth = 1.3;
        for (let y = 24; y < height; y += 24) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.strokeStyle = "#c0816b88";
        ctx.lineWidth = 1.5;
        const margin = side < 0 ? width - 60 : 60;
        for (const x of [margin, margin + side * 8]) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let i = 0; i < 5000; i++) {
          ctx.fillStyle = `rgba(70,50,20,${(i % 4) * 0.005})`;
          ctx.fillRect((i * 7919) % width, (i * 3557) % height, 1, 1);
        }
      },
      768,
      1024,
    );
    const leaf = box(
      pageWidth,
      0.04,
      20.4,
      materials.material("#ffffff", { map: texture }),
      group,
      centerX,
      0.1,
      0,
    );
    leaf.name = side < 0 ? "notebook-left-leaf" : "notebook-right-leaf";
  }
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 20),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.15;
  group.add(ground);
  materials.owned.add(ground.material);
  // Rings arch across the center seam and enter a hole on each leaf.
  for (const z of [-7, 0, 7]) {
    const ring = mesh(
      new THREE.TorusGeometry(0.56, 0.055, 10, 48),
      brass,
      group,
      0,
      0.17,
      z,
    );
    ring.name = "notebook-center-ring";
    for (const x of [-0.56, 0.56]) {
      cylinder(0.115, 0.115, 0.008, dark, group, x, 0.127, z, 24);
      const rim = mesh(
        new THREE.TorusGeometry(0.12, 0.012, 5, 24),
        edge,
        group,
        x,
        0.134,
        z,
      );
      rim.rotation.x = Math.PI / 2;
    }
  }
  for (let i = 0; i < 4; i++) {
    const x = 3.8 + i * 2.2;
    const mountain = mesh(
      new THREE.ConeGeometry(2.8 - i * 0.15, 3.4 + (i % 2) * 1.5, 4),
      i % 2 ? edge : paper,
      group,
      x,
      1.8 + (i % 2) * 0.75,
      -7.6,
    );
    mountain.rotation.y = i * 0.7 + 0.3;
    const ridge = line(
      [
        [x - 2, 0.2, -6],
        [x, 3.5 + (i % 2) * 1.5, -7.6],
        [x + 2, 0.2, -6],
      ],
      "#a89879",
    );
    ridge.visible = true;
  }
  function tree(x, z, scale = 1) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0.1, z);
    treeGroup.scale.setScalar(scale);
    group.add(treeGroup);
    cylinder(0.08, 0.13, 0.8, clay, treeGroup, 0, 0.4, 0, 6);
    for (let i = 0; i < 3; i++)
      mesh(
        new THREE.ConeGeometry(0.75 - i * 0.17, 0.95, 5),
        i % 2 ? pine : mint,
        treeGroup,
        0,
        0.9 + i * 0.48,
        0,
      ).rotation.y = i * 0.5;
  }
  [
    [-11, -7, 0.9],
    [-11, -5, 0.6],
    [-3, -6, 0.65],
    [10, -6, 0.9],
    [11, -4, 0.7],
    [11, 7, 0.6],
    [-11, 6, 0.8],
    [-9, 7, 0.55],
    [2, -8, 0.7],
  ].forEach((p) => tree(...p));
  const river = new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.4, 0.15, -9),
    new THREE.Vector3(1.6, 0.15, -3),
    new THREE.Vector3(2.8, 0.15, 0),
    new THREE.Vector3(1.7, 0.15, 5),
    new THREE.Vector3(3.5, 0.15, 9),
  ]);
  const riverPoints = river.getPoints(90);
  const ribbonGeometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < riverPoints.length - 1; i++) {
    const a = riverPoints[i],
      b = riverPoints[i + 1],
      n = new THREE.Vector3().subVectors(b, a).normalize();
    const side = new THREE.Vector3(-n.z, 0, n.x).multiplyScalar(0.32);
    for (const p of [
      a.clone().add(side),
      a.clone().sub(side),
      b.clone().add(side),
      a.clone().sub(side),
      b.clone().sub(side),
      b.clone().add(side),
    ])
      vertices.push(p.x, p.y, p.z);
  }
  ribbonGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  ribbonGeometry.computeVertexNormals();
  mesh(
    ribbonGeometry,
    materials.material("#a8bbb1", { side: THREE.DoubleSide }),
    group,
  );
  for (let i = 0; i < 7; i++)
    box(0.15, 0.08, 1.2, edge, group, 2.25 + i * 0.19, 0.25, 0.15);

  function station(place) {
    const root = new THREE.Group();
    root.position.set(place.x, 0.16, place.z);
    group.add(root);
    cylinder(2.6, 2.8, 0.13, paper, root, 0, 0.08, 0, 48);
    const border = mesh(
      new THREE.TorusGeometry(2.6, 0.025, 5, 64),
      materials.material(place.color),
      root,
      0,
      0.17,
      0,
    );
    border.rotation.x = Math.PI / 2;
    const hit = mesh(
      new THREE.CylinderGeometry(2.6, 2.6, 4, 12),
      new THREE.MeshBasicMaterial({ visible: false }),
      root,
      0,
      1.5,
      0,
    );
    materials.owned.add(hit.material);
    hit.userData.project = place.id;
    pickables.push(hit);
    const label = materials.label(place.project, place.color, 0.42);
    label.position.set(0, 0.2, 2.1);
    root.add(label);
    stations.set(place.id, root);
    return root;
  }
  const jarvis = station(places[0]);
  jarvis.rotation.y = 0.15;
  box(2.8, 0.16, 1.65, edge, jarvis, 0, 0.35, 0);
  box(2.15, 1.65, 0.55, pine, jarvis, 0, 1.62, -0.3);
  const screenTexture = materials.inkTexture(
    (ctx, w, h) => {
      ctx.fillStyle = "#253e32";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#dce3bc";
      ctx.font = "32px monospace";
      ctx.fillText("$ terminal-jarvis", 40, 65);
      ctx.font = "24px monospace";
      ["> Codex", "  Claude Code", "  Gemini CLI", "_"].forEach((text, i) =>
        ctx.fillText(text, 40, 130 + i * 46),
      );
    },
    512,
    320,
  );
  const screen = mesh(
    new THREE.PlaneGeometry(1.83, 1.3),
    materials.material("#ffffff", {
      map: screenTexture,
      emissive: "#879a71",
      emissiveIntensity: 0.15,
    }),
    jarvis,
    0,
    1.65,
    -0.012,
  );
  box(0.4, 0.4, 0.4, pine, jarvis, 0, 0.65, -0.3);
  box(1.1, 0.12, 0.7, pine, jarvis, 0, 0.47, -0.3);
  const keyboard = box(2, 0.09, 0.6, pine, jarvis, 0, 0.5, 0.58);
  keyboard.rotation.x = 0.12;
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 10; col++)
      box(
        0.14,
        0.035,
        0.11,
        paper,
        jarvis,
        -0.82 + col * 0.18,
        0.57,
        0.39 + row * 0.16,
      );
  const antenna = line(
    [
      [0.5, 2.45, -0.3],
      [0.7, 3.1, -0.3],
    ],
    "#657653",
    jarvis,
  );
  sphere(0.09, clay, jarvis, 0.7, 3.1, -0.3);

  function gear(radius, teeth, material, parent, x, y, z) {
    const gearGroup = new THREE.Group();
    gearGroup.position.set(x, y, z);
    parent.add(gearGroup);
    const disc = cylinder(
      radius * 0.82,
      radius * 0.82,
      0.18,
      material,
      gearGroup,
      0,
      0,
      0,
      24,
    );
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const tooth = box(
        radius * 0.35,
        0.18,
        radius * 0.28,
        material,
        gearGroup,
        Math.cos(angle) * radius * 0.85,
        0,
        Math.sin(angle) * radius * 0.85,
      );
      tooth.rotation.y = -angle;
    }
    cylinder(
      radius * 0.25,
      radius * 0.25,
      0.2,
      paper,
      gearGroup,
      0,
      0.01,
      0,
      18,
    );
    gearGroup.userData.speed = radius > 0.9 ? 1 : -1.3;
    gears.push(gearGroup);
    return gearGroup;
  }
  const agent = station(places[1]);
  box(3.8, 0.28, 2.7, edge, agent, 0, 0.34, 0);
  gear(1.02, 12, clay, agent, -0.75, 0.6, -0.25);
  gear(0.72, 10, pine, agent, 0.75, 0.6, -0.8);
  gear(0.55, 8, brass, agent, 0.65, 0.6, 0.65);
  const sign = box(2.2, 0.85, 0.15, paper, agent, 0, 1.9, -1.05);
  sign.rotation.x = -0.15;
  const agentText = materials.label("HUMAN IN THE LOOP", "#6e5b40", 0.27);
  agentText.rotation.x = 0;
  agentText.position.set(0, 1.95, -0.96);
  agent.add(agentText);
  cylinder(0.035, 0.035, 1.3, brass, agent, -0.95, 1.1, -1);
  cylinder(0.035, 0.035, 1.3, brass, agent, 0.95, 1.1, -1);

  const algorithm = station(places[2]);
  const values = [4, 7, 2, 6, 3, 8, 1, 5];
  const barMaterials = [pine, mint, clay, brass];
  values.forEach((value, i) => {
    const bar = box(
      0.37,
      value * 0.27,
      0.64,
      barMaterials[i % 4],
      algorithm,
      -1.6 + i * 0.46,
      0.25 + value * 0.135,
      0,
    );
    bar.userData.value = value;
    skyline.push(bar);
  });
  const grid = materials.label("COMPARE / SWAP / REPEAT", "#6b7659", 0.3);
  grid.position.set(0, 0.22, 1.3);
  algorithm.add(grid);

  const notebook = station(places[3]);
  notebook.rotation.y = -0.35;
  box(3, 0.16, 2, pine, notebook, 0, 0.35, 0);
  const left = box(1.4, 0.12, 1.85, paper, notebook, -0.72, 0.5, 0);
  left.rotation.z = 0.1;
  const right = box(1.4, 0.12, 1.85, paper, notebook, 0.72, 0.5, 0);
  right.rotation.z = -0.1;
  for (let row = 0; row < 6; row++)
    line(
      [
        [-1.25, 0.61, -0.65 + row * 0.23],
        [-0.2, 0.61, -0.65 + row * 0.23],
      ],
      "#859991",
      notebook,
    );
  const pencil = cylinder(
    0.045,
    0.045,
    2.2,
    clay,
    notebook,
    1.8,
    0.28,
    -0.1,
    6,
  );
  pencil.rotation.z = Math.PI / 2;
  pencil.rotation.y = 0.5;
  const pencilTip = mesh(
    new THREE.ConeGeometry(0.045, 0.22, 6),
    dark,
    notebook,
    0.75,
    0.28,
    0.48,
  );
  pencilTip.rotation.z = Math.PI / 2;
  const mug = cylinder(0.32, 0.27, 0.6, paper, notebook, -1.7, 0.5, 1.15);
  cylinder(0.26, 0.26, 0.02, dark, notebook, -1.7, 0.81, 1.15);
  const handle = mesh(
    new THREE.TorusGeometry(0.18, 0.05, 8, 20),
    paper,
    notebook,
    -2.03,
    0.52,
    1.15,
  );
  handle.rotation.y = Math.PI / 2;
  const textureLoader = new THREE.TextureLoader();
  let finishPhoto;
  const assetsReady = new Promise((resolve) => { finishPhoto = resolve; });
  const familyTexture = textureLoader.load(
    new URL("images/studio/the-good-stuff-thumb.webp", assetBase).href,
    () => { finishPhoto(); invalidate(); },
    undefined,
    () => {
      photo.material.map = null;
      photo.material.needsUpdate = true;
      finishPhoto();
    },
  );
  familyTexture.colorSpace = THREE.SRGBColorSpace;
  materials.owned.add(familyTexture);
  const photo = mesh(
    new THREE.PlaneGeometry(1.25, 1.25),
    materials.material("#ffffff", { map: familyTexture }),
    notebook,
    0.5,
    0.59,
    0.1,
  );
  photo.rotation.x = -Math.PI / 2;

  const launchpad = new THREE.Group();
  launchpad.position.set(home.x, 0.17, home.z);
  launchpad.name = "notebook-home-base";
  group.add(launchpad);
  cylinder(1.24, 1.32, 0.1, paper, launchpad, 0, 0.05, 0, 48);
  const landingRing = mesh(
    new THREE.TorusGeometry(1.18, 0.025, 6, 64),
    pine,
    launchpad,
    0,
    0.115,
    0,
  );
  landingRing.rotation.x = Math.PI / 2;
  const homeMark = materials.label("HOME", "#42634d", 0.26);
  homeMark.position.set(0, 0.12, 0.7);
  launchpad.add(homeMark);
  line(
    [
      [-0.6, 0.12, -0.45],
      [0, 0.12, -0.8],
      [0.6, 0.12, -0.45],
    ],
    "#42634d",
    launchpad,
  );
  cylinder(0.025, 0.025, 0.8, brass, launchpad, -1, 0.5, -0.65, 8);
  const flag = mesh(
    new THREE.PlaneGeometry(0.5, 0.27),
    materials.material("#58745b", { side: THREE.DoubleSide }),
    launchpad,
    -0.75,
    0.78,
    -0.65,
  );
  const homeHit = mesh(
    new THREE.CylinderGeometry(1.3, 1.3, 1.6, 16),
    new THREE.MeshBasicMaterial({ visible: false }),
    launchpad,
    0,
    0.8,
    0,
  );
  materials.owned.add(homeHit.material);
  homeHit.userData.project = home.id;
  pickables.push(homeHit);

  const plane = new THREE.Group();
  plane.position.set(home.x, 1.4, home.z);
  plane.scale.setScalar(1.4);
  group.add(plane);
  const planeVertices = [
    0, 0, -0.9, -0.85, 0, 0.65, 0, 0.18, 0.3, 0, 0, -0.9, 0, 0.18, 0.3, 0.85, 0,
    0.65, 0, 0, -0.9, 0, -0.25, 0.3, 0, 0.18, 0.3,
  ];
  const planeGeometry = new THREE.BufferGeometry();
  planeGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(planeVertices, 3),
  );
  planeGeometry.computeVertexNormals();
  planeGeometry.addGroup(0, 3, 0);
  planeGeometry.addGroup(3, 3, 1);
  planeGeometry.addGroup(6, 3, 2);
  mesh(
    planeGeometry,
    [
      materials.material("#fff9e9", { side: THREE.DoubleSide }),
      materials.material("#b4c9ad", { side: THREE.DoubleSide }),
      materials.material("#42634d", { side: THREE.DoubleSide }),
    ],
    plane,
  );
  const planeOutline = line(
    [
      [0, 0, -0.9],
      [0, 0.18, 0.3],
      [-0.85, 0, 0.65],
      [0, 0, -0.9],
      [0.85, 0, 0.65],
      [0, 0.18, 0.3],
    ],
    "#304c40",
    plane,
  );
  planeOutline.material.opacity = 1;
  const planeShadow = mesh(
    new THREE.CircleGeometry(0.85, 24),
    new THREE.MeshBasicMaterial({
      color: "#4d5946",
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    }),
    group,
    0,
    0.16,
    4.8,
  );
  planeShadow.rotation.x = -Math.PI / 2;
  materials.owned.add(planeShadow.material);
  const routes = new Map();
  for (const place of places) {
    const start = new THREE.Vector3(home.x, 0.29, home.z),
      end = new THREE.Vector3(place.x, 0.19, place.z + 2.3);
    const curve = new THREE.CatmullRomCurve3([
      start,
      new THREE.Vector3(place.x * 0.3, 0.19, place.z * 0.2 + 1),
      end,
    ]);
    const route = line(
      curve.getPoints(35).map((p) => [p.x, p.y, p.z]),
      "#68795f",
      group,
      true,
    );
    routes.set(place.id, route);
  }
  const homeLabel = materials.label("A FEW THINGS I'VE MADE", "#8b8066", 0.45);
  homeLabel.position.set(0, 0.18, 8.5);
  group.add(homeLabel);
  const compass = materials.label("N  ↑", "#8b8066", 0.42);
  compass.position.set(12, 0.18, -8);
  group.add(compass);
  return {
    group,
    ground,
    pickables,
    stations,
    assetsReady,
    gears,
    skyline,
    plane,
    planeShadow,
    routes,
    screen,
  };
}
