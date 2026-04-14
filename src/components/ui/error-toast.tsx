import * as React from "react";
import { toast as sonnerToast, Toaster } from "sonner";
import { AlertTriangle } from "lucide-react";
import type { ErrorItem } from "@/stores/errorStore";
import { Button } from "@/components/ui/button";

export interface ErrorToastProps {
  error: ErrorItem;
  onClose: () => void;
  onRetry?: () => void;
}

/**
 * ErrorToast component for displaying retryable errors as transient notifications
 * Per D-02: Used for RETRYABLE category errors
 *
 * Features:
 * - Uses sonner library for toast notifications
 * - Auto-dismisses after 3 seconds
 * - Yellow/orange warning colors
 * - Shows brief error message
 * - Optional retry button
 */
export function ErrorToast({ error, onClose, onRetry }: ErrorToastProps) {
  const handleToastClose = () => {
    onClose();
  };

  React.useEffect(() => {
    const toastId = sonnerToast.error(
      (
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="text-sm text-muted-foreground">
              {error.context && <span className="font-semibold">{error.context}: </span>}
              {error.message}
            </p>
            {onRetry && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onRetry();
                    sonnerToast.dismiss(toastId);
                  }}
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
        </div>
      ),
      {
        duration: 3000, // Auto-dismiss after 3 seconds
        onDismiss: handleToastClose,
        closeButton: true,
      }
    );

    return () => {
      sonnerToast.dismiss(toastId);
    };
  }, [error, onClose, onRetry]);

  // This component doesn't render anything directly
  // It uses sonner to show the toast
  return null;
}

ErrorToast.displayName = "ErrorToast";

/**
 * Toaster component that must be mounted in the app root
 * Place this in your App.tsx or root component
 */
export function ErrorToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      }}
    />
  );
}

ErrorToaster.displayName = "ErrorToaster";

/**
 * Hook to show a toast error from an ErrorItem
 */
export function useErrorToast() {
  const showError = React.useCallback((error: ErrorItem, onRetry?: () => void) => {
    sonnerToast.error(
      (
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="text-sm text-muted-foreground">
              {error.context && <span className="font-semibold">{error.context}: </span>}
              {error.message}
            </p>
            {onRetry && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onRetry();
                    sonnerToast.dismiss();
                  }}
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
        </div>
      ),
      {
        duration: 3000,
        closeButton: true,
      }
    );
  }, []);

  return { showError };
}
