import { Command, type Child, type IOPayload } from '@tauri-apps/plugin-shell';

const ALLOWED_COMMANDS = ['claude', 'npm', 'node', 'git', 'cargo', 'pnpm', 'yarn', 'bash', 'zsh', 'sh'] as const;
const DANGEROUS_PATTERNS = [';', '&', '|', '`', '$(', '${', '\n', '\r'];

export interface CommandResult {
  pid: number;
  success: boolean;
  exitCode?: number;
}

export interface CommandWithEvents {
  child: Child;
  command: Command<IOPayload>;
  onClose: (callback: (data: { code: number | null; signal: number | null }) => void) => void;
}

export async function checkClaudeInstalled(): Promise<{
  installed: boolean;
  version?: string;
  error?: string
}> {
  try {
    const cmd = Command.create('claude', ['--version']);
    const output = await cmd.execute();
    if (output.code === 0) {
      return { installed: true, version: output.stdout.trim() };
    }
    return { installed: false, error: output.stderr || `Exit code: ${output.code}` };
  } catch (err) {
    return { installed: false, error: String(err) };
  }
}

/**
 * Validates command arguments for potential injection patterns
 */
function validateArgs(args: string[]): void {
  for (const arg of args) {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (arg.includes(pattern)) {
        throw new Error(`Argument contains potentially dangerous pattern: ${pattern}`);
      }
    }
  }
}

export async function runCommand(
  program: string,
  args: string[],
  onStdout: (data: string) => void,
  onStderr: (data: string) => void
): Promise<CommandWithEvents> {
  if (!ALLOWED_COMMANDS.includes(program as any)) {
    throw new Error(`Command not allowed: ${program}`);
  }

  validateArgs(args);

  const cmd = Command.create(program, args);

  // Wrap event registration in try-catch to handle failures
  try {
    cmd.stdout.on('data', onStdout);
    cmd.stderr.on('data', onStderr);
  } catch (err) {
    onStderr(`Failed to attach to command output: ${err}`);
    throw err;
  }

  const child = await cmd.spawn();

  return {
    child,
    command: cmd,
    onClose: (callback) => {
      cmd.on('close', callback);
    },
  };
}
