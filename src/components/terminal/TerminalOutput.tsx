import { useEffect, useRef, useState, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import "@xterm/xterm/css/xterm.css";
import { XTERM_DARK_THEME } from "@/lib/xtermTheme";
import { JumpToBottom } from "./JumpToBottom";

export interface TerminalOutputProps {
  className?: string;
  onSelectionChange?: (hasSelection: boolean) => void;
  onTerminalReady?: (terminal: Terminal) => void;
}

export function TerminalOutput({ className = "", onSelectionChange, onTerminalReady }: TerminalOutputProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  // Use stable callbacks to avoid re-subscribing to events
  const handleSelectionChangeCallback = useCallback(() => {
    const selection = terminalInstanceRef.current?.getSelection();
    const hasSelection = selection ? selection.length > 0 : false;
    onSelectionChange?.(hasSelection);
  }, [onSelectionChange]);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js terminal per RESEARCH.md Pattern 1
    const term = new Terminal({
      cursorBlink: false, // Per D-09
      fontSize: 14,
      fontFamily: "Menlo, Monaco, Consolas, monospace",
      theme: XTERM_DARK_THEME,
      scrollback: 10000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Load clipboard addon for copy support (OUT-04)
    const clipboardAddon = new ClipboardAddon();
    term.loadAddon(clipboardAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    terminalInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    // Notify parent that terminal is ready
    onTerminalReady?.(term);

    // Track selection state for Copy button visibility
    term.onSelectionChange(handleSelectionChangeCallback);

    // Handle scroll events to detect when user has scrolled up per RESEARCH.md Pattern 3
    const handleScroll = () => {
      const buffer = term.buffer.active;
      // Use the public API for detecting scroll position where possible
      // _ydisp is unfortunately the only way currently - file issue with xterm.js for public API (WR-01)
      const viewportY = (term as any)._core?.viewport?._ydisp || 0;
      const bufferHeight = buffer.length;
      const threshold = 100; // Per D-12: within 100px of bottom

      const isNearBottom = bufferHeight - viewportY < threshold;

      setUserScrolled(!isNearBottom);
    };
    term.onScroll(handleScroll);

    // CRITICAL: Cleanup to prevent memory leaks per RESEARCH.md
    return () => {
      term.onScroll(() => {});
      term.onSelectionChange(() => {});
      term.dispose();
    };
  }, [onTerminalReady, handleSelectionChangeCallback]);

  // Scroll to bottom handler
  const scrollToBottom = () => {
    terminalInstanceRef.current?.scrollToBottom();
    setUserScrolled(false);
  };

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div
        ref={terminalRef}
        className="h-full w-full"
        style={{ minHeight: "100%" }}
      />
      <JumpToBottom visible={userScrolled} onClick={scrollToBottom} />
    </div>
  );
}
