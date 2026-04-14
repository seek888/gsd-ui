/**
 * Logger Library
 *
 * Implements dual logging strategy per D-03:
 * - Console output for development debugging
 * - File logging to ~/.gsd-ui/logs/ for diagnostics
 */

import { BaseDirectory, writeFile, mkdir, exists } from '@tauri-apps/plugin-fs';

/**
 * Log directory in user's home directory
 */
const LOG_DIR = '.gsd-ui/logs';

/**
 * Log entry format
 */
interface LogEntry {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  context?: string;
  message: string;
  stack?: string;
}

/**
 * Formats a log entry into a string
 * Format: [YYYY-MM-DD HH:mm:ss] [LEVEL] [context]
 *         {message}
 *         {stack}
 */
function formatLogEntry(entry: LogEntry): string {
  const lines: string[] = [];

  // Header: [timestamp] [level] [context]
  const contextPart = entry.context ? ` [${entry.context}]` : '';
  lines.push(`[${entry.timestamp}] [${entry.level}]${contextPart}`);

  // Message
  lines.push(entry.message);

  // Stack trace if available
  if (entry.stack) {
    lines.push(entry.stack);
  }

  return lines.join('\n') + '\n' + '\n'; // Extra newline for separation
}

/**
 * Gets the current timestamp in ISO format (YYYY-MM-DD HH:mm:ss)
 */
function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Gets the log filename for the current date
 * Format: error-YYYY-MM-DD.log
 */
function getLogFilename(): string {
  const now = new Date();
  const date = now.toISOString().substring(0, 10); // YYYY-MM-DD
  return `error-${date}.log`;
}

/**
 * Ensures the log directory exists
 */
async function ensureLogDirectory(): Promise<void> {
  const logPath = LOG_DIR;

  try {
    // Check if directory exists
    const dirExists = await exists(logPath, { baseDir: BaseDirectory.Home });

    if (!dirExists) {
      // Create directory recursively
      await mkdir(logPath, { baseDir: BaseDirectory.Home, recursive: true });
    }
  } catch (err) {
    // If we can't create the log directory, log to console only
    console.error('Failed to ensure log directory:', err);
  }
}

/**
 * Writes a log message to the log file
 * Per D-03: File logging to ~/.gsd-ui/logs/
 *
 * @param message - The formatted log message to write
 */
export async function logToFile(message: string): Promise<void> {
  try {
    await ensureLogDirectory();

    const filename = getLogFilename();
    const filepath = `${LOG_DIR}/${filename}`;

    // Append to existing log file
    // Convert string to Uint8Array for Tauri fs plugin
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    await writeFile(filepath, data, {
      baseDir: BaseDirectory.Home,
      append: true,
    });
  } catch (err) {
    // If file logging fails, at least log the error to console
    console.error('Failed to write to log file:', err);
  }
}

/**
 * Logs an error to both console and file
 * Per D-03: Dual logging (console + file)
 *
 * @param error - The error to log
 * @param context - Optional context about where the error occurred
 */
export function logError(error: Error, context?: string): void {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: 'ERROR',
    context,
    message: error.message,
    stack: error.stack,
  };

  const formatted = formatLogEntry(entry);

  // Console output
  console.error(formatted);

  // File output (async, don't wait)
  logToFile(formatted).catch(() => {
    // Error already logged in logToFile
  });
}

/**
 * Logs a warning message to both console and file
 *
 * @param message - The warning message
 * @param context - Optional context
 */
export function logWarn(message: string, context?: string): void {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: 'WARN',
    context,
    message,
  };

  const formatted = formatLogEntry(entry);

  console.warn(formatted);
  logToFile(formatted).catch(() => {});
}

/**
 * Logs an info message to both console and file
 *
 * @param message - The info message
 * @param context - Optional context
 */
export function logInfo(message: string, context?: string): void {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: 'INFO',
    context,
    message,
  };

  const formatted = formatLogEntry(entry);

  console.log(formatted);
  logToFile(formatted).catch(() => {});
}

/**
 * Logs a debug message to console only (not to file)
 * Debug messages are verbose and can clutter log files
 *
 * @param message - The debug message
 * @param context - Optional context
 */
export function logDebug(message: string, context?: string): void {
  const contextPrefix = context ? `[${context}] ` : '';
  console.debug(`[DEBUG] ${contextPrefix}${message}`);
}
