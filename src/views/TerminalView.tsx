import { useState, useCallback } from "react";
import type { Terminal } from "@xterm/xterm";
import { useCLIStore } from "@/stores/cliStore";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, XCircle } from "lucide-react";
import { TerminalOutput } from "@/components/terminal/TerminalOutput";
import { CommandSidebar } from "@/components/terminal/CommandSidebar";

export function TerminalView() {
  const [hasSelection, setHasSelection] = useState(false);
  const { terminalRef, setTerminalRef, clearTerminal, isRunning, killCommand } = useCLIStore();

  const handleTerminalReady = useCallback((terminal: Terminal) => {
    setTerminalRef(terminal);
  }, [setTerminalRef]);

  const handleSelectionChange = useCallback((hasSel: boolean) => {
    setHasSelection(hasSel);
  }, []);

  const handleCopy = useCallback(() => {
    // ClipboardAddon handles native copy, but we also support manual copy
    const selection = terminalRef?.getSelection();
    if (selection) {
      navigator.clipboard.writeText(selection)
        .catch((err) => {
          console.error('Failed to copy to clipboard:', err);
          // Could show a toast notification here (WR-03)
        });
    }
  }, [terminalRef]);

  const handleClear = useCallback(() => {
    clearTerminal();
  }, [clearTerminal]);

  const handleCancel = useCallback(async () => {
    await killCommand();
  }, [killCommand]);

  return (
    <div className="h-full flex flex-row">
      {/* Command Sidebar - 200px width per D-01 */}
      <div className="shrink-0 w-[200px] border-r overflow-y-auto">
        <CommandSidebar />
      </div>

      {/* Terminal Area - flex-1 to fill remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Terminal Header */}
        <div className="shrink-0 px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-medium">Terminal</h2>
          <div className="flex items-center gap-2">
            {isRunning && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                title="Cancel running command"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!hasSelection}
              title="Copy selection"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              title="Clear terminal"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="flex-1 overflow-hidden">
          <TerminalOutput
            onSelectionChange={handleSelectionChange}
            onTerminalReady={handleTerminalReady}
          />
        </div>
      </div>
    </div>
  );
}
