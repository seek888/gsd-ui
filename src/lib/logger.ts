/**
 * Logger Library using electron-log
 */

import log from 'electron-log'

/**
 * Log directory is managed by electron-log
 */
const LOG_DIR = '.gsd-ui/logs'

/**
 * Log entry format
 */
interface LogEntry {
  timestamp: string
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'
  context?: string
  message: string
  stack?: string
}

/**
 * Formats a log entry into a string
 */
function formatLogEntry(entry: LogEntry): string {
  const lines: string[] = []
  const contextPart = entry.context ? ` [${entry.context}]` : ''
  lines.push(`[${entry.timestamp}] [${entry.level}]${contextPart}`)
  lines.push(entry.message)
  if (entry.stack) {
    lines.push(entry.stack)
  }
  return lines.join('\n') + '\n\n'
}

/**
 * Gets the current timestamp in ISO format (YYYY-MM-DD HH:mm:ss)
 */
function getTimestamp(): string {
  const now = new Date()
  return now.toISOString().replace('T', ' ').substring(0, 19)
}

/**
 * Logs an error to both console and file
 */
export function logError(error: Error, context?: string): void {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: 'ERROR',
    context,
    message: error.message,
    stack: error.stack,
  }
  const formatted = formatLogEntry(entry)
  console.error(formatted)
  log.error(formatted)
}

/**
 * Logs a warning message
 */
export function logWarn(message: string, context?: string): void {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: 'WARN',
    context,
    message,
  }
  const formatted = formatLogEntry(entry)
  console.warn(formatted)
  log.warn(formatted)
}

/**
 * Logs an info message
 */
export function logInfo(message: string, context?: string): void {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: 'INFO',
    context,
    message,
  }
  const formatted = formatLogEntry(entry)
  console.log(formatted)
  log.info(formatted)
}

/**
 * Logs a debug message
 */
export function logDebug(message: string, context?: string): void {
  const contextPrefix = context ? `[${context}] ` : ''
  console.debug(`[DEBUG] ${contextPrefix}${message}`)
}
