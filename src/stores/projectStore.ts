import { create } from 'zustand';
import { getSetting, setSetting } from '@/lib/store';
import { checkClaudeInstalled } from '@/lib/shell';

interface ProjectState {
  projectPath: string | null;
  cliInstalled: boolean;
  cliVersion: string | null;
  isLoading: boolean;
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

  setProjectPath: (path) => set({ projectPath: path }),

  setCliInstalled: (installed, version) => set({
    cliInstalled: installed,
    cliVersion: version || null,
  }),

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const savedPath = await getSetting<string | null>('projectPath', null);
      set({ projectPath: savedPath });
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
    set({ isLoading: false });
  },

  saveProjectPath: async (path) => {
    await setSetting('projectPath', path);
    set({ projectPath: path });
  },

  detectCli: async () => {
    const result = await checkClaudeInstalled();
    set({
      cliInstalled: result.installed,
      cliVersion: result.version || null,
    });
  },
}));
