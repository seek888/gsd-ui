/**
 * Error Handling Library
 *
 * Implements tiered error handling strategy per D-01:
 * - RETRYABLE: Network-related, process-related errors (auto-retry)
 * - CRITICAL: CLI not installed, file permission denied (immediate notification)
 */

/**
 * Error categories for classification and handling strategy
 */
export enum ErrorCategory {
  /** Errors that can be automatically retried (network timeouts, process spawn failures) */
  RETRYABLE = 'retryable',
  /** Critical errors requiring immediate user attention (CLI missing, permission denied) */
  CRITICAL = 'critical',
  /** Informational errors that don't require user action */
  INFO = 'info',
}

/**
 * Retry configuration per D-04: max 3 retries with increasing delays (1s -> 2s -> 3s)
 */
interface RetryConfig {
  maxRetries: number;
  delays: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delays: [1000, 2000, 3000], // Increasing delays per D-04
};

/**
 * Determines if an error is retryable based on its category
 * @param category - The error category to check
 * @returns true if the error is retryable
 */
export function retryable(category: ErrorCategory): boolean {
  return category === ErrorCategory.RETRYABLE;
}

/**
 * Executes a function with automatic retry logic
 * Per D-04: retries up to 3 times with increasing delays (1s -> 2s -> 3s)
 * Only applies to RETRYABLE category errors
 *
 * @param fn - The async function to execute
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise<T> - The result of the function
 * @throws The original error if all retries are exhausted
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, maxRetries };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;

      // Classify the error to determine if we should retry
      const category = classifyError(error);

      // If not retryable or this was the last attempt, throw
      if (!retryable(category) || attempt >= config.maxRetries) {
        throw error;
      }

      // Wait before next retry (increasing delay per D-04)
      const delay = config.delays[Math.min(attempt, config.delays.length - 1)];
      await new Promise(resolve => setTimeout(resolve, delay));

      // Log retry attempt
      console.warn(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms delay:`, error.message);
    }
  }

  // This should never be reached due to the logic above, but TypeScript needs it
  throw lastError || new Error('executeWithRetry failed with unknown error');
}

/**
 * Handles an error based on its category
 * Per D-01: Routes errors to appropriate display mechanism
 *
 * @param error - The error to handle
 * @param category - The error category
 * @param context - Optional context about where the error occurred
 */
export function handleError(error: Error, category: ErrorCategory, context?: string): void {
  // Log the error via logger
  // Note: Import dynamically to avoid circular dependency
  import('./logger').then(({ logError }) => {
    logError(error, context || 'Unknown context');
  });

  // In a full implementation, this would route to errorStore
  // For now, we just log to console
  const contextPrefix = context ? `[${context}] ` : '';
  console.error(`${contextPrefix}Error (${category}):`, error.message);
}

/**
 * Classifies an error into a category based on its message or type
 * Per D-01: Auto-classify errors for retry strategy
 *
 * @param error - The error to classify
 * @returns The error category
 */
export function classifyError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();

  // Network-related errors -> RETRYABLE
  if (
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('enotfound') ||
    message.includes('etimedout') ||
    message.includes('network') ||
    message.includes('fetch failed') ||
    message.includes('connection')
  ) {
    return ErrorCategory.RETRYABLE;
  }

  // Process-related errors -> RETRYABLE
  if (
    message.includes('espawn') ||
    message.includes('spawn') ||
    message.includes('process') ||
    message.includes('child process') ||
    message.includes('terminated')
  ) {
    return ErrorCategory.RETRYABLE;
  }

  // File permission errors -> CRITICAL
  if (
    message.includes('eacces') ||
    message.includes('eperm') ||
    message.includes('permission denied') ||
    message.includes('unauthorized')
  ) {
    return ErrorCategory.CRITICAL;
  }

  // CLI not found -> CRITICAL
  if (
    message.includes('claude: command not found') ||
    message.includes('claude not found') ||
    message.includes('cli not installed') ||
    message.includes('not found') && message.includes('claude')
  ) {
    return ErrorCategory.CRITICAL;
  }

  // Critical file errors (ENOENT for key files) -> CRITICAL
  if (
    message.includes('enoent') && (
      message.includes('.gsd') ||
      message.includes('.planning') ||
      message.includes('config')
    )
  ) {
    return ErrorCategory.CRITICAL;
  }

  // Default to INFO for unclassified errors
  return ErrorCategory.INFO;
}

/**
 * Creates a standardized error object with category and context
 */
export interface CategorizedError extends Error {
  category: ErrorCategory;
  context?: string;
  originalError: Error;
}

/**
 * Wraps an error with category and context information
 */
export function wrapError(error: Error, category: ErrorCategory, context?: string): CategorizedError {
  const wrapped = new Error(error.message) as CategorizedError;
  wrapped.name = error.name;
  wrapped.stack = error.stack;
  wrapped.category = category;
  wrapped.context = context;
  wrapped.originalError = error;
  return wrapped;
}
