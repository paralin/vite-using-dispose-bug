import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2022',
    minify: false,
    lib: {
      entry: ['./src/process-stream.ts', './src/using-variants.ts'],
      formats: ['es'],
    }
  }
})
