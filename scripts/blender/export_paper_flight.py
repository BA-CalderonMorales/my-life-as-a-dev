"""Run in Blender to bake a six-vertex paper plane into SVG animation poses.

The website consumes the baked coordinates, never the Blender scene or a 3D engine.
"""
import bpy
import json
import math
from pathlib import Path
from mathutils import Euler, Vector

ROOT = Path(__file__).resolve().parents[2]
OUTPUTS = ROOT / 'tmp/blender'
scene = bpy.data.scenes.new('Notebook Paper Flight')
collection = bpy.data.collections.new('Paper Flight Study')
scene.collection.children.link(collection)
vertices = [(2.8, 0, 0), (-1.8, 0.24, -0.45), (-1.7, 1.65, 0.08),
            (-2.0, 0, -0.62), (-1.8, -0.24, -0.45), (-1.7, -1.65, 0.08)]
faces = [(0, 1, 2), (0, 3, 1), (0, 4, 3), (0, 5, 4)]
mesh = bpy.data.meshes.new('Six Vertex Folded Paper')
mesh.from_pydata(vertices, [], faces)
mesh.update()
plane = bpy.data.objects.new('Paper Plane', mesh)
collection.objects.link(plane)
for name, color in [('Paper light', (0.88, 0.86, 0.79, 1)),
                    ('Paper fold', (0.61, 0.69, 0.68, 1))]:
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    mesh.materials.append(material)
for polygon in mesh.polygons:
    polygon.material_index = polygon.index % 2

frames = []
previous_heading = math.pi / 2
for index in range(41):
    t = index / 40
    bank = math.sin(t * math.tau)
    # Orient the nose along a shallow oval, with eased takeoff and landing.
    heading = math.atan2(0.3 * math.tau * math.cos(t * math.tau),
                         -4 * math.pi * math.sin(t * math.tau))
    while heading < previous_heading - math.pi:
        heading += math.tau
    previous_heading = heading
    easing = min(t / 0.1, (1 - t) / 0.1, 1)
    easing = easing * easing * (3 - 2 * easing)
    resting_heading = math.radians(-15) + t * math.tau
    heading = resting_heading * (1 - easing) + heading * easing
    rotation = Euler((math.radians(28 + 46 * bank),
                      math.radians(12 * math.sin(t * math.pi)),
                      heading), 'XYZ')
    plane.rotation_euler = rotation
    plane.keyframe_insert(data_path='rotation_euler', frame=1 + index * 3)
    matrix = rotation.to_matrix()
    coordinates = []
    for vertex in mesh.vertices:
        point = matrix @ vertex.co
        coordinates.extend([round(32 + point.x * 11, 2), round(24 - point.y * 11, 2)])
    frames.append(coordinates)
scene.frame_start = 1
scene.frame_end = 121
scene.frame_set(1)
camera_data = bpy.data.cameras.new('Study Camera')
camera_data.type = 'ORTHO'
camera_data.ortho_scale = 6.8
camera = bpy.data.objects.new('Study Camera', camera_data)
collection.objects.link(camera)
camera.location = (0, 0, 7)
scene.camera = camera
scene.render.resolution_x = 640
scene.render.resolution_y = 480
scene.render.resolution_percentage = 100
if bpy.context.window:
    bpy.context.window.scene = scene
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_distance = 7
            area.spaces.active.region_3d.view_location = Vector((0, 0, 0))
            area.spaces.active.region_3d.view_rotation = Euler((math.radians(20), 0, math.radians(-25)), 'XYZ').to_quaternion()
            area.spaces.active.shading.color_type = 'MATERIAL'

asset = {'faces': faces, 'frames': frames, 'duration': 1800}
asset_dir = ROOT / 'docs/assets/geometry'
asset_dir.mkdir(parents=True, exist_ok=True)
asset_path = asset_dir / 'paper-flight.json'
asset_path.write_text(json.dumps(asset, separators=(',', ':')), encoding='utf-8')
OUTPUTS.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUTS / 'Notebook Paper Flight.blend'))
result = {'scene': scene.name, 'vertices': len(mesh.vertices), 'faces': len(mesh.polygons),
          'poses': len(frames), 'asset_bytes': asset_path.stat().st_size,
          'model': str(OUTPUTS / 'Notebook Paper Flight.blend')}
