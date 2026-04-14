import { create } from 'zustand';
import { getSetting, setSetting } from '@/lib/store';

export type ActiveView = 'dashboard' | 'roadmap' | 'terminal' | 'documents';

// Settings keys stored in gsd-ui-settings.json:
// - projectPath: string | null (from projectStore)
// - activeView: 'dashboard' | 'roadmap' | 'terminal' | 'documents' (from uiStore)
// - sidebarCollapsed: boolean (from uiStore)

interface UIState {
  activeView: ActiveView;
  sidebarCollapsed: boolean;
  setActiveView: (view: ActiveView) => void;
  toggleSidebar: () => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeView: 'dashboard',
  sidebarCollapsed: false,

  setActiveView: (view) => {
    set({ activeView: view });
    // Auto-save after state change
    get().saveSettings().catch((err) => {
      console.error('Failed to save activeView:', err);
    });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
    // Auto-save after state change
    get().saveSettings().catch((err) => {
      console.error('Failed to save sidebarCollapsed:', err);
    });
  },

  loadSettings: async () => {
    try {
      const savedView = await getSetting<ActiveView>('activeView', 'dashboard');
      const savedCollapsed = await getSetting<boolean>('sidebarCollapsed', false);
      set({ activeView: savedView, sidebarCollapsed: savedCollapsed });
    } catch (err) {
      console.error('Failed to load UI settings:', err);
      // Use default values on failure (T-05-02-03: mitigate - don't block app startup)
    }
  },

  saveSettings: async () => {
    try {
      const { activeView, sidebarCollapsed } = get();
      await setSetting('activeView', activeView);
      await setSetting('sidebarCollapsed', sidebarCollapsed);
    } catch (err) {
      console.error('Failed to save UI settings:', err);
      // Don't throw - UI state changes should not be blocked by save failures
    }
  },
}));
