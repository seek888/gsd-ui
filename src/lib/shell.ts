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
  // Use bash to search PATH for claude, since Tauri shell plugin may have limited PATH
  const searchPaths = [
    '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',
    '/usr/local/bin:/usr/bin:/bin',
  ];
  let lastError: string | undefined;

  for (const path of searchPaths) {
    try {
      const cmd = Command.create('bash', ['-c', `PATH="${path}:$PATH" claude --version 2>&1`]);
      const output = await cmd.execute();
      if (output.code === 0 && output.stdout.trim()) {
        return { installed: true, version: output.stdout.trim() };
      }
      lastError = output.stderr.trim() || output.stdout.trim() || `claude exited with code ${output.code}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return { installed: false, error: lastError || 'Claude CLI not found' };
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

  // Use bash with extended PATH for claude since Tauri shell may have limited PATH
  let resolvedProgram = program;
  let useBashWrapper = false;
  const extendedPath = '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin';

  if (program === 'claude') {
    useBashWrapper = true;
  }

  let cmd;
  if (useBashWrapper) {
    const escapedArgs = args.map(a => `'${a.replace(/'/g, "'\\''")}'`).join(' ');
    cmd = Command.create('bash', ['-c', `PATH="${extendedPath}:$PATH" ${program} ${escapedArgs}`]);
  } else {
    cmd = Command.create(resolvedProgram, args);
  }

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
