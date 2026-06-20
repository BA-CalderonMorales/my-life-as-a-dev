import * as THREE from 'three';

export class LoomField {
    constructor({
        colors,
        isMobile = false,
        horizontalCount = 20,
        verticalCount = 20,
        spacing = isMobile ? 0.7 : 0.5,
        segments = isMobile ? 30 : 50,
        primaryOpacity = 0.35,
        secondaryOpacity = 0.35,
        waveDepth = 0.15,
        bendDepth = 1.2,
        influenceRadius = 4,
    }) {
        this.colors = colors;
        this.horizontalCount = horizontalCount;
        this.verticalCount = verticalCount;
        this.spacing = spacing;
        this.segments = segments;
        this.primaryOpacity = primaryOpacity;
        this.secondaryOpacity = secondaryOpacity;
        this.waveDepth = waveDepth;
        this.bendDepth = bendDepth;
        this.influenceRadius = influenceRadius;

        this.group = new THREE.Group();
        this.threads = [];
        this.extent = (Math.max(horizontalCount, verticalCount) - 1) * spacing / 2;
    }

    create() {
        this._createThreads('horizontal', this.horizontalCount);
        this._createThreads('vertical', this.verticalCount);
        return this.group;
    }

    _createThreads(type, count) {
        const isHorizontal = type === 'horizontal';
        const material = new THREE.LineBasicMaterial({
            color: isHorizontal ? this.colors.lineColor : this.colors.nodeColor,
            transparent: true,
            opacity: isHorizontal ? this.primaryOpacity : this.secondaryOpacity,
        });

        for (let i = 0; i < count; i++) {
            const fixed = (i * this.spacing) - ((count - 1) * this.spacing) / 2;
            const points = [];

            for (let j = 0; j <= this.segments; j++) {
                const moving = (j / this.segments) * this.extent * 2 - this.extent;
                points.push(isHorizontal
                    ? new THREE.Vector3(moving, fixed, 0)
                    : new THREE.Vector3(fixed, moving, 0)
                );
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material.clone());
            line.userData = {
                type,
                fixed,
                index: i,
                segments: this.segments,
                extent: this.extent,
            };
            this.group.add(line);
            this.threads.push(line);
        }
    }

    update({ elapsed, pointer, isInteracting = false, interactionFade = 0 }) {
        this.threads.forEach((thread) => {
            const data = thread.userData;
            const positions = thread.geometry.attributes.position.array;

            for (let j = 0; j <= data.segments; j++) {
                const t = j / data.segments;
                const moving = t * data.extent * 2 - data.extent;
                const px = data.type === 'horizontal' ? moving : data.fixed;
                const py = data.type === 'horizontal' ? data.fixed : moving;
                const waveZ = Math.sin(px * 0.8 + elapsed * 1.2)
                    * Math.cos(py * 0.8 + elapsed * 0.8)
                    * this.waveDepth;

                let bendZ = 0;
                if (isInteracting && pointer && interactionFade > 0) {
                    const dx = px - pointer.x;
                    const dy = py - pointer.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.influenceRadius) {
                        const factor = (1 - dist / this.influenceRadius) * interactionFade;
                        bendZ = Math.sin(factor * Math.PI) * this.bendDepth;
                    }
                }

                const idx = j * 3;
                positions[idx] = px;
                positions[idx + 1] = py;
                positions[idx + 2] = waveZ + bendZ;
            }

            thread.geometry.attributes.position.needsUpdate = true;
        });
    }

    updateColors(colors) {
        this.colors = colors;
        this.threads.forEach((thread) => {
            const color = thread.userData.type === 'horizontal'
                ? colors.lineColor
                : colors.nodeColor;
            thread.material.color.setHex(color);
        });
    }
}
