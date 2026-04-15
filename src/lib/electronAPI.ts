// Electron API wrapper with runtime checks
// Avoids SSR issues and provides fallback behavior

interface ElectronAPI {
  executeCommand: (program: string, args: string[], cwd?: string) => Promise<{ pid: number; success: boolean }>
  killCommand: (pid: number) => Promise<void>
  onCommandOutput: (callback: (data: { type: string; data: string }) => void) => () => void
  onProcessExit: (callback: (data: { pid: number; code: number | null }) => void) => () => void
  readFile: (path: string) => Promise<string>
  writeFile: (path: string, content: string) => Promise<void>
  readDir: (path: string) => Promise<{ name: string; isDirectory: boolean; isFile: boolean }[]>
  exists: (path: string) => Promise<boolean>
  openDirectory: () => Promise<string | null>
  showSaveDialog: (options: any) => Promise<string | null>
  showMessageBox: (options: any) => Promise<{ response: number }>
  getSetting: <T>(key: string) => Promise<T | null>
  setSetting: <T>(key: string, value: T) => Promise<void>
  platform: string
}

let api: ElectronAPI | null = null

// Initialize on first access
function getAPI(): ElectronAPI | null {
  if (api === null && typeof window !== 'undefined') {
    api = (window as any).electronAPI ?? null
  }
  return api
}

export const electronAPI = {
  // Shell
  async executeCommand(program: string, args: string[], cwd?: string) {
    const a = getAPI()
    if (!a) throw new Error('Electron API not available')
    return a.executeCommand(program, args, cwd)
  },
  
  async killCommand(pid: number) {
    const a = getAPI()
    if (!a) throw new Error('Electron API not available')
    return a.killCommand(pid)
  },
  
  onCommandOutput(callback: (data: { type: string; data: string }) => void) {
    const a = getAPI()
    if (!a) return () => {}
    return a.onCommandOutput(callback)
  },

  onProcessExit(callback: (data: { pid: number; code: number | null }) => void) {
    const a = getAPI()
    if (!a) return () => {}
    return a.onProcessExit(callback)
  },
  
  // File System
  async readFile(path: string) {
    const a = getAPI()
    if (!a) throw new Error('Electron API not available')
    return a.readFile(path)
  },
  
  async writeFile(path: string, content: string) {
    const a = getAPI()
    if (!a) throw new Error('Electron API not available')
    return a.writeFile(path, content)
  },
  
  async readDir(path: string) {
    const a = getAPI()
    if (!a) throw new Error('Electron API not available')
    return a.readDir(path)
  },
  
  async exists(path: string) {
    const a = getAPI()
    if (!a) throw new Error('Electron API not available')
    return a.exists(path)
  },
  
  // Dialogs
  async openDirectory() {
    const a = getAPI()
    if (!a) throw new Error('Electron API not available')
    return a.openDirectory()
  },
  
  async showSaveDialog(options: any) {
    const a = getAPI()
    if (!a) throw new Error('Electron API not available')
    return a.showSaveDialog(options)
  },
  
  async showMessageBox(options: any) {
    const a = getAPI()
    if (!a) throw new Error('Electron API not available')
    return a.showMessageBox(options)
  },
  
  // Settings
  async getSetting<T>(key: string): Promise<T | null> {
    const a = getAPI()
    if (!a) return null
    return a.getSetting<T>(key)
  },
  
  async setSetting<T>(key: string, value: T) {
    const a = getAPI()
    if (!a) return
    return a.setSetting(key, value)
  },
  
  get platform() {
    return getAPI()?.platform ?? 'unknown'
  }
}
