/**
 * AnimationController - Handles animation updates for all scene objects
 * Provides smooth floating animations and scroll-responsive behaviors
 */
export class AnimationController {
    constructor() {
        this.animatedObjects = [];
        this.scrollOffset = 0;
        this.targetScrollOffset = 0;
        this.smoothingFactor = 0.028;
    }
    
    /**
     * Register an object for animation
     */
    registerObject(object, options = {}) {
        const animConfig = {
            object,
            enableFloat: options.enableFloat !== false,
            enableRotation: options.enableRotation !== false,
            enableScrollResponse: options.enableScrollResponse !== false,
            scrollInfluence: options.scrollInfluence || 1.0,
            phase: Math.random() * Math.PI * 2
        };
        
        this.animatedObjects.push(animConfig);
        return animConfig;
    }
    
    /**
     * Unregister an object from animation
     */
    unregisterObject(object) {
        this.animatedObjects = this.animatedObjects.filter(
            config => config.object !== object
        );
    }
    
    /**
     * Update all animations based on time and scroll
     */
    update(time, scrollProgress) {
        this.targetScrollOffset = scrollProgress;
        this.scrollOffset += (this.targetScrollOffset - this.scrollOffset) * this.smoothingFactor;
        
        this.animatedObjects.forEach(config => {
            this.updateObject(config, time);
        });
    }
    
    /**
     * Update a single animated object
     */
    updateObject(config, time) {
        const { object, enableFloat, enableRotation, enableScrollResponse, scrollInfluence, phase } = config;
        
        if (!object || !object.userData) return;
        
        const userData = object.userData;
        
        if (enableRotation && userData.rotationSpeed) {
            object.rotation.x += userData.rotationSpeed.x;
            object.rotation.y += userData.rotationSpeed.y;
            object.rotation.z += userData.rotationSpeed.z;
        }
        
        if (enableFloat && userData.originalPosition) {
            const floatSpeed = userData.floatSpeed || 0.5;
            const floatAmplitude = userData.floatAmplitude || 0.3;
            const floatOffset = Math.sin(time * floatSpeed + phase) * floatAmplitude;
            
            object.position.y = userData.originalPosition.y + floatOffset;
        }
        
        if (enableScrollResponse && userData.originalPosition) {
            const scrollY = this.scrollOffset * scrollInfluence * 1.75;
            const scrollRotation = this.scrollOffset * Math.PI * 0.08 * scrollInfluence;
            
            object.position.z = userData.originalPosition.z - scrollY * 0.5;
            
            if (!enableRotation) {
                object.rotation.y = scrollRotation;
            }
        }
    }
    
    /**
     * Apply parallax effect based on scroll
     */
    applyParallax(object, scrollProgress, depth = 1) {
        if (!object || !object.userData.originalPosition) return;
        
        const parallaxY = scrollProgress * depth * 3;
        object.position.y = object.userData.originalPosition.y - parallaxY;
    }
    
    /**
     * Clear all registered objects
     */
    clear() {
        this.animatedObjects = [];
    }
    
    /**
     * Get count of animated objects
     */
    getObjectCount() {
        return this.animatedObjects.length;
    }
}
