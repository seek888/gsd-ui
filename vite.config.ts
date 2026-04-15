import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart(args) {
          args.startup()
        },
        vite: {
          build: { outDir: 'dist-electron' }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(args) {
          args.reload()
        },
        vite: {
          build: { outDir: 'dist-electron' }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    target: process.env.VITE_DEV_SERVER_URL ? 'esnext' : 'es2020',
    outDir: 'dist'
  },
  envPrefix: ['VITE_', 'ELECTRON_']
})
