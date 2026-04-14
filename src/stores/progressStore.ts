/**
 * Progress data Zustand store
 * Caches roadmap and session state from gsd-tools CLI
 */

import { create } from 'zustand';
import type { Phase, SessionState, RoadmapData, LoadingState } from '@/types/progress';
import { analyzeRoadmap, getStateSnapshot } from '@/lib/gsd-tools';

interface ProgressState {
  // Data state
  roadmapData: RoadmapData | null;
  sessionState: SessionState | null;
  loadingState: LoadingState;
  error: string | null;

  // Expansion state (for accordion)
  expandedPhases: Set<number>;

  // Actions
  loadProgressData: (projectPath: string) => Promise<void>;
  refreshData: (projectPath: string) => Promise<void>;
  togglePhaseExpansion: (phaseNumber: number) => void;
  expandPhase: (phaseNumber: number) => void;
  collapsePhase: (phaseNumber: number) => void;
  expandAll: () => void;
  collapseAll: () => void;
  clearError: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  // Initial state
  roadmapData: null,
  sessionState: null,
  loadingState: 'idle',
  error: null,
  expandedPhases: new Set<number>(),

  /**
   * Load progress data (initial load or refresh)
   */
  loadProgressData: async (projectPath: string) => {
    set({ loadingState: 'loading', error: null });

    try {
      // Load roadmap and state data in parallel
      const [roadmapData, sessionState] = await Promise.all([
        analyzeRoadmap(projectPath),
        getStateSnapshot(projectPath),
      ]);

      set({
        roadmapData,
        sessionState,
        loadingState: 'success',
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({
        loadingState: 'error',
        error: `Failed to load progress data: ${message}`,
        roadmapData: null,
        sessionState: null,
      });
    }
  },

  /**
   * Refresh data (reload)
   */
  refreshData: async (projectPath: string) => {
    await get().loadProgressData(projectPath);
  },

  /**
   * Toggle phase expand/collapse state
   */
  togglePhaseExpansion: (phaseNumber: number) => {
    set((state) => {
      const newExpanded = new Set(state.expandedPhases);
      if (newExpanded.has(phaseNumber)) {
        newExpanded.delete(phaseNumber);
      } else {
        newExpanded.add(phaseNumber);
      }
      return { expandedPhases: newExpanded };
    });
  },

  /**
   * Expand specific phase
   */
  expandPhase: (phaseNumber: number) => {
    set((state) => {
      const newExpanded = new Set(state.expandedPhases);
      newExpanded.add(phaseNumber);
      return { expandedPhases: newExpanded };
    });
  },

  /**
   * Collapse specific phase
   */
  collapsePhase: (phaseNumber: number) => {
    set((state) => {
      const newExpanded = new Set(state.expandedPhases);
      newExpanded.delete(phaseNumber);
      return { expandedPhases: newExpanded };
    });
  },

  /**
   * Expand all phases
   */
  expandAll: () => {
    const { roadmapData } = get();
    if (roadmapData) {
      const allPhaseNumbers = roadmapData.phases.map(p => p.number);
      set({ expandedPhases: new Set(allPhaseNumbers) });
    }
  },

  /**
   * Collapse all phases
   */
  collapseAll: () => {
    set({ expandedPhases: new Set() });
  },

  /**
   * Clear error state
   */
  clearError: () => set({ error: null }),
}));
