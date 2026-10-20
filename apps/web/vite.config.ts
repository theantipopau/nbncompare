/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // No sourcemaps in prod: halves Pages output/bandwidth (free-plan egress)
    // and avoids shipping source to clients. Use `vite build --sourcemap`
    // locally when debugging a production bundle.
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
