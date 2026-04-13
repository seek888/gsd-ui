import { create } from 'zustand';
import type { Child } from '@tauri-apps/plugin-shell';
import { runCommand } from '@/lib/shell';

interface RunningProcess {
  pid: number;
  name: string;
  child: Child;
}

interface CLIState {
  runningProcess: RunningProcess | null;
  output: string[];
  isRunning: boolean;
  executeCommand: (name: string, args: string[]) => Promise<number>;
  appendOutput: (line: string, source?: 'stdout' | 'stderr') => void;
  killCommand: () => Promise<void>;
  clearOutput: () => void;
}

export const useCLIStore = create<CLIState>((set, get) => ({
  runningProcess: null,
  output: [],
  isRunning: false,

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
      }).catch(reject);
    });
  },

  appendOutput: (line, source = 'stdout') => {
    set((state) => ({
      output: [...state.output, `[${source}] ${line}`],
    }));
  },

  killCommand: async () => {
    const { runningProcess } = get();
    if (runningProcess) {
      try {
        await runningProcess.child.kill();
      } catch (err) {
        console.error('Failed to kill process:', err);
      }
      set({ runningProcess: null, isRunning: false });
    }
  },

  clearOutput: () => set({ output: [] }),
}));
