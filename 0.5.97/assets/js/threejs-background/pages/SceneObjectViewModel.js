export function buildSceneObject(geometryFactory, definition) {
    const builders = {
        sphere: () => geometryFactory.createSphere(definition.options),
        icosahedron: () => geometryFactory.createIcosahedron(definition.options),
        torus: () => geometryFactory.createTorus(definition.options),
        octahedron: () => geometryFactory.createOctahedron(definition.options),
        wireframeRing: () => geometryFactory.createWireframeRing(definition.options)
    };

    const build = builders[definition.kind];
    if (!build) {
        throw new Error(`Unsupported scene object kind: ${definition.kind}`);
    }

    return build();
}
