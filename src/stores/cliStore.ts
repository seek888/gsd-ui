import { create } from 'zustand';
import type { Child } from '@tauri-apps/plugin-shell';
import { runCommand } from '@/lib/shell';

const MAX_OUTPUT_LINES = 10000;

interface RunningProcess {
  pid: number;
  name: string;
  child: Child;
}

interface CLIState {
  runningProcess: RunningProcess | null;
  output: string[];
  isRunning: boolean;
  error: string | null;
  clearError: () => void;
  executeCommand: (name: string, args: string[]) => Promise<number>;
  appendOutput: (line: string, source?: 'stdout' | 'stderr') => void;
  killCommand: () => Promise<void>;
  clearOutput: () => void;
}

export const useCLIStore = create<CLIState>((set, get) => ({
  runningProcess: null,
  output: [],
  isRunning: false,
  error: null,

  clearError: () => set({ error: null }),

  executeCommand: async (name, args) => {
    const { clearOutput } = get();
    clearOutput();

    return new Promise((resolve, reject) => {
      runCommand(
        name,
        args,
        (data) => get().appendOutput(data, 'stdout'),
        (data) => get().appendOutput(data, 'stderr')
      ).then((child) => {
        set({
          runningProcess: { pid: child.pid, name, child },
          isRunning: true,
        });
        resolve(child.pid);

        // Handle process exit
        child.on('close', () => {
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
        await runningProcess.child.kill();
        set({ runningProcess: null, isRunning: false, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        set({ error: `Failed to kill process: ${message}` });
      }
    }
  },

  clearOutput: () => set({ output: [] }),
}));
