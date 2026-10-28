import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
export default defineConfig({
  main: { build: { externalizeDeps: false, rollupOptions: { input: resolve('src/main/index.ts'), external: ['electron'] } } },
  preload: { build: { externalizeDeps: false, rollupOptions: { input: resolve('src/preload/index.ts'), external: ['electron'], output: { format: 'cjs', entryFileNames: 'index.cjs' } } } },
  renderer: { root: resolve('src/renderer'), plugins: [react()], build: { rollupOptions: { input: resolve('src/renderer/index.html') } } }
})
