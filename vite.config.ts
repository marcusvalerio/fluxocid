/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // worker/ is a separate package with its own vitest-pool-workers config/runner (`npm test`
    // inside worker/) — excluded here so the frontend's jsdom runner never tries to resolve
    // Workers-only modules like `cloudflare:test`.
    exclude: ['**/node_modules/**', 'worker/**'],
  },
})
