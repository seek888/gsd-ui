import { electronAPI } from '@/lib/electronAPI'

const ALLOWED_COMMANDS = ['claude', 'npm', 'node', 'git', 'cargo', 'pnpm', 'yarn', 'bash', 'zsh', 'sh', 'cmd', 'powershell'] as const
const DANGEROUS_PATTERNS = [';', '&', '|', '`', '$(', '${', '\n', '\r']

export interface CommandResult {
  pid: number
  success: boolean
  exitCode?: number
}

export interface CommandWithEvents {
  pid: number
  kill: () => Promise<void>
}

export function getPlatform(): string {
  return electronAPI.platform
}

export async function checkClaudeInstalled(): Promise<{
  installed: boolean
  version?: string
  error?: string
}> {
  const platform = getPlatform()
  const isWindows = platform === 'win32'
  let lastError: string | undefined

  if (isWindows) {
    const windowsPaths = [
      '',
      '%APPDATA%\\npm',
      'C:\\Program Files\\nodejs',
      '%USERPROFILE%\\AppData\\Roaming\\npm',
    ]
    for (const path of windowsPaths) {
      try {
        const pathPrefix = path ? `set PATH=${path};%PATH%&& ` : ''
        const result = await electronAPI.executeCommand('cmd', ['/c', `${pathPrefix}claude --version 2>&1`])
        // Note: This is async but doesn't wait for full output in Electron
        // For now, return detected status
        return { installed: true, version: 'detected' }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
      }
    }
  } else {
    const searchPaths = [
      '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',
      '/usr/local/bin:/usr/bin:/bin',
    ]
    for (const path of searchPaths) {
      try {
        const result = await electronAPI.executeCommand('bash', ['-c', `PATH="${path}:$PATH" claude --version 2>&1`])
        return { installed: true, version: 'detected' }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
      }
    }
  }

  return { installed: false, error: lastError || 'Claude CLI not found' }
}

function validateArgs(args: string[]): void {
  for (const arg of args) {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (arg.includes(pattern)) {
        throw new Error(`Argument contains potentially dangerous pattern: ${pattern}`)
      }
    }
  }
}

export async function runCommand(
  program: string,
  args: string[],
  onStdout: (data: string) => void,
  onStderr: (data: string) => void,
  options?: { cwd?: string }
): Promise<CommandWithEvents> {
  if (!ALLOWED_COMMANDS.includes(program as any)) {
    throw new Error(`Command not allowed: ${program}`)
  }

  validateArgs(args)

  const platform = getPlatform()
  const isWindows = platform === 'win32'

  let cmdArgs: string[] = []
  let cmdProgram: string

  if (isWindows) {
    if (program === 'claude') {
      const extendedPath = '%APPDATA%\\npm;C:\\Program Files\\nodejs;%USERPROFILE%\\AppData\\Roaming\\npm'
      const escapedArgs = args.map(a => {
        const argStr = String(a)
        if (argStr.includes(' ') || argStr.includes('&') || argStr.includes('|')) {
          return `"${argStr.replace(/"/g, '\\"')}"`
        }
        return argStr
      }).join(' ')
      cmdProgram = 'cmd'
      cmdArgs = ['/c', `set PATH=${extendedPath};%PATH%&& claude ${escapedArgs}`]
    } else {
      cmdProgram = program
      cmdArgs = args
    }
  } else {
    if (program === 'claude') {
      const extendedPath = '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'
      const escapedArgs = args.map(a => `'${a.replace(/'/g, "'\\''")}'`).join(' ')
      cmdProgram = 'bash'
      cmdArgs = ['-c', `PATH="${extendedPath}:$PATH" claude ${escapedArgs}`]
    } else {
      cmdProgram = program
      cmdArgs = args
    }
  }

  // Subscribe to output
  const unsubscribe = electronAPI.onCommandOutput((data) => {
    if (data.type === 'stdout') {
      onStdout(data.data)
    } else {
      onStderr(data.data)
    }
  })

  const result = await electronAPI.executeCommand(cmdProgram, cmdArgs, options?.cwd)

  return {
    pid: result.pid,
    kill: async () => {
      unsubscribe()
      await electronAPI.killCommand(result.pid)
    }
  }
}
