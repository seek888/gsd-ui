import { useState, useEffect } from 'react';
import { CheckCircle, X, Loader2, ArrowRight, Activity, FileCode, Play, MessageSquare } from 'lucide-react';
import { GSD_COMMANDS, type GSDCommand } from '@/lib/gsdCommands';
import { useCLIStore } from '@/stores/cliStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Command button states per CONTEXT.md D-14:
 * - idle: Default ghost variant, no spinner
 * - running: disabled, Loader2 spinner with animation, shows PID
 * - success: green outline with Check icon, auto-clears after 3s
 * - failure: red outline with X icon, persists until next action
 */
type CommandState = 'idle' | 'running' | 'success' | 'failure';

/**
 * Map of Lucide icon names to their components.
 * Using direct imports to avoid dynamic type issues.
 */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowRight,
  Activity,
  FileCode,
  Play,
  CheckCircle,
  MessageSquare,
};

/**
 * Get Lucide icon component by name.
 */
function getIcon(iconName: string): React.ComponentType<{ className?: string }> | null {
  return ICON_MAP[iconName] || null;
}

/**
 * CommandSidebar component - displays GSD command buttons in a 200px sidebar.
 *
 * Per CONTEXT.md D-01, D-02, D-03:
 * - Left sidebar within Terminal view
 * - Width 200px matching main app sidebar
 * - Buttons display icon + label + description
 *
 * Per CONTEXT.md D-14, D-15:
 * - Four button states: idle, running, success, failure
 * - Running commands show spinner and PID
 */
export function CommandSidebar() {
  const { runningProcess, executeCommand, isRunning } = useCLIStore();
  const [commandStates, setCommandStates] = useState<Map<string, CommandState>>(new Map());

  // Update command states based on CLI store state
  useEffect(() => {
    if (isRunning && runningProcess) {
      // Set running state for the active command
      setCommandStates((prev) => {
        const next = new Map(prev);
        // Clear previous success/failure states when a new command starts
        for (const [key, state] of next) {
          if (state === 'success' || state === 'failure') {
            next.set(key, 'idle');
          }
        }
        // Find which command is running by matching the name
        const runningCommandId = GSD_COMMANDS.find(
          (cmd) => cmd.args[0] === runningProcess.name
        )?.id;
        if (runningCommandId) {
          next.set(runningCommandId, 'running');
        }
        return next;
      });
    }
  }, [isRunning, runningProcess]);

  // Auto-clear success state after 3 seconds (per D-14)
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    commandStates.forEach((state, commandId) => {
      if (state === 'success') {
        const timer = setTimeout(() => {
          setCommandStates((prev) => {
            const next = new Map(prev);
            next.set(commandId, 'idle');
            return next;
          });
        }, 3000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [commandStates]);

  /**
   * Handle command button click.
   * Executes the command via cliStore and updates button state.
   */
  const handleCommandClick = async (command: GSDCommand) => {
    // Set running state immediately (CR-03)
    setCommandStates((prev) => {
      const next = new Map(prev);
      next.set(command.id, 'running');
      return next;
    });

    try {
      await executeCommand(command.cliCommand, command.args);

      // Process completed successfully - set success state (CR-03)
      setCommandStates((prev) => {
        const next = new Map(prev);
        next.set(command.id, 'success');
        return next;
      });
    } catch (error) {
      // Set failure state on error (CR-03)
      setCommandStates((prev) => {
        const next = new Map(prev);
        next.set(command.id, 'failure');
        return next;
      });
      console.error(`Failed to execute command ${command.id}:`, error);
    }
  };

  /**
   * Determine button variant based on command state.
   */
  const getButtonVariant = (state: CommandState): 'ghost' | 'outline' => {
    switch (state) {
      case 'success':
        return 'outline'; // Green outline handled via className
      case 'failure':
        return 'outline'; // Red outline handled via className
      default:
        return 'ghost';
    }
  };

  /**
   * Get state-specific border color.
   */
  const getStateBorderColor = (state: CommandState): string => {
    switch (state) {
      case 'success':
        return 'border-green-500 text-green-500';
      case 'failure':
        return 'border-red-500 text-red-500';
      default:
        return '';
    }
  };

  return (
    <div className="w-[200px] h-full border-r flex flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 px-3 py-3 border-b">
        <h2 className="text-sm font-medium">Commands</h2>
      </div>

      {/* Command List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {GSD_COMMANDS.map((command) => {
          const state = commandStates.get(command.id) ?? 'idle';
          const Icon = getIcon(command.icon);
          const isThisCommandRunning =
            state === 'running' &&
            runningProcess?.name === command.args[0];

          return (
            <Button
              key={command.id}
              variant={getButtonVariant(state)}
              size="sm"
              disabled={state === 'running'}
              onClick={() => handleCommandClick(command)}
              className={cn(
                'w-full h-auto flex-col items-start py-3 px-3 justify-start gap-1 text-left',
                getStateBorderColor(state),
                state === 'success' && 'border',
                state === 'failure' && 'border'
              )}
            >
              {/* Icon + Label Row */}
              <div className="flex items-center gap-2 w-full">
                {state === 'running' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : state === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : state === 'failure' ? (
                  <X className="w-4 h-4 text-red-500" />
                ) : Icon ? (
                  <Icon className="w-4 h-4" />
                ) : null}

                <span className="text-sm font-medium truncate flex-1">
                  {state === 'running' && isThisCommandRunning
                    ? 'Running...'
                    : command.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground truncate w-full pl-6">
                {state === 'running' && isThisCommandRunning && runningProcess
                  ? `PID: ${runningProcess.pid}`
                  : command.description}
              </p>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
