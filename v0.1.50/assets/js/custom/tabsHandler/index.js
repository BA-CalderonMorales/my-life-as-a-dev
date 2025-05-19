/**
 * Tabs Handler Module
 * 
 * This module exports the TabsHandler class which provides functionality for 
 * managing tabbed content interfaces in the documentation.
 */

import { TabsHandler } from './TabsHandler.js';

// Initialize tabs when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const tabsHandler = new TabsHandler();
  tabsHandler.initialize();
});

export { TabsHandler };
