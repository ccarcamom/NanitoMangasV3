import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.{js,jsx}'],
    setupFiles: ['./test/setup.js'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.spec.{js,jsx}', 'src/hooks/motionTest.js', 'src/data/fake*.js'],
      reporter: ['text-summary', 'html', 'lcovonly'],
      reportsDirectory: 'coverage',
    },
  },
})
