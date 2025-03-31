import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/service-worker.ts',
      formats: ['es'],
      fileName: 'service-worker',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'service-worker.js',
        format: 'es',
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
  server: {
    headers: {
      'Service-Worker-Allowed': '/',
      'Access-Control-Allow-Origin': '*',
    },
  },
}) 