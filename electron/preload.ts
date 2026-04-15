import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Shell
  executeCommand: (program: string, args: string[], cwd?: string) =>
    ipcRenderer.invoke('shell:execute', program, args, cwd),
  killCommand: (pid: number) => ipcRenderer.invoke('shell:kill', pid),
  onCommandOutput: (callback: (data: { type: string; data: string }) => void) => {
    const listener = (_event: any, data: { type: string; data: string }) => callback(data)
    ipcRenderer.on('shell:output', listener)
    return () => ipcRenderer.removeListener('shell:output', listener)
  },
  onProcessExit: (callback: (data: { pid: number; code: number | null }) => void) => {
    const listener = (_event: any, data: { pid: number; code: number | null }) => callback(data)
    ipcRenderer.on('shell:exit', listener)
    return () => ipcRenderer.removeListener('shell:exit', listener)
  },
  
  // File System
  readFile: (path: string) => ipcRenderer.invoke('fs:read', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('fs:write', path, content),
  readDir: (path: string) => ipcRenderer.invoke('fs:readDir', path),
  exists: (path: string) => ipcRenderer.invoke('fs:exists', path),
  
  // Dialogs
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  showSaveDialog: (options: any) => ipcRenderer.invoke('dialog:showSave', options),
  showMessageBox: (options: any) => ipcRenderer.invoke('dialog:message', options),
  
  // Settings
  getSetting: <T>(key: string) => ipcRenderer.invoke('settings:get', key) as Promise<T | null>,
  setSetting: <T>(key: string, value: T) => ipcRenderer.invoke('settings:set', key, value),
  
  // Platform
  platform: process.platform
})
