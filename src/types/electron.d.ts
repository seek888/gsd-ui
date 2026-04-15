interface ElectronAPI {
  // Shell 执行
  executeCommand: (program: string, args: string[], cwd?: string) => Promise<CommandResult>
  onCommandOutput: (callback: (data: { type: 'stdout' | 'stderr'; data: string }) => void) => () => void
  killCommand: (pid: number) => Promise<void>
  
  // 文件系统
  readFile: (path: string) => Promise<string>
  writeFile: (path: string, content: string) => Promise<void>
  readDir: (path: string) => Promise<DirEntry[]>
  exists: (path: string) => Promise<boolean>
  
  // 对话框
  openDirectory: () => Promise<string | null>
  showSaveDialog: (options: SaveDialogOptions) => Promise<string | null>
  showMessageBox: (options: MessageBoxOptions) => Promise<MessageBoxReturnValue>
  
  // 设置
  getSetting: <T>(key: string) => Promise<T | null>
  setSetting: <T>(key: string, value: T) => Promise<void>
  
  // 平台信息
  platform: string
}

interface CommandResult {
  pid: number
  success: boolean
  exitCode?: number
}

interface DirEntry {
  name: string
  isDirectory: boolean
  isFile: boolean
}

interface SaveDialogOptions {
  title?: string
  defaultPath?: string
  filters?: { name: string; extensions: string[] }[]
}

interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning'
  title?: string
  message: string
  detail?: string
  buttons?: string[]
}

interface MessageBoxReturnValue {
  response: number
  checkboxChecked: boolean
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
