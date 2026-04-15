import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readFile, writeFile, readdir, stat } from 'fs/promises'
import { platform } from 'process'
import { spawn, ChildProcess } from 'child_process'
import Store from 'electron-store'

const store = new Store()
const activeProcesses = new Map<number, ChildProcess>()

export function registerIpcHandlers() {
  // Shell handlers
  ipcMain.handle('shell:execute', async (event, program: string, args: string[], cwd?: string) => {
    const isWindows = platform === 'win32'
    let cmd: ChildProcess
    
    if (isWindows) {
      cmd = spawn('cmd', ['/c', program, ...args], { cwd, shell: true })
    } else {
      // macOS/Linux: use bash -c with proper escaping
      const escapedArgs = args.map(a => `'${a.replace(/'/g, "'\\''")}'`).join(' ')
      cmd = spawn('bash', ['-c', `${program} ${escapedArgs}`], { cwd })
    }
    
    const pid = cmd.pid!
    activeProcesses.set(pid, cmd)
    
    // Stream stdout/stderr to renderer
    cmd.stdout?.on('data', (data: Buffer) => {
      event.sender.send('shell:output', { type: 'stdout', data: data.toString() })
    })
    
    cmd.stderr?.on('data', (data: Buffer) => {
      event.sender.send('shell:output', { type: 'stderr', data: data.toString() })
    })
    
    cmd.on('close', (code) => {
      activeProcesses.delete(pid)
      event.sender.send('shell:exit', { pid, code })
    })
    
    cmd.on('error', (err) => {
      event.sender.send('shell:output', { type: 'stderr', data: `Error: ${err.message}` })
    })
    
    return { pid, success: true }
  })
  
  ipcMain.handle('shell:kill', async (_event, pid: number) => {
    const proc = activeProcesses.get(pid)
    if (proc) {
      proc.kill()
      activeProcesses.delete(pid)
    }
  })
  
  // File system handlers
  ipcMain.handle('fs:read', async (_event, filePath: string) => {
    return readFile(filePath, 'utf-8')
  })
  
  ipcMain.handle('fs:write', async (_event, filePath: string, content: string) => {
    await writeFile(filePath, content, 'utf-8')
  })
  
  ipcMain.handle('fs:readDir', async (_event, dirPath: string) => {
    const entries = await readdir(dirPath, { withFileTypes: true })
    return entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      isFile: entry.isFile()
    }))
  })
  
  ipcMain.handle('fs:exists', async (_event, filePath: string) => {
    try {
      await stat(filePath)
      return true
    } catch {
      return false
    }
  })
  
  // Dialog handlers
  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })
  
  ipcMain.handle('dialog:showSave', async (_event, options: Electron.SaveDialogOptions) => {
    const result = await dialog.showSaveDialog(options)
    return result.canceled ? null : result.filePath
  })
  
  ipcMain.handle('dialog:message', async (_event, options: Electron.MessageBoxOptions) => {
    return dialog.showMessageBox(options)
  })
  
  // Settings handlers
  ipcMain.handle('settings:get', async (_event, key: string) => {
    return store.get(key)
  })
  
  ipcMain.handle('settings:set', async (_event, key: string, value: any) => {
    store.set(key, value)
  })
}
