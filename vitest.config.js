import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './vitest.setup.js',
    testTimeout: 15000,
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        'vite.config.js',
        'vitest.config.js',
        'vitest.setup.js',
        'playwright.config.js',
        'tests/**',
        '.github/**',
        'postcss.config.js',
        'tailwind.config.js',
        'src/main.jsx',
        'src/App.jsx',
        'src/pages/**',
        'src/layouts/**',
        'src/components/GateCard.jsx',
        'src/components/IncidentCard.jsx',
        'src/components/ReasoningPanel.jsx',
        'src/components/SimulationControls.jsx'
      ]
    }
  }
});
