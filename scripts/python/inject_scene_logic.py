import os

base_dir = "c:/Users/bacm6/Projects/my-life-as-a-dev/docs/assets/js/canvas/scene"

configs = {
    "QuantumLatticeScene": "this.speedMultiplier = 5; this.nodeScale = 0.5; this.themeOverride = 'neon';",
    "NeonGeodeScene": "this.emissiveIntensity = 2.0; this.roughness = 0.1; this.metalness = 0.9; this.baseColor = 0xff00ff;",
    "MagneticDustScene": "this.particleDensity = 50000; this.flowSpeed = 0.2; this.viscosity = 0.9;",
    "OrigamiUnfoldingScene": "this.geometryType = 'planar'; this.foldSegments = 6;",
    "GlacialCavernsScene": "this.crystalType = 'ice'; this.refractionRatio = 0.98; this.baseColor = 0xaaddff;",
    "SolarFlareScene": "this.particleDensity = 100000; this.heatEmission = true; this.baseColor = 0xffaa00;",
    "StringTheoryScene": "this.nodeScale = 0; this.lineTension = 1.0; this.lineColor = 0xffffff;",
    "BismuthFractureScene": "this.crystalType = 'bismuth'; this.stepHeight = 0.1; this.iridescence = 1.0;",
    "DigitalRainScene": "this.flowDirection = 'down'; this.particleDensity = 20000; this.baseColor = 0x00ff00;",
    "EchoChainsScene": "this.audioReactive = true; this.rippleEffect = true;",
    "ObsidianShardsScene": "this.crystalType = 'shard'; this.baseColor = 0x010101; this.metalness = 1.0; this.roughness = 0.0;",
    "SmokeMirrorsScene": "this.particleVolatility = 0.8; this.opacity = 0.3; this.mirrorActive = true;",
    "TheLoomScene": "this.geometryType = 'thread'; this.lineDensity = 1000;",
    "RadioactiveSlagScene": "this.emissiveColor = 0x33ff33; this.emissiveIntensity = 5.0; this.pulseRate = 2.0;",
    "TidalPoolScene": "this.fluidDynamics = true; this.surfaceDistortion = 1.2;",
    "SynapticFlashScene": "this.speedMultiplier = 10; this.pulseEffect = 'electric'; this.lineColor = 0x55bbff;",
    "HolographicSandScene": "this.particleScale = 0.1; this.hologramEffect = true;"
}

for class_name, logic in configs.items():
    file_path = os.path.join(base_dir, f"{class_name}.js")
    if not os.path.exists(file_path): continue
    
    with open(file_path, "r") as f:
        content = f.read()
    
    # Simple injection into constructor
    if "super(containerId);" in content and "this.speedMultiplier" not in content:
        content = content.replace(
            "super(containerId);",
            f"super(containerId);\n        {logic}\n        console.log('{class_name} injected properties applied.');"
        )
        
        with open(file_path, "w") as f:
            f.write(content)

print("Injected base overrides into all 17 Variation scenes.")
