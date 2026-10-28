import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: { index: resolve('src/index.ts'), theme: resolve('src/theme/index.ts'), bootstrap: resolve('src/startup/bootstrap.ts') }, formats: ['es'], cssFileName: 'style' },
    rollupOptions: { external: id => !id.startsWith('.') && !id.startsWith('/') && !/^[A-Za-z]:/.test(id) },
    sourcemap: true,
    cssCodeSplit: false
  }
})
