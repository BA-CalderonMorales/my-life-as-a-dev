/**
 * Logger.js - A configurable logging utility for My Life as a Dev
 * 
 * Follows principles:
 * - SOLID: Single responsibility, handling only logging concerns
 * - DRY: Avoids repeated log formatting code
 * - KISS: Simple API with straightforward configuration
 * - YAGNI: Includes only necessary features without overengineering
 */

class Logger {
  /**
   * Creates a new Logger instance with the specified configuration
   * 
   * @param {Object} config - Configuration options
   * @param {boolean} [config.isDevelopment=false] - Whether we're in development mode (enables logging)
   * @param {string} [config.module='app'] - Module name to include in log entries
   * @param {string} [config.logLevel='info'] - Minimum log level to display (debug, info, warn, error)
   * @param {boolean} [config.includeTimeStamp=true] - Whether to include timestamps in logs
   */
  constructor(config = {}) {
    // Default configuration
    this.config = {
      isDevelopment: config.isDevelopment !== undefined ? config.isDevelopment : false,
      module: config.module || 'app',
      logLevel: config.logLevel || 'info',
      includeTimeStamp: config.includeTimeStamp !== undefined ? config.includeTimeStamp : true
    };

    // Log level hierarchy (lower index = more verbose)
    this.logLevels = ['debug', 'info', 'warn', 'error'];
    
    // Store original console methods for production use
    this.originalConsole = {
      debug: console.debug,
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    };
    
    // If not in development, replace console methods with our controlled versions
    if (!this.config.isDevelopment) {
      this._disableConsoleLogs();
    }
  }

  /**
   * Determines if the given log level should be displayed based on configuration
   * @param {string} level - The log level to check
   * @returns {boolean} Whether the log level should be displayed
   * @private
   */
  _shouldLog(level) {
    // If not in development, don't log anything except errors
    if (!this.config.isDevelopment && level !== 'error') {
      return false;
    }

    const configLevelIndex = this.logLevels.indexOf(this.config.logLevel);
    const messageLevelIndex = this.logLevels.indexOf(level);
    
    // Only log if the message level is at or above the configured level
    return messageLevelIndex >= configLevelIndex;
  }

  /**
   * Formats a log message with module, function name, and timestamp if enabled
   * @param {string} level - Log level
   * @param {string} message - The message to log
   * @param {string} [functionName] - Name of the function logging the message
   * @returns {string} Formatted log message
   * @private
   */
  _formatMessage(level, message, functionName = '') {
    const parts = [`[${level.toUpperCase()}]`, `[${this.config.module}]`];
    
    if (functionName) {
      parts.push(`[${functionName}]`);
    }
    
    if (this.config.includeTimeStamp) {
      const now = new Date();
      parts.push(`[${now.toISOString()}]`);
    }
    
    parts.push(message);
    return parts.join(' ');
  }

  /**
   * Disables console logs by replacing methods with no-ops
   * @private
   */
  _disableConsoleLogs() {
    const noOp = () => {};
    console.debug = noOp;
    console.log = noOp;
    console.info = noOp;
    console.warn = noOp;
    
    // Keep error logging for critical issues
    console.error = (msg) => {
      if (typeof msg === 'string' && msg.includes('api.github.com')) {
        return; // Silence GitHub API errors
      }
      this.originalConsole.error(msg);
    };
  }

  /**
   * Enables all console logs by restoring original methods
   */
  enableLogs() {
    this.config.isDevelopment = true;
    console.debug = this.originalConsole.debug;
    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
  }

  /**
   * Disables all console logs
   */
  disableLogs() {
    this.config.isDevelopment = false;
    this._disableConsoleLogs();
  }

  /**
   * Sets the current module name
   * @param {string} module - Module name to set
   * @returns {Logger} This logger instance for chaining
   */
  setModule(module) {
    this.config.module = module;
    return this;
  }

  /**
   * Sets the minimum log level
   * @param {string} level - Log level to set (debug, info, warn, error)
   * @returns {Logger} This logger instance for chaining
   */
  setLogLevel(level) {
    if (this.logLevels.includes(level)) {
      this.config.logLevel = level;
    }
    return this;
  }

  /**
   * Logs a debug message
   * @param {string} message - Message to log
   * @param {string} [functionName] - Name of the function logging the message
   * @param {...any} args - Additional arguments to log
   */
  debug(message, functionName, ...args) {
    if (this._shouldLog('debug')) {
      const formattedMessage = this._formatMessage('debug', message, functionName);
      this.originalConsole.debug(formattedMessage, ...args);
    }
  }

  /**
   * Logs an info message
   * @param {string} message - Message to log
   * @param {string} [functionName] - Name of the function logging the message
   * @param {...any} args - Additional arguments to log
   */
  info(message, functionName, ...args) {
    if (this._shouldLog('info')) {
      const formattedMessage = this._formatMessage('info', message, functionName);
      this.originalConsole.info(formattedMessage, ...args);
    }
  }

  /**
   * Logs a warning message
   * @param {string} message - Message to log
   * @param {string} [functionName] - Name of the function logging the message
   * @param {...any} args - Additional arguments to log
   */
  warn(message, functionName, ...args) {
    if (this._shouldLog('warn')) {
      const formattedMessage = this._formatMessage('warn', message, functionName);
      this.originalConsole.warn(formattedMessage, ...args);
    }
  }

  /**
   * Logs an error message
   * @param {string} message - Message to log
   * @param {string} [functionName] - Name of the function logging the message
   * @param {...any} args - Additional arguments to log
   */
  error(message, functionName, ...args) {
    if (this._shouldLog('error')) {
      const formattedMessage = this._formatMessage('error', message, functionName);
      this.originalConsole.error(formattedMessage, ...args);
    }
  }
}

// Export a singleton instance for general use
const defaultLogger = new Logger();

// Initialize based on environment - check for environment variable definitions
(function initializeLogger() {
  // Check if we're in development mode
  const isDevelopment = (() => {
    // Try to detect development environment
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    // Check for URL parameters that might indicate development mode
    const urlParams = new URLSearchParams(window.location.search);
    const devParam = urlParams.get('dev') === 'true';
    
    // If explicitly set in URL param, use that
    if (urlParams.has('dev')) {
      return devParam;
    }
    
    // Otherwise infer from hostname
    return isLocalhost;
  })();
  
  if (isDevelopment) {
    defaultLogger.enableLogs();
    defaultLogger.setLogLevel('debug');
  } else {
    defaultLogger.disableLogs();
  }
})();

export { Logger, defaultLogger };