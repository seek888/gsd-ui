import { create } from 'zustand';
import type { Terminal } from '@xterm/xterm';
import { runCommand, type CommandWithEvents } from '@/lib/shell';

const MAX_OUTPUT_LINES = 10000;

interface RunningProcess {
  pid: number;
  name: string;
  commandWithEvents: CommandWithEvents;
}

interface CLIState {
  runningProcess: RunningProcess | null;
  output: string[];
  isRunning: boolean;
  error: string | null;
  terminalRef: Terminal | null;
  setTerminalRef: (terminal: Terminal | null) => void;
  clearError: () => void;
  executeCommand: (name: string, args: string[]) => Promise<number>;
  appendOutput: (line: string, source?: 'stdout' | 'stderr') => void;
  writeStdout: (data: string) => void;
  testANSI: () => void;
  killCommand: () => Promise<void>;
  clearOutput: () => void;
}

export const useCLIStore = create<CLIState>((set, get) => ({
  runningProcess: null,
  output: [],
  isRunning: false,
  error: null,
  terminalRef: null,

  setTerminalRef: (terminal) => set({ terminalRef: terminal }),

  clearError: () => set({ error: null }),

  // Write directly to terminal (preserves ANSI colors)
  writeStdout: (data: string) => {
    const { terminalRef } = get();
    if (terminalRef) {
      terminalRef.write(data);
    }
  },

  // Test ANSI color rendering
  testANSI: () => {
    const { terminalRef } = get();
    if (!terminalRef) return;

    terminalRef.writeln('\x1b[1;37m=== ANSI Color Test ===\x1b[0m');
    terminalRef.writeln('');

    // Standard colors
    terminalRef.writeln('\x1b[31mRed text (error)\x1b[0m');
    terminalRef.writeln('\x1b[32mGreen text (success)\x1b[0m');
    terminalRef.writeln('\x1b[33mYellow text (warning)\x1b[0m');
    terminalRef.writeln('\x1b[34mBlue text (info)\x1b[0m');
    terminalRef.writeln('\x1b[35mMagenta text (accent)\x1b[0m');
    terminalRef.writeln('\x1b[36mCyan text (highlight)\x1b[0m');
    terminalRef.writeln('\x1b[37mWhite text (default)\x1b[0m');
    terminalRef.writeln('');

    // Bright colors
    terminalRef.writeln('\x1b[1;31mBright red text\x1b[0m');
    terminalRef.writeln('\x1b[1;32mBright green text\x1b[0m');
    terminalRef.writeln('\x1b[1;33mBright yellow text\x1b[0m');
    terminalRef.writeln('\x1b[1;34mBright blue text\x1b[0m');
    terminalRef.writeln('');

    // Text attributes
    terminalRef.writeln('\x1b[1mBold text\x1b[0m');
    terminalRef.writeln('\x1b[4mUnderlined text\x1b[0m');
    terminalRef.writeln('\x1b[1;4mBold and underlined\x1b[0m');
    terminalRef.writeln('');

    terminalRef.writeln('\x1b[1;32m✓ ANSI colors working correctly!\x1b[0m');
    terminalRef.writeln('');
  },

  executeCommand: async (name, args) => {
    const { clearOutput } = get();
    clearOutput();

    return new Promise((resolve, reject) => {
      runCommand(
        name,
        args,
        (data) => get().appendOutput(data, 'stdout'),
        (data) => get().appendOutput(data, 'stderr')
      ).then((commandWithEvents) => {
        const { child } = commandWithEvents;

        set({
          runningProcess: { pid: child.pid, name, commandWithEvents },
          isRunning: true,
        });
        resolve(child.pid);

        // Handle process exit
        commandWithEvents.onClose(() => {
          set({ runningProcess: null, isRunning: false });
        });
      }).catch(reject);
    });
  },

  appendOutput: (line, source = 'stdout') => {
    set((state) => {
      const newOutput = [...state.output, `[${source}] ${line}`];
      if (newOutput.length > MAX_OUTPUT_LINES) {
        newOutput.splice(0, newOutput.length - MAX_OUTPUT_LINES);
      }
      return { output: newOutput };
    });
  },

  killCommand: async () => {
    const { runningProcess } = get();
    if (runningProcess) {
      try {
        await runningProcess.commandWithEvents.child.kill();
        set({ runningProcess: null, isRunning: false, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        set({ error: `Failed to kill process: ${message}` });
      }
    }
  },

  clearOutput: () => set({ output: [] }),
}));
