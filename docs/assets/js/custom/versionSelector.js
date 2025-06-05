"use strict";
/**
 * Version Selector module - Re-export from the encapsulated module
 * 
 * This file serves as a compatibility layer that imports and re-exports
 * the VersionSelector class from its dedicated directory structure.
 * This approach ensures better encapsulation while maintaining backward compatibility.
 */

// Import the VersionSelector class from the dedicated module
import VersionSelector from './versionSelector/index.js';

// Re-export the VersionSelector class as the default export
export default VersionSelector;
