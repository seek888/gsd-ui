/**
 * GSD command definitions for the command sidebar.
 *
 * These commands represent the core GSD workflow operations that can be
 * triggered by users via button clicks in the Terminal view.
 *
 * Per CONTEXT.md D-04 through D-07:
 * - Fixed core command set defined in code (not dynamically generated)
 * - Each command has: id, label, description, cliCommand, args, icon
 */

export interface GSDCommand {
  /** Unique identifier for the command */
  id: string;
  /** Display label shown on the button */
  label: string;
  /** Description shown on hover or as subtitle */
  description: string;
  /** CLI program to execute (e.g., 'claude') */
  cliCommand: string;
  /** Arguments to pass to the CLI command */
  args: string[];
  /** Lucide icon name for the button */
  icon: string;
}

/**
 * Core GSD commands available in the command sidebar.
 *
 * Per CONTEXT.md D-05, these are the 6 essential GSD workflow commands:
 * - gsd-next: Advance to the next task/plan
 * - gsd-status: Show current project status
 * - gsd-plan-phase: Create a plan for a specific phase
 * - gsd-execute-phase: Execute all plans in a phase
 * - gsd-verify-work: Run UAT verification on completed work
 * - gsd-code-review: Run code review on a specific phase
 */
export const GSD_COMMANDS: GSDCommand[] = [
  {
    id: 'gsd-next',
    label: 'Next Task',
    description: 'Advance to the next task in current phase',
    cliCommand: 'claude',
    args: ['/gsd-next'],
    icon: 'ArrowRight',
  },
  {
    id: 'gsd-status',
    label: 'Show Status',
    description: 'Display current project status and progress',
    cliCommand: 'claude',
    args: ['/gsd-status'],
    icon: 'Activity',
  },
  {
    id: 'gsd-plan-phase',
    label: 'Plan Phase',
    description: 'Create a plan for a specific phase',
    cliCommand: 'claude',
    args: ['/gsd-plan-phase'],
    icon: 'FileCode',
  },
  {
    id: 'gsd-execute-phase',
    label: 'Execute Phase',
    description: 'Execute all plans in a phase',
    cliCommand: 'claude',
    args: ['/gsd-execute-phase'],
    icon: 'Play',
  },
  {
    id: 'gsd-verify-work',
    label: 'Verify Work',
    description: 'Run UAT verification on completed work',
    cliCommand: 'claude',
    args: ['/gsd-verify-work'],
    icon: 'CheckCircle',
  },
  {
    id: 'gsd-code-review',
    label: 'Code Review',
    description: 'Run code review on a specific phase',
    cliCommand: 'claude',
    args: ['/gsd-code-review'],
    icon: 'MessageSquare',
  },
];
