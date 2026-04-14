import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { ErrorItem } from "@/stores/errorStore";

export interface ErrorDialogProps {
  error: ErrorItem;
  onClose: () => void;
}

/**
 * ErrorDialog component for displaying critical errors in a modal
 * Per D-02: Used for CRITICAL category errors requiring user action
 *
 * Features:
 * - Radix UI Dialog for modal behavior
 * - Red warning icon (AlertCircle)
 * - Modal background overlay
 * - Shows error message and context
 * - Close button for user acknowledgment
 */
export function ErrorDialog({ error, onClose }: ErrorDialogProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>Error</DialogTitle>
          </div>
          <DialogDescription>
            {error.context && (
              <span className="font-semibold">{error.context}: </span>
            )}
            {error.message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

ErrorDialog.displayName = "ErrorDialog";
