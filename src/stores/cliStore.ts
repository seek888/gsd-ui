import { create } from 'zustand'
import type { Terminal } from '@xterm/xterm'
import { runCommand } from '@/lib/shell'
import { electronAPI } from '@/lib/electronAPI'

const MAX_OUTPUT_LINES = 10000

interface RunningProcess {
  pid: number
  name: string
  kill: () => Promise<void>
}

interface CLIState {
  runningProcess: RunningProcess | null
  output: string[]
  isRunning: boolean
  error: string | null
  terminalRef: Terminal | null
  setTerminalRef: (terminal: Terminal | null) => void
  clearError: () => void
  executeCommand: (name: string, args: string[]) => Promise<number>
  appendOutput: (line: string, source?: 'stdout' | 'stderr') => void
  writeStdout: (data: string) => void
  writeStderr: (data: string) => void
  killCommand: () => Promise<void>
  clearOutput: () => void
  clearTerminal: () => void
}

export const useCLIStore = create<CLIState>((set, get) => ({
  runningProcess: null,
  output: [],
  isRunning: false,
  error: null,
  terminalRef: null,

  setTerminalRef: (terminal) => set({ terminalRef: terminal }),

  clearError: () => set({ error: null }),

  writeStdout: (data) => {
    const { terminalRef } = get()
    if (!terminalRef) return
    requestAnimationFrame(() => {
      terminalRef?.write(data)
    })
  },

  writeStderr: (data) => {
    const { terminalRef } = get()
    if (!terminalRef) return
    requestAnimationFrame(() => {
      const hasColor = data.includes('\x1b[')
      if (!hasColor) {
        terminalRef?.write(`\x1b[31m${data}\x1b[0m`)
      } else {
        terminalRef?.write(data)
      }
    })
  },

  executeCommand: async (name, args) => {
    const { clearOutput, clearTerminal, runningProcess } = get()

    if (runningProcess) {
      try {
        await runningProcess.kill()
      } catch (err) {
        console.error('Failed to kill existing process:', err)
      }
    }

    clearOutput()
    clearTerminal()

    return new Promise((resolve, reject) => {
      runCommand(
        name,
        args,
        (data) => get().writeStdout(data),
        (data) => get().writeStderr(data)
      ).then((commandWithEvents) => {
        const pid = commandWithEvents.pid

        set({
          runningProcess: { pid, name, kill: commandWithEvents.kill },
          isRunning: true,
        })

        // For simplicity, resolve after a delay since Electron doesn't have onClose callback
        setTimeout(() => {
          const state = get()
          if (state.runningProcess?.pid === pid) {
            set({ runningProcess: null, isRunning: false })
          }
          resolve(pid)
        }, 1000)
      }).catch((err) => {
        set({ isRunning: false, error: String(err) })
        reject(err)
      })
    })
  },

  appendOutput: (line, source = 'stdout') => {
    const { terminalRef } = get()
    set((state) => {
      const newOutput = [...state.output, `[${source}] ${line}`]
      if (newOutput.length > MAX_OUTPUT_LINES) {
        newOutput.splice(0, newOutput.length - MAX_OUTPUT_LINES)
      }

      if (terminalRef) {
        terminalRef.write(`${line}\r\n`)
      }

      return { output: newOutput }
    })
  },

  killCommand: async () => {
    const { runningProcess } = get()
    if (runningProcess) {
      try {
        await runningProcess.kill()
        set({ runningProcess: null, isRunning: false, error: null })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        set({ error: `Failed to kill process: ${message}` })
      }
    }
  },

  clearOutput: () => set({ output: [] }),

  clearTerminal: () => {
    const { terminalRef } = get()
    terminalRef?.clear()
  },
}))
