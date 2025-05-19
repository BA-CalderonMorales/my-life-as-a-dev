/**
 * Logger Module Index
 * Main export file for the logger system
 */
import Logger from './Logger.js';

// Create default logger instance
export const defaultLogger = new Logger({
  isDevelopment: true,
  module: 'app',
  logLevel: window.localStorage.getItem('logLevel') || 'info',
  includeTimeStamp: true
});

// Export Logger class for creating custom loggers
export { Logger };

// Default export is the default logger instance
export default defaultLogger;
