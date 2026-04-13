import { create } from 'zustand';
import type { Child } from '@tauri-apps/plugin-shell';
import type { Terminal } from '@xterm/xterm';
import { runCommand, type CommandWithEvents } from '@/lib/shell';

const MAX_OUTPUT_LINES = 10000;

interface RunningProcess {
  pid: number;
  name: string;
  child: Child;
  command: CommandWithEvents;
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
  killCommand: () => Promise<void>;
  clearOutput: () => void;
  clearTerminal: () => void;
}

export const useCLIStore = create<CLIState>((set, get) => ({
  runningProcess: null,
  output: [],
  isRunning: false,
  error: null,
  terminalRef: null,

  setTerminalRef: (terminal) => set({ terminalRef: terminal }),

  clearError: () => set({ error: null }),

  executeCommand: async (name, args) => {
    const { clearOutput, runningProcess } = get();

    // Kill existing process before starting new one (CR-04)
    if (runningProcess) {
      try {
        await runningProcess.child.kill();
      } catch (err) {
        console.error('Failed to kill existing process:', err);
      }
    }

    clearOutput();

    return new Promise((resolve, reject) => {
      runCommand(
        name,
        args,
        (data) => get().appendOutput(data, 'stdout'),
        (data) => get().appendOutput(data, 'stderr')
      ).then((commandWithEvents) => {
        const { child, onClose } = commandWithEvents;
        set({
          runningProcess: { pid: child.pid, name, child, command: commandWithEvents },
          isRunning: true,
        });
        resolve(child.pid);

        // Listen for process completion
        onClose(() => {
          set({ runningProcess: null, isRunning: false });
        });
      }).catch(reject);
    });
  },

  appendOutput: (line, source = 'stdout') => {
    const { terminalRef } = get();
    set((state) => {
      const newOutput = [...state.output, `[${source}] ${line}`];
      if (newOutput.length > MAX_OUTPUT_LINES) {
        newOutput.splice(0, newOutput.length - MAX_OUTPUT_LINES);
      }

      // Write to terminal instance (CR-02)
      if (terminalRef) {
        terminalRef.write(`${line}\r\n`);
      }

      return { output: newOutput };
    });
  },

  killCommand: async () => {
    const { runningProcess } = get();
    if (runningProcess) {
      try {
        await runningProcess.child.kill();
        set({ runningProcess: null, isRunning: false, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        set({ error: `Failed to kill process: ${message}` });
      }
    }
  },

  clearOutput: () => set({ output: [] }),

  clearTerminal: () => {
    const { terminalRef } = get();
    terminalRef?.clear();
  },
}));
