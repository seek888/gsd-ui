import { Command, type Child } from '@tauri-apps/plugin-shell';

export interface CommandResult {
  pid: number;
  success: boolean;
  exitCode?: number;
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

export async function runCommand(
  program: string,
  args: string[],
  onStdout: (data: string) => void,
  onStderr: (data: string) => void
): Promise<Child> {
  const cmd = Command.create(program, args);
  cmd.stdout.on('data', onStdout);
  cmd.stderr.on('data', onStderr);
  return await cmd.spawn();
}
