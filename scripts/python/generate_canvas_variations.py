import os
import re

base_dir = "c:/Users/bacm6/Projects/my-life-as-a-dev/docs"

variations = [
    ("quantum-lattice", "Quantum Lattice", "Zen Geometry", "ZenGeometryScene"),
    ("neon-geode", "Neon Geode", "Crystal Cave", "CrystalCaveScene"),
    ("magnetic-dust", "Magnetic Dust", "Particle Flow", "ParticleFlowScene"),
    ("origami-unfolding", "Origami Unfolding", "Zen Geometry", "ZenGeometryScene"),
    ("glacial-caverns", "Glacial Caverns", "Crystal Cave", "CrystalCaveScene"),
    ("solar-flare", "Solar Flare", "Particle Flow", "ParticleFlowScene"),
    ("string-theory", "String Theory", "Zen Geometry", "ZenGeometryScene"),
    ("bismuth-fracture", "Bismuth Fracture", "Crystal Cave", "CrystalCaveScene"),
    ("digital-rain", "Digital Rain", "Particle Flow", "ParticleFlowScene"),
    ("echo-chains", "Echo Chains", "Zen Geometry", "ZenGeometryScene"),
    ("obsidian-shards", "Obsidian Shards", "Crystal Cave", "CrystalCaveScene"),
    ("smoke-mirrors", "Smoke & Mirrors", "Particle Flow", "ParticleFlowScene"),
    ("the-loom", "The Loom", "Zen Geometry", "ZenGeometryScene"),
    ("radioactive-slag", "Radioactive Slag", "Crystal Cave", "CrystalCaveScene"),
    ("tidal-pool", "Tidal Pool", "Particle Flow", "ParticleFlowScene"),
    ("synaptic-flash", "Synaptic Flash", "Zen Geometry", "ZenGeometryScene"),
    ("holographic-sand", "Holographic Sand", "Particle Flow", "ParticleFlowScene")
]

# Generate Markdown files
for slug, title, foundation, base_class in variations:
    dir_path = os.path.join(base_dir, f"canvas/{slug}")
    os.makedirs(dir_path, exist_ok=True)
    
    md_content = f"""---
title: {title}
description: A {foundation} variation demonstrating {title.lower()} dynamics.
tags:
  - WebGL
  - JavaScript
  - Experiment
hide:
  - toc
  - path
comments: false
---

# {title}

A breathtaking exploration of {foundation.lower()} extending into {title.lower()}.

<section class="canvas-example-shell" markdown>

<div class="canvas-example-header" markdown>

<div markdown>

## Live Example

Interact with the environment to witness {title.lower()} in real-time.

</div>

<div class="canvas-example-actions" markdown>

[Back to Canvas](../index.md){{ .md-button }}

</div>
</div>

<div id="canvas-scene" class="canvas-scene-viewport" role="img" aria-label="Interactive Three.js {title} scene"></div>

<div class="canvas-example-meta" markdown>

<div markdown>

**Demonstrates**

- High-performance WebGL aesthetics
- Concept exploration for {title}
- Foundation extension of {foundation}

</div>

<div markdown>

**Implementation**

- Entry: `docs/assets/js/canvas/scene/main.js`
- Scene: `docs/assets/js/canvas/scene/{title.replace(' ', '').replace('&', '')}Scene.js`

</div>

</div>

</section>
"""
    with open(os.path.join(dir_path, "index.md"), "w") as f:
        f.write(md_content)

    # Generate placeholder JS Scene extending base class (if possible) or just a mock class
    scene_class_name = title.replace(' ', '').replace('&', '') + "Scene"
    js_content = f"""import {{ {base_class} }} from './{base_class}.js';

export class {scene_class_name} extends {base_class} {{
    constructor(containerId = 'canvas-scene') {{
        super(containerId);
        // Overrides for {title} will go here
    }}
    
    // Override init or start methods here specifically for this variation
}}
"""
    # ensure ParticleFlowScene exists first
    with open(os.path.join(base_dir, f"assets/js/canvas/scene/{scene_class_name}.js"), "w") as f:
        f.write(js_content)

# create base ParticleFlowScene if it doesn't exist
try:
    with open(os.path.join(base_dir, "assets/js/canvas/scene/ParticleFlowScene.js"), "x") as f:
        f.write("""export class ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
    }
    async init() {
        console.log("ParticleFlowScene initializing...");
        return true;
    }
    destroy() {}
}""")
except FileExistsError:
    pass

# update main.js
main_js_path = os.path.join(base_dir, "assets/js/canvas/scene/main.js")
with open(main_js_path, "r") as f:
    main_js = f.read()

# build route mapping
type_matchers = ["        if (path.includes('/canvas/zen-geometry/')) return 'zen-geometry';",
                 "        if (path.includes('/canvas/crystal-cave/')) return 'crystal-cave';",
                 "        if (path.includes('/canvas/particle-flow/')) return 'particle-flow';"]
                 
init_matchers = ["            if (sceneType === 'zen-geometry') { const { ZenGeometryScene } = await import('./ZenGeometryScene.js'); sceneInstance = new ZenGeometryScene(); }",
                 "            else if (sceneType === 'crystal-cave') { const { CrystalCaveScene } = await import('./CrystalCaveScene.js'); sceneInstance = new CrystalCaveScene(); }",
                 "            else if (sceneType === 'particle-flow') { try { const { ParticleFlowScene } = await import('./ParticleFlowScene.js'); sceneInstance = new ParticleFlowScene(); } catch { return; } }"]

for slug, title, foundation, base_class in variations:
    scene_class_name = title.replace(' ', '').replace('&', '') + "Scene"
    type_matchers.append(f"        if (path.includes('/canvas/{slug}/')) return '{slug}';")
    init_matchers.append(f"            else if (sceneType === '{slug}') {{ const {{ {scene_class_name} }} = await import('./{scene_class_name}.js'); sceneInstance = new {scene_class_name}(); }}")

# We will just rewrite the two blocks in main.js
# It's safer to just rewrite main.js getSceneType and initScene

main_js_stub = f"""/**
 * Canvas Scene Entry Point
 *
 * Lightweight bootstrap that handles page detection and lifecycle
 * for the Canvas scenes. Works with MkDocs instant navigation.
 */

(function () {{
    'use strict';

    let sceneInstance = null;

    function normalizePath(pathname) {{
        return pathname.endsWith('index.html') ? pathname.slice(0, -'index.html'.length) : pathname;
    }}

    function getSceneType() {{
        const path = normalizePath(window.location.pathname);
{"\n".join(type_matchers)}
        return null;
    }}

    async function initScene() {{
        const sceneType = getSceneType();
        if (!sceneType) return;
        if (sceneInstance) return;

        try {{
{chr(10).join(init_matchers)}

            const success = await sceneInstance.init();

            if (!success) {{
                sceneInstance = null;
            }}
        }} catch (err) {{
            console.error('Failed to load Scene:', err);
            sceneInstance = null;
        }}
    }}

    function cleanup() {{
        if (sceneInstance) {{
            if(typeof sceneInstance.destroy === 'function') sceneInstance.destroy();
            sceneInstance = null;
        }}
    }}

    function checkPage() {{
        if (getSceneType()) {{
            if (!sceneInstance) {{
                initScene();
            }}
        }} else {{
            if (sceneInstance) {{
                cleanup();
            }}
        }}
    }}

    // Initial check
    if (document.readyState === 'loading') {{
        document.addEventListener('DOMContentLoaded', checkPage);
    }} else {{
        checkPage();
    }}

    // Track URL changes for instant navigation
    let lastPathname = window.location.pathname;
    setInterval(() => {{
        if (window.location.pathname !== lastPathname) {{
            lastPathname = window.location.pathname;
            checkPage();
        }}
    }}, 100);

    // Handle browser back/forward
    window.addEventListener('popstate', () => {{
        setTimeout(checkPage, 50);
    }});

}})();
"""

with open(main_js_path, "w") as f:
    f.write(main_js_stub)

print("Generated all files for variations.")
