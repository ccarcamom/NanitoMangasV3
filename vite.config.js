import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mangadexProxy } from './vite/mangadexProxy.js'

export default defineConfig({
  plugins: [react(), mangadexProxy()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/auth': 'http://localhost:8080',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.{js,jsx}', 'vite/**/*.spec.js'],
    setupFiles: ['./test/setup.js'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.spec.{js,jsx}', 'src/hooks/motionTest.js', 'src/data/fake*.js', 'src/api/fake*.js'],
      reporter: ['text-summary', 'html', 'lcovonly'],
      reportsDirectory: 'coverage',
    },
  },
})
