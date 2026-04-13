import { useState, useCallback } from "react";
import type { Terminal } from "@xterm/xterm";
import { useCLIStore } from "@/stores/cliStore";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { TerminalOutput } from "@/components/terminal/TerminalOutput";

export function TerminalView() {
  const [hasSelection, setHasSelection] = useState(false);
  const { terminalRef, setTerminalRef, clearTerminal } = useCLIStore();

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
      navigator.clipboard.writeText(selection);
    }
  }, [terminalRef]);

  const handleClear = useCallback(() => {
    clearTerminal();
  }, [clearTerminal]);

  return (
    <div className="h-full flex flex-col">
      {/* Terminal Header */}
      <div className="shrink-0 px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-sm font-medium">Terminal</h2>
        <div className="flex items-center gap-2">
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
  );
}
