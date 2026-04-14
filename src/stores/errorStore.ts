import { create } from 'zustand';
import { ErrorCategory, classifyError } from '@/lib/errorHandler';
import { logError } from '@/lib/logger';

/**
 * Error item stored in the error state
 * Per D-02: Mixed display types based on severity
 */
export interface ErrorItem {
  /** Unique identifier for the error */
  id: string;
  /** Error category for handling strategy */
  category: ErrorCategory;
  /** Human-readable error message */
  message: string;
  /** Optional context about where the error occurred */
  context?: string;
  /** Timestamp when the error occurred */
  timestamp: number;
  /** How the error should be displayed to the user */
  displayType: 'modal' | 'toast' | 'inline';
}

interface ErrorState {
  /** All active errors */
  errors: ErrorItem[];

  /** Add an error to the store
   * Auto-generates UUID as id
   * Maps category to displayType per D-02:
   * - CRITICAL -> modal
   * - RETRYABLE -> toast
   * - INFO -> inline
   */
  addError: (error: Error, category?: ErrorCategory, context?: string) => void;

  /** Clear a specific error by id */
  clearError: (id: string) => void;

  /** Clear all errors */
  clearErrors: () => void;

  /** Get errors filtered by display type */
  getErrorsByDisplayType: (type: 'modal' | 'toast' | 'inline') => ErrorItem[];

  /** Get errors filtered by category */
  getErrorsByCategory: (category: ErrorCategory) => ErrorItem[];
}

/**
 * Generates a unique ID for error items
 */
function generateErrorId(): string {
  return `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Maps error category to display type per D-02
 */
function mapCategoryToDisplayType(category: ErrorCategory): ErrorItem['displayType'] {
  switch (category) {
    case ErrorCategory.CRITICAL:
      return 'modal'; // Critical errors require user action
    case ErrorCategory.RETRYABLE:
      return 'toast'; // Retryable errors shown as transient notifications
    case ErrorCategory.INFO:
    default:
      return 'inline'; // Info errors shown in context
  }
}

export const useErrorStore = create<ErrorState>((set, get) => ({
  errors: [],

  addError: (error, category, context) => {
    // Auto-classify if category not provided
    const classifiedCategory = category || classifyError(error);

    // Create error item
    const errorItem: ErrorItem = {
      id: generateErrorId(),
      category: classifiedCategory,
      message: error.message,
      context,
      timestamp: Date.now(),
      displayType: mapCategoryToDisplayType(classifiedCategory),
    };

    // Log the error
    logError(error, context || `addError (${classifiedCategory})`);

    // Add to store
    set((state) => ({
      errors: [...state.errors, errorItem],
    }));
  },

  clearError: (id) => {
    set((state) => ({
      errors: state.errors.filter((e) => e.id !== id),
    }));
  },

  clearErrors: () => {
    set({ errors: [] });
  },

  getErrorsByDisplayType: (type) => {
    return get().errors.filter((e) => e.displayType === type);
  },

  getErrorsByCategory: (category) => {
    return get().errors.filter((e) => e.category === category);
  },
}));
