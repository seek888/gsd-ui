import { create } from 'zustand';

export type ActiveView = 'dashboard' | 'roadmap' | 'terminal' | 'documents';

interface UIState {
  activeView: ActiveView;
  sidebarCollapsed: boolean;
  setActiveView: (view: ActiveView) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeView: 'dashboard',
  sidebarCollapsed: false,
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
