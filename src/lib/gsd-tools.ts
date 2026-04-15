/**
 * gsd-tools CLI wrapper with markdown fallback
 * Provides structured data access for roadmap and state information
 */

import { readTextFile } from '@/lib/fs';
import { runCommand } from '@/lib/shell';
import type {
  Phase, Plan, SessionState, RoadmapData,
  GsdToolsProgressOutput, GsdToolsRoadmapOutput, GsdToolsStateOutput
} from '@/types/progress';

type GsdToolCommand = readonly string[];

/**
 * Execute gsd-tools.cjs command and parse JSON output
 * Returns Promise<{ success: boolean; data?: T; error?: string }>
 */
async function executeGsdTool<T>(
  projectPath: string,
  command: GsdToolCommand
): Promise<{ success: boolean; data?: T; error?: string }> {
  // gsd-tools.cjs is located at .planning/bin/gsd-tools.cjs relative to project root
  // Use absolute path for node to find the script
  const gsdToolsAbsPath = `${projectPath}/.planning/bin/gsd-tools.cjs`;

  try {
    // Collect stdout output
    let stdoutOutput = '';
    let stderrOutput = '';

    const { child, onClose } = await runCommand(
      'node',
      [gsdToolsAbsPath, '--cwd', projectPath, ...command],
      (data) => { stdoutOutput += data; },
      (data) => { stderrOutput += data; },
      { cwd: projectPath }
    );

    // Wait for command completion
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        child.kill();
        resolve({ success: false, error: 'Command timeout after 10s' });
      }, 10000);

      onClose(({ code }) => {
        clearTimeout(timeout);
        if (code === 0) {
          try {
            const json = JSON.parse(stdoutOutput.trim());
            resolve({ success: true, data: json as T });
          } catch (parseErr) {
            resolve({
              success: false,
              error: `Failed to parse JSON output: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`
            });
          }
        } else {
          resolve({
            success: false,
            error: stderrOutput.trim() || `Command exited with code ${code}`
          });
        }
      });
    });
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Convert gsd-tools roadmap output to internal RoadmapData format
 */
function convertRoadmapOutput(output: GsdToolsRoadmapOutput): RoadmapData {
  const phases: Phase[] = output.phases.map((p): Phase => {
    const phaseNumber = parseCliNumber(p.number);
    const phaseName = p.name;
    const plans: Plan[] = Array.isArray(p.plans)
      ? p.plans.map((pl): Plan => ({
          id: pl.id,
          name: pl.name,
          status: pl.hasSummaryMd ? 'complete' : (pl.hasPlanMd ? 'in-progress' : 'not-started'),
          hasPlanMd: pl.hasPlanMd,
          hasSummaryMd: pl.hasSummaryMd,
        }))
      : createPlaceholderPlans(
          phaseNumber,
          parseCliNumber(p.plan_count),
          parseCliNumber(p.summary_count)
        );

    const completedPlans = Array.isArray(p.plans)
      ? plans.filter(pl => pl.status === 'complete').length
      : parseCliNumber(p.summary_count);
    const plansCount = Array.isArray(p.plans)
      ? plans.length
      : parseCliNumber(p.plan_count);

    return {
      number: phaseNumber,
      slug: p.slug || generateSlug(phaseName),
      name: phaseName,
      status: completedPlans === plansCount && plansCount > 0 ? 'complete' :
              (completedPlans > 0 ? 'in-progress' : 'not-started'),
      progress: plansCount > 0 ? Math.round((completedPlans / plansCount) * 100) : 0,
      plansCount,
      completedPlans,
      plans,
      isActive: phaseNumber === parseCliNumber(output.currentPhaseNumber ?? output.current_phase),
    };
  });

  const totalPlans = parseCliNumber(output.totalPlans ?? output.total_plans)
    || phases.reduce((sum, p) => sum + p.plansCount, 0);
  const completedPlans = parseCliNumber(output.completedPlans ?? output.total_summaries)
    || phases.reduce((sum, p) => sum + p.completedPlans, 0);
  const overallProgress = parseCliNumber(output.overallProgress ?? output.progress_percent)
    || (totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0);
  const currentPhaseNumber = parseCliNumber(output.currentPhaseNumber ?? output.current_phase)
    || phases.find((phase) => phase.status !== 'complete')?.number
    || phases.length;

  phases.forEach((phase) => {
    phase.isActive = phase.number === currentPhaseNumber;
  });

  return {
    phases,
    totalPhases: parseCliNumber(output.totalPhases ?? output.phase_count) || phases.length,
    totalPlans,
    completedPlans,
    overallProgress,
    currentPhaseNumber,
  };
}

function convertProgressOutput(output: GsdToolsProgressOutput): RoadmapData {
  const phases: Phase[] = output.phases.map((phase): Phase => {
    const phaseNumber = parseCliNumber(phase.number);
    const plansCount = parseCliNumber(phase.plans);
    const completedPlans = parseCliNumber(phase.summaries);
    const plans = createPlaceholderPlans(phaseNumber, plansCount, completedPlans);

    return {
      number: phaseNumber,
      slug: generateSlug(phase.name),
      name: phase.name,
      status: completedPlans === plansCount && plansCount > 0 ? 'complete' :
              (completedPlans > 0 ? 'in-progress' : 'not-started'),
      progress: plansCount > 0 ? Math.round((completedPlans / plansCount) * 100) : 0,
      plansCount,
      completedPlans,
      plans,
      isActive: false,
    };
  });

  const currentPhaseNumber =
    phases.find((phase) => phase.status !== 'complete')?.number || phases.length;

  phases.forEach((phase) => {
    phase.isActive = phase.number === currentPhaseNumber;
  });

  return {
    phases,
    totalPhases: phases.length,
    totalPlans: parseCliNumber(output.total_plans),
    completedPlans: parseCliNumber(output.total_summaries),
    overallProgress: parseCliNumber(output.percent),
    currentPhaseNumber,
  };
}

/**
 * Convert gsd-tools state output to internal SessionState format
 */
function convertStateOutput(output: GsdToolsStateOutput): SessionState {
  return {
    currentPhase: parseCliNumber(output.currentPhase ?? output.current_phase) || 1,
    currentPlan: parseOptionalCliNumber(output.currentPlan ?? output.current_plan),
    lastActivity: output.lastActivity ?? output.last_activity ?? 'No recent activity',
    blockers: output.blockers?.map((b, i) => ({
      id: `blocker-${i}`,
      description: b.description,
      severity: b.severity || 'medium',
    })) || [],
    decisions: output.decisions?.map((d) => ({
      id: d.id,
      description: d.description,
      phase: d.phase,
    })) || [],
    recentActivity: [], // gsd-tools state-snapshot may not return this field
  };
}

/**
 * Parse ROADMAP.md file, extract phase and plan data (fallback method)
 * Only used when gsd-tools CLI is unavailable
 */
function parseRoadmapMarkdown(content: string): RoadmapData {
  const lines = content.split('\n');
  const phases: Phase[] = [];
  let currentPhase: Partial<Phase> | null = null;
  let currentPlans: Plan[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match phase title: ### Phase X: Name
    const phaseMatch = line.match(/^### Phase (\d+): (.+)/);
    if (phaseMatch) {
      // Save previous phase
      if (currentPhase && currentPhase.name) {
        phases.push({
          number: currentPhase.number!,
          slug: currentPhase.slug || generateSlug(currentPhase.name),
          name: currentPhase.name,
          status: determinePhaseStatus(currentPlans),
          progress: calculatePhaseProgress(currentPlans),
          plansCount: currentPlans.length,
          completedPlans: currentPlans.filter(p => p.status === 'complete').length,
          plans: currentPlans,
          isActive: false, // Calculated later
        });
      }

      const phaseNum = parseInt(phaseMatch[1], 10);
      const phaseName = phaseMatch[2].trim();
      currentPhase = { number: phaseNum, name: phaseName, slug: generateSlug(phaseName) };
      currentPlans = [];
      continue;
    }

    // Match plan list items
    const planMatch = line.match(/^- \[([ x])\] (\d+-\d+): (.+)/);
    if (planMatch && currentPhase) {
      const isComplete = planMatch[1] === 'x';
      const planId = planMatch[2];
      const planName = planMatch[3].trim();

      currentPlans.push({
        id: planId,
        name: planName,
        status: isComplete ? 'complete' : 'not-started',
        hasPlanMd: true,
        hasSummaryMd: isComplete,
      });
    }
  }

  // Add last phase
  if (currentPhase && currentPhase.name) {
    phases.push({
      number: currentPhase.number!,
      slug: currentPhase.slug || generateSlug(currentPhase.name),
      name: currentPhase.name,
      status: determinePhaseStatus(currentPlans),
      progress: calculatePhaseProgress(currentPlans),
      plansCount: currentPlans.length,
      completedPlans: currentPlans.filter(p => p.status === 'complete').length,
      plans: currentPlans,
      isActive: false,
    });
  }

  // Calculate current active phase
  const lastIncompletePhase = phases.find(p => p.status !== 'complete');
  const currentPhaseNumber = lastIncompletePhase ? lastIncompletePhase.number : phases.length;

  // Mark active phase
  phases.forEach(p => {
    p.isActive = p.number === currentPhaseNumber;
  });

  // Calculate overall progress
  const totalPlans = phases.reduce((sum, p) => sum + p.plansCount, 0);
  const completedPlans = phases.reduce((sum, p) => sum + p.completedPlans, 0);
  const overallProgress = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

  return {
    phases,
    totalPhases: phases.length,
    totalPlans,
    completedPlans,
    overallProgress,
    currentPhaseNumber,
  };
}

/**
 * Parse STATE.md file, extract session state (fallback method)
 */
async function parseStateMarkdown(projectPath: string): Promise<SessionState> {
  const statePath = `${projectPath}/.planning/STATE.md`;

  try {
    const content = await readTextFile(statePath);
    const lines = content.split('\n');
    const state: SessionState = {
      currentPhase: 1,
      currentPlan: null,
      lastActivity: '',
      blockers: [],
      decisions: [],
      recentActivity: [],
    };

    let inBlockers = false;
    let inDecisions = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Parse Phase: X
      const phaseMatch = line.match(/^Phase:\s*(\d+)/);
      if (phaseMatch) {
        state.currentPhase = parseInt(phaseMatch[1], 10);
        continue;
      }

      // Parse Plan: Y
      const planMatch = line.match(/^Plan:\s*(.+)/);
      if (planMatch) {
        const planValue = planMatch[1].trim();
        if (planValue !== 'Not started') {
          state.currentPlan = parseInt(planValue.replace(/\D/g, ''), 10) || null;
        }
        continue;
      }

      // Parse Last activity
      const activityMatch = line.match(/^Last activity:\s*(.+)/);
      if (activityMatch) {
        state.lastActivity = activityMatch[1].trim();
        continue;
      }

      // Detect sections
      if (line.includes('Blockers') || line.includes('Concerns')) {
        inBlockers = true;
        inDecisions = false;
        continue;
      }
      if (line.includes('Decisions')) {
        inDecisions = true;
        inBlockers = false;
        continue;
      }

      // Parse blockers
      if (inBlockers && line.trim() && !line.startsWith('#')) {
        if (!line.toLowerCase().includes('none') && !line.toLowerCase().includes('none yet') && line.startsWith('-')) {
          state.blockers.push({
            id: `blocker-${state.blockers.length}`,
            description: line.replace(/^-\s*/, '').trim(),
            severity: 'medium',
          });
        }
      }

      // Parse decisions
      if (inDecisions && line.trim() && !line.startsWith('#') && line.startsWith('-')) {
        state.decisions.push({
          id: `decision-${state.decisions.length}`,
          description: line.replace(/^-\s*/, '').trim(),
        });
      }
    }

    return state;
  } catch (error) {
    console.error('Failed to read STATE.md:', error);
    return {
      currentPhase: 1,
      currentPlan: null,
      lastActivity: 'Unable to load session state',
      blockers: [],
      decisions: [],
      recentActivity: [],
    };
  }
}

/**
 * Parse ROADMAP.md file (fallback entry point)
 */
async function fallbackAnalyzeRoadmap(projectPath: string): Promise<RoadmapData> {
  const roadmapPath = `${projectPath}/.planning/ROADMAP.md`;
  const content = await readTextFile(roadmapPath);
  return parseRoadmapMarkdown(content);
}

/**
 * Get Roadmap data (prioritize gsd-tools CLI, fallback to markdown parsing)
 * Corresponds to decision D-15: Phase progress from `node gsd-tools.cjs roadmap analyze`
 */
export async function analyzeRoadmap(projectPath: string): Promise<RoadmapData> {
  // Try gsd-tools CLI first
  const cliErrors: string[] = [];
  const cliResult = await executeGsdTool<GsdToolsRoadmapOutput>(projectPath, ['roadmap', 'analyze', '--raw']);

  if (cliResult.success && cliResult.data) {
    try {
      return convertRoadmapOutput(cliResult.data);
    } catch (error) {
      cliErrors.push(`roadmap analyze parse failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else if (cliResult.error) {
    cliErrors.push(`roadmap analyze failed: ${cliResult.error}`);
  }

  const progressResult = await executeGsdTool<GsdToolsProgressOutput>(projectPath, ['progress', 'json', '--raw']);
  if (progressResult.success && progressResult.data) {
    try {
      return convertProgressOutput(progressResult.data);
    } catch (error) {
      cliErrors.push(`progress json parse failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else if (progressResult.error) {
    cliErrors.push(`progress json failed: ${progressResult.error}`);
  }

  // CLI failed, fallback to markdown parsing
  console.warn('gsd-tools CLI failed, falling back to markdown parsing:', cliErrors);
  try {
    return await fallbackAnalyzeRoadmap(projectPath);
  } catch (fallbackError) {
    throw new Error(
      `Failed to load roadmap data. CLI error: ${cliErrors.join(' | ') || 'unknown'}. ` +
      `Fallback error: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
    );
  }
}

/**
 * Get Session State data (prioritize gsd-tools CLI, fallback to markdown parsing)
 * Corresponds to decision D-16: Session state from `node gsd-tools.cjs state-snapshot`
 */
export async function getStateSnapshot(projectPath: string): Promise<SessionState> {
  // Try gsd-tools CLI first
  const cliResult = await executeGsdTool<GsdToolsStateOutput>(projectPath, ['state-snapshot', '--raw']);

  if (cliResult.success && cliResult.data) {
    return convertStateOutput(cliResult.data);
  }

  // CLI failed, fallback to markdown parsing
  console.warn('gsd-tools CLI failed, falling back to markdown parsing:', cliResult.error);
  try {
    return await parseStateMarkdown(projectPath);
  } catch (fallbackError) {
    // Return default state instead of throwing error
    return {
      currentPhase: 1,
      currentPlan: null,
      lastActivity: 'Unable to load session state',
      blockers: [],
      decisions: [],
      recentActivity: [],
    };
  }
}

/**
 * Determine phase status based on plan list (fallback)
 */
function determinePhaseStatus(plans: Plan[]): Phase['status'] {
  if (plans.length === 0) return 'not-started';
  const allComplete = plans.every(p => p.status === 'complete');
  const anyComplete = plans.some(p => p.status === 'complete');
  if (allComplete) return 'complete';
  if (anyComplete) return 'in-progress';
  return 'not-started';
}

/**
 * Calculate phase progress percentage (fallback)
 */
function calculatePhaseProgress(plans: Plan[]): number {
  if (plans.length === 0) return 0;
  const completed = plans.filter(p => p.status === 'complete').length;
  return Math.round((completed / plans.length) * 100);
}

/**
 * Generate URL-friendly slug (fallback)
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseCliNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseOptionalCliNumber(value: number | string | null | undefined): number | null {
  const parsed = parseCliNumber(value);
  return parsed > 0 ? parsed : null;
}

function createPlaceholderPlans(
  phaseNumber: number,
  plansCount: number,
  completedPlans: number
): Plan[] {
  return Array.from({ length: plansCount }, (_, index) => {
    const planIndex = index + 1;
    const id = `${String(phaseNumber).padStart(2, '0')}-${String(planIndex).padStart(2, '0')}`;
    const isComplete = planIndex <= completedPlans;

    return {
      id,
      name: `Plan ${id}`,
      status: isComplete ? 'complete' : 'not-started',
      hasPlanMd: true,
      hasSummaryMd: isComplete,
    };
  });
}
