import { create } from 'zustand';
import { getSetting, setSetting } from '@/lib/store';
import { checkClaudeInstalled } from '@/lib/shell';

interface ProjectState {
  projectPath: string | null;
  cliInstalled: boolean;
  cliVersion: string | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  setProjectPath: (path: string | null) => void;
  setCliInstalled: (installed: boolean, version?: string) => void;
  loadSettings: () => Promise<void>;
  saveProjectPath: (path: string) => Promise<void>;
  detectCli: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projectPath: null,
  cliInstalled: false,
  cliVersion: null,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  setProjectPath: (path) => set({ projectPath: path }),

  setCliInstalled: (installed, version) => set({
    cliInstalled: installed,
    cliVersion: version || null,
  }),

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const savedPath = await getSetting<string | null>('projectPath', null);
      set({ projectPath: savedPath });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: `Failed to load settings: ${message}` });
    }
    set({ isLoading: false });
  },

  saveProjectPath: async (path) => {
    set({ error: null });
    try {
      await setSetting('projectPath', path);
      set({ projectPath: path });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: `Failed to save project path: ${message}` });
      throw err;
    }
  },

  detectCli: async () => {
    set({ error: null });
    try {
      const result = await checkClaudeInstalled();
      set({
        cliInstalled: result.installed,
        cliVersion: result.version || null,
        error: result.error ? `CLI detection failed: ${result.error}` : null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: `Failed to detect CLI: ${message}` });
    }
  },
}));
