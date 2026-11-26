import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mangadexProxy } from './vite/mangadexProxy.js'

// Destino del backend en desarrollo. Para usar el de AWS: BACKEND_URL=http://IP:8080 npm run dev
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080'

export default defineConfig({
  plugins: [react(), mangadexProxy()],
  server: {
    proxy: {
      '/api': BACKEND_URL,
      '/auth': BACKEND_URL,
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
