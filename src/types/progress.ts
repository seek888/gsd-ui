/**
 * Progress data types for GSD UI
 * Defines the structure for roadmap, phases, plans, and session state
 */

/**
 * Plan completion status
 */
export type PlanStatus = 'not-started' | 'in-progress' | 'complete';

/**
 * Individual plan information
 */
export interface Plan {
  id: string;           // e.g., "04-01"
  name: string;         // e.g., "Build phase list view"
  status: PlanStatus;   // Plan status
  hasPlanMd: boolean;   // Whether PLAN.md exists
  hasSummaryMd: boolean;// Whether SUMMARY.md exists
  taskCount?: number;   // Task count (optional)
  requirementIds?: string[]; // Associated requirement IDs (optional)
}

/**
 * Phase information
 */
export interface Phase {
  number: number;       // Phase number (1, 2, 3...)
  slug: string;         // e.g., "progress-state-views"
  name: string;         // e.g., "Progress & State Views"
  status: PlanStatus;   // Phase status
  progress: number;     // Progress percentage (0-100)
  plansCount: number;   // Total plan count
  completedPlans: number;// Completed plan count
  plans: Plan[];        // Plan list
  isActive: boolean;    // Whether this is the current active phase
}

/**
 * Overall project progress data
 */
export interface RoadmapData {
  phases: Phase[];              // All phases
  totalPhases: number;          // Total phase count
  totalPlans: number;           // Total plan count
  completedPlans: number;       // Completed plan count
  overallProgress: number;      // Overall progress percentage (0-100)
  currentPhaseNumber: number;   // Current phase number
}

/**
 * Blocker information
 */
export interface Blocker {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Decision information
 */
export interface Decision {
  id: string;
  description: string;
  phase?: string;
}

/**
 * Session state snapshot
 */
export interface SessionState {
  currentPhase: number;         // Current phase
  currentPlan: number | null;   // Current plan (may be null)
  lastActivity: string;         // Recent activity description
  blockers: Blocker[];          // Blocker list
  decisions: Decision[];        // Key decision list
  recentActivity: string[];     // Recent activity history
}

/**
 * gsd-tools CLI JSON output structure (roadmap analyze)
 */
export interface GsdToolsRoadmapOutput {
  phases: Array<{
    number: number;
    slug: string;
    name: string;
    plans: Array<{
      id: string;
      name: string;
      hasPlanMd: boolean;
      hasSummaryMd: boolean;
    }>;
  }>;
  currentPhaseNumber: number;
}

/**
 * gsd-tools CLI JSON output structure (state-snapshot)
 */
export interface GsdToolsStateOutput {
  currentPhase: number;
  currentPlan: number | null;
  lastActivity?: string;
  blockers?: Array<{
    description: string;
    severity?: 'low' | 'medium' | 'high';
  }>;
  decisions?: Array<{
    id: string;
    description: string;
    phase?: string;
  }>;
}

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
