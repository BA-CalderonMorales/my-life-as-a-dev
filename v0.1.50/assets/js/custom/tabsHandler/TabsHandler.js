/**
 * TabsHandler
 * 
 * This class provides functionality for managing tabbed content interfaces
 * in the documentation. It handles tab switching, persistence, and animations.
 */

import { defaultLogger } from '../logger/index.js';

// Create a module-specific logger instance
const logger = defaultLogger.setModule('tabsHandler');

export class TabsHandler {
  constructor() {
    this.tabContainers = [];
    this.activeTabKey = 'mkdocs-active-tab';
    this.initialized = false;
  }

  /**
   * Initialize the tabs functionality
   */
  initialize() {
    logger.info('Initializing tabs handler', 'initialize');
    
    // Find all tabbed containers
    this.tabContainers = Array.from(document.querySelectorAll('.tabbed-set'));
    
    if (this.tabContainers.length === 0) {
      logger.info('No tabbed content found, skipping tab initialization', 'initialize');
      return;
    }
    
    // Set up each tab container
    this.tabContainers.forEach((container, containerIndex) => {
      this.setupTabContainer(container, containerIndex);
    });
    
    this.initialized = true;
    logger.info(`Initialized ${this.tabContainers.length} tab containers`, 'initialize');
  }

  /**
   * Set up a single tab container
   * @param {HTMLElement} container - The tabbed-set container
   * @param {number} containerIndex - The index of the container (for unique IDs)
   */
  setupTabContainer(container, containerIndex) {
    // Find all tabs in this container
    const labels = Array.from(container.querySelectorAll('.tabbed-labels > label'));
    const contents = Array.from(container.querySelectorAll('.tabbed-content > section'));
    
    // Skip if no tabs found
    if (labels.length === 0 || contents.length === 0) {
      logger.warn('Tab container has no labels or contents', 'setupTabContainer');
      return;
    }
    
    // Create a unique ID for this tab container
    const containerId = container.id || `tabbed-set-${containerIndex}`;
    if (!container.id) {
      container.id = containerId;
    }
    
    // Set up click handlers
    labels.forEach((label, index) => {
      // Skip if this tab is already set up
      if (label.getAttribute('data-tab-handler')) return;
      
      // Mark this tab as initialized
      label.setAttribute('data-tab-handler', 'true');
      
      // Get the input associated with this label
      const input = document.getElementById(label.getAttribute('for'));
      if (!input) return;
      
      // Set unique tab ID if not already set
      const tabId = label.id || `${containerId}-tab-${index}`;
      if (!label.id) {
        label.id = tabId;
      }
      
      // Set up click handler
      input.addEventListener('change', () => {
        if (input.checked) {
          this.activateTab(containerId, index, labels, contents);
        }
      });
      
      // If the input is already checked, activate the tab
      if (input.checked) {
        this.activateTab(containerId, index, labels, contents);
      }
    });
    
    // Try to restore active tab from localStorage
    this.restoreActiveTab(containerId, labels, contents);
    
    logger.debug(`Tab container setup complete: ${containerId} (${labels.length} tabs)`, 'setupTabContainer');
  }

  /**
   * Activate a specific tab
   * @param {string} containerId - The ID of the tab container
   * @param {number} tabIndex - The index of the tab to activate
   * @param {HTMLElement[]} labels - The tab labels
   * @param {HTMLElement[]} contents - The tab contents
   */
  activateTab(containerId, tabIndex, labels, contents) {
    // Update active states
    labels.forEach((label, i) => {
      if (i === tabIndex) {
        label.classList.add('tabbed-label--active');
      } else {
        label.classList.remove('tabbed-label--active');
      }
    });
    
    contents.forEach((content, i) => {
      if (i === tabIndex) {
        content.classList.add('tabbed-content--active');
        
        // Add animation class
        setTimeout(() => {
          content.classList.add('tab-animated');
        }, 50);
      } else {
        content.classList.remove('tabbed-content--active');
        content.classList.remove('tab-animated');
      }
    });
    
    // Save the active tab in localStorage
    this.saveActiveTab(containerId, tabIndex);
    
    logger.debug(`Tab activated: ${containerId} tab ${tabIndex}`, 'activateTab');
  }

  /**
   * Save the active tab to localStorage
   * @param {string} containerId - The ID of the tab container
   * @param {number} tabIndex - The index of the active tab
   */
  saveActiveTab(containerId, tabIndex) {
    try {
      const activeTabsData = localStorage.getItem(this.activeTabKey);
      const activeTabs = activeTabsData ? JSON.parse(activeTabsData) : {};
      
      activeTabs[containerId] = tabIndex;
      localStorage.setItem(this.activeTabKey, JSON.stringify(activeTabs));
      
      logger.debug(`Saved active tab: ${containerId} = ${tabIndex}`, 'saveActiveTab');
    } catch (error) {
      logger.error(`Error saving active tab: ${error.message}`, 'saveActiveTab');
    }
  }

  /**
   * Restore the active tab from localStorage
   * @param {string} containerId - The ID of the tab container
   * @param {HTMLElement[]} labels - The tab labels
   * @param {HTMLElement[]} contents - The tab contents
   */
  restoreActiveTab(containerId, labels, contents) {
    try {
      const activeTabsData = localStorage.getItem(this.activeTabKey);
      if (!activeTabsData) return;
      
      const activeTabs = JSON.parse(activeTabsData);
      const activeTabIndex = activeTabs[containerId];
      
      if (activeTabIndex !== undefined && 
          activeTabIndex >= 0 && 
          activeTabIndex < labels.length) {
        
        // Get the input associated with this tab
        const label = labels[activeTabIndex];
        const input = document.getElementById(label.getAttribute('for'));
        
        if (input && !input.checked) {
          // Set the input as checked, which will trigger the change event
          input.checked = true;
          
          // Manually activate the tab in case the change event doesn't fire
          this.activateTab(containerId, activeTabIndex, labels, contents);
          
          logger.debug(`Restored active tab: ${containerId} tab ${activeTabIndex}`, 'restoreActiveTab');
        }
      }
    } catch (error) {
      logger.error(`Error restoring active tab: ${error.message}`, 'restoreActiveTab');
    }
  }
}
