use std::fmt;
use std::io::{self, Write};
use std::sync::Mutex;
use chrono::Local;

/// Log levels for the logger
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
    Trace,
}

impl fmt::Display for LogLevel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            LogLevel::Error => write!(f, "ERROR"),
            LogLevel::Warn => write!(f, "WARN "),
            LogLevel::Info => write!(f, "INFO "),
            LogLevel::Debug => write!(f, "DEBUG"),
            LogLevel::Trace => write!(f, "TRACE"),
        }
    }
}

/// Logger configuration
pub struct Logger {
    level: LogLevel,
    output: Mutex<Box<dyn Write + Send>>,
}

impl Logger {
    /// Create a new logger with the specified log level
    pub fn new(level: LogLevel) -> Self {
        Logger {
            level,
            output: Mutex::new(Box::new(io::stdout())),
        }
    }

    /// Log a message at the specified level
    pub fn log(&self, level: LogLevel, message: &str) -> io::Result<()> {
        if level > self.level {
            return Ok(());
        }

        let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S");
        let mut output = self.output.lock().map_err(|_| {
            io::Error::new(io::ErrorKind::Other, "Failed to acquire lock on output")
        })?;

        writeln!(
            output,
            "[{}] [{}] {}",
            timestamp,
            level,
            message
        )
    }

    // Convenience methods for each log level
    pub fn error(&self, message: &str) -> io::Result<()> {
        self.log(LogLevel::Error, message)
    }

    pub fn warn(&self, message: &str) -> io::Result<()> {
        self.log(LogLevel::Warn, message)
    }

    pub fn info(&self, message: &str) -> io::Result<()> {
        self.log(LogLevel::Info, message)
    }

    pub fn debug(&self, message: &str) -> io::Result<()> {
        self.log(LogLevel::Debug, message)
    }

    pub fn trace(&self, message: &str) -> io::Result<()> {
        self.log(LogLevel::Trace, message)
    }
}

// Default logger instance
lazy_static::lazy_static! {
    pub static ref LOGGER: Logger = Logger::new(LogLevel::Info);
}

// Convenience macros for logging
#[macro_export]
macro_rules! log_error {
    ($($arg:tt)*) => {{
        if let Err(e) = $crate::LOGGER.error(&format!($($arg)*)) {
            eprintln!("Failed to log error: {}", e);
        }
    }};
}

#[macro_export]
macro_rules! log_warn {
    ($($arg:tt)*) => {{
        if let Err(e) = $crate::LOGGER.warn(&format!($($arg)*)) {
            eprintln!("Failed to log warning: {}", e);
        }
    }};
}

#[macro_export]
macro_rules! log_info {
    ($($arg:tt)*) => {{
        if let Err(e) = $crate::LOGGER.info(&format!($($arg)*)) {
            eprintln!("Failed to log info: {}", e);
        }
    }};
}

#[macro_export]
macro_rules! log_debug {
    ($($arg:tt)*) => {{
        if let Err(e) = $crate::LOGGER.debug(&format!($($arg)*)) {
            eprintln!("Failed to log debug: {}", e);
        }
    }};
}

#[macro_export]
macro_rules! log_trace {
    ($($arg:tt)*) => {{
        if let Err(e) = $crate::LOGGER.trace(&format!($($arg)*)) {
            eprintln!("Failed to log trace: {}", e);
        }
    }};
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::{Arc, Mutex};
    use std::io::Cursor;

    #[test]
    fn test_log_level_display() {
        assert_eq!(LogLevel::Error.to_string(), "ERROR");
        assert_eq!(LogLevel::Warn.to_string(), "WARN ");
        assert_eq!(LogLevel::Info.to_string(), "INFO ");
        assert_eq!(LogLevel::Debug.to_string(), "DEBUG");
        assert_eq!(LogLevel::Trace.to_string(), "TRACE");
    }

    #[test]
    fn test_log_level_ordering() {
        assert!(LogLevel::Error > LogLevel::Warn);
        assert!(LogLevel::Warn > LogLevel::Info);
        assert!(LogLevel::Info > LogLevel::Debug);
        assert!(LogLevel::Debug > LogLevel::Trace);
    }

    #[test]
    fn test_logger_level_filtering() -> io::Result<()> {
        let buffer = Arc::new(Mutex::new(Cursor::new(Vec::new())));
        let logger = Logger {
            level: LogLevel::Info,
            output: Mutex::new(Box::new(buffer.lock().unwrap().clone())),
        };

        logger.error("test error")?;
        logger.warn("test warn")?;
        logger.info("test info")?;
        logger.debug("test debug")?;
        logger.trace("test trace")?;

        let output = String::from_utf8(buffer.lock().unwrap().get_ref().to_vec()).unwrap();
        assert!(output.contains("test error"));
        assert!(output.contains("test warn"));
        assert!(output.contains("test info"));
        assert!(!output.contains("test debug"));
        assert!(!output.contains("test trace"));

        Ok(())
    }

    #[test]
    fn test_logger_thread_safety() -> io::Result<()> {
        let logger = Logger::new(LogLevel::Trace);
        let mut handles = vec![];

        for i in 0..10 {
            let logger = Logger {
                level: LogLevel::Trace,
                output: Mutex::new(Box::new(io::sink())),
            };
            handles.push(std::thread::spawn(move || {
                logger.info(&format!("Message from thread {}", i)).unwrap();
            }));
        }

        for handle in handles {
            handle.join().unwrap();
        }

        Ok(())
    }
}