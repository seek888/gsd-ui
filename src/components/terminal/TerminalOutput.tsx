import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { XTERM_DARK_THEME } from '@/lib/xtermTheme';

interface TerminalOutputProps {
  className?: string;
}

/**
 * TerminalOutput component using xterm.js with ANSI color support.
 *
 * This component provides a terminal emulator that:
 * - Renders ANSI escape sequences (colors, bold, underline, etc.)
 * - Uses a dark theme matching shadcn/ui
 * - Auto-resizes to fit its container
 * - Provides methods for writing output (write, writeln, clear)
 *
 * @example
 * ```tsx
 * const terminalRef = useRef<Terminal | null>(null);
 * <TerminalOutput ref={terminalRef} className="h-full" />
 *
 * // Write to terminal
 * terminalRef.current?.write('\x1b[31mRed text\x1b[0m\n');
 * ```
 */
export const TerminalOutput = ({ className = '' }: TerminalOutputProps) => {
  const terminalRef = useRef<Terminal | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create xterm.js Terminal instance with dark theme
    const term = new Terminal({
      cursorBlink: false,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
      theme: XTERM_DARK_THEME,
      scrollback: 10000,
      allowProposedApi: true,
    });

    // Create and load the fit addon for auto-resize
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Mount terminal to DOM
    term.open(containerRef.current);
    fitAddon.fit();

    // Store references for external access
    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    // Initial welcome message
    term.writeln('\x1b[1;36mGSD UI Terminal\x1b[0m');
    term.writeln('Ready for output...\r\n');

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`TerminalOutput ${className}`}
      style={{
        // Container fills parent; theme controls actual terminal colors
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default TerminalOutput;
