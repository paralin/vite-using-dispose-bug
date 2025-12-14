import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2022',
    lib: {
      entry: './src/process-stream.ts',
      formats: ['es'],
      fileName: 'process-stream'
    }
  }
})
