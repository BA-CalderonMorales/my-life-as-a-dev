/**
 * DeviceDetector - Utility for device detection and performance checks
 * Ensures smooth rendering across mobile, tablet, and desktop
 */
export class DeviceDetector {
    constructor() {
        this.cache = {};
    }
    
    /**
     * Check if device is mobile
     */
    isMobile() {
        if (this.cache.isMobile !== undefined) return this.cache.isMobile;
        
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
        
        this.cache.isMobile = mobileRegex.test(userAgent.toLowerCase());
        return this.cache.isMobile;
    }
    
    /**
     * Check if device is tablet
     */
    isTablet() {
        if (this.cache.isTablet !== undefined) return this.cache.isTablet;
        
        const userAgent = navigator.userAgent.toLowerCase();
        const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
        const isTabletSize = window.innerWidth >= 768 && window.innerWidth <= 1024;
        
        this.cache.isTablet = isTabletUA || (this.isMobile() && isTabletSize);
        return this.cache.isTablet;
    }
    
    /**
     * Check if WebGL is supported
     */
    hasWebGL() {
        if (this.cache.hasWebGL !== undefined) return this.cache.hasWebGL;
        
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            this.cache.hasWebGL = !!gl;
        } catch (e) {
            this.cache.hasWebGL = false;
        }
        
        return this.cache.hasWebGL;
    }
    
    /**
     * Check if device prefers reduced motion
     */
    prefersReducedMotion() {
        if (this.cache.prefersReducedMotion !== undefined) return this.cache.prefersReducedMotion;
        
        this.cache.prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
        return this.cache.prefersReducedMotion;
    }
    
    /**
     * Get recommended pixel ratio for device
     */
    getOptimalPixelRatio() {
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        if (this.isMobile()) {
            return Math.min(devicePixelRatio, 1.5);
        }
        
        if (this.isTablet()) {
            return Math.min(devicePixelRatio, 2);
        }
        
        return Math.min(devicePixelRatio, 2);
    }
    
    /**
     * Get device type string
     */
    getDeviceType() {
        if (this.isMobile() && !this.isTablet()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    }
    
    /**
     * Check if Three.js should be enabled
     */
    shouldEnableThreeJS() {
        if (!this.hasWebGL()) return false;
        
        if (this.prefersReducedMotion()) return false;
        
        return true;
    }
    
    /**
     * Get recommended quality settings based on device
     */
    getQualitySettings() {
        const deviceType = this.getDeviceType();
        
        switch (deviceType) {
            case 'mobile':
                return {
                    antialias: false,
                    segments: 16,
                    objectCount: 'minimal',
                    shadowQuality: 'none'
                };
            case 'tablet':
                return {
                    antialias: true,
                    segments: 24,
                    objectCount: 'reduced',
                    shadowQuality: 'low'
                };
            default:
                return {
                    antialias: true,
                    segments: 32,
                    objectCount: 'full',
                    shadowQuality: 'medium'
                };
        }
    }
}
