import { Command, type Child, type IOPayload } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';

const ALLOWED_COMMANDS = ['claude', 'npm', 'node', 'git', 'cargo', 'pnpm', 'yarn', 'bash', 'zsh', 'sh', 'cmd', 'powershell'] as const;
const DANGEROUS_PATTERNS = [';', '&', '|', '`', '$(', '${', '\n', '\r'];

// Platform detection cache
let cachedPlatform: 'windows' | 'macos' | 'linux' | null = null;

async function getPlatform(): Promise<'windows' | 'macos' | 'linux'> {
  if (cachedPlatform) return cachedPlatform;
  try {
    cachedPlatform = await invoke<'windows' | 'macos' | 'linux'>('get_platform');
  } catch {
    // Fallback: default to macOS for dev environment
    // On actual builds, the Rust command will provide correct platform
    cachedPlatform = 'macos';
  }
  return cachedPlatform;
}

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
  const platform = await getPlatform();
  let lastError: string | undefined;

  if (platform === 'windows') {
    // Windows: use cmd /c to check if claude is in PATH
    const windowsPaths = [
      '', // Use current PATH
      '%APPDATA%\\npm',
      'C:\\Program Files\\nodejs',
      '%USERPROFILE%\\AppData\\Roaming\\npm',
    ];
    for (const path of windowsPaths) {
      try {
        const pathPrefix = path ? `set PATH=${path};%PATH%&& ` : '';
        const cmd = Command.create('cmd', ['/c', `${pathPrefix}claude --version 2>&1`]);
        const output = await cmd.execute();
        if (output.code === 0 && output.stdout.trim()) {
          return { installed: true, version: output.stdout.trim() };
        }
        lastError = output.stderr.trim() || output.stdout.trim() || `claude exited with code ${output.code}`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  } else {
    // macOS/Linux: Use bash to search PATH for claude
    const searchPaths = [
      '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',
      '/usr/local/bin:/usr/bin:/bin',
    ];
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

  const platform = await getPlatform();
  let cmd: Command<IOPayload>;

  if (platform === 'windows') {
    // Windows: Use cmd or direct execution
    // For claude, try to find it in npm global paths
    if (program === 'claude') {
      // On Windows, claude.cmd is the npm wrapper
      const extendedPath = '%APPDATA%\\npm;C:\\Program Files\\nodejs;%USERPROFILE%\\AppData\\Roaming\\npm';
      const pathPrefix = `set PATH=${extendedPath};%PATH%&& `;
      // Build command string with proper escaping
      const escapedArgs = args.map(a => {
        const argStr = String(a);
        // Simple Windows escaping: wrap in quotes if contains spaces
        if (argStr.includes(' ') || argStr.includes('&') || argStr.includes('|')) {
          return `"${argStr.replace(/"/g, '\\"')}"`;
        }
        return argStr;
      }).join(' ');
      cmd = Command.create('cmd', ['/c', `${pathPrefix}claude ${escapedArgs}`]);
    } else {
      cmd = Command.create(program, args);
    }
  } else {
    // macOS/Linux: Use bash with extended PATH for claude
    let useBashWrapper = false;
    const extendedPath = '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin';

    if (program === 'claude') {
      useBashWrapper = true;
    }

    if (useBashWrapper) {
      const escapedArgs = args.map(a => `'${a.replace(/'/g, "'\\''")}'`).join(' ');
      cmd = Command.create('bash', ['-c', `PATH="${extendedPath}:$PATH" ${program} ${escapedArgs}`]);
    } else {
      cmd = Command.create(program, args);
    }
  }

  // Wrap event registration in try-catch to handle failures
  try {
    cmd.stdout.on('data', (data) => {
      // Convert IOPayload (string | Uint8Array) to string
      const str = typeof data === 'string' ? data : new TextDecoder().decode(data);
      onStdout(str);
    });
    cmd.stderr.on('data', (data) => {
      // Convert IOPayload (string | Uint8Array) to string
      const str = typeof data === 'string' ? data : new TextDecoder().decode(data);
      onStderr(str);
    });
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
