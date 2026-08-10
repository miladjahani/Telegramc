import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ command }) => ({
  plugins: [react(), nodePolyfills({ globals: { Buffer: true, global: true, process: true } })],
  base: command === 'build' ? process.env.VITE_BASE_PATH || '/Telegramcloud/' : '/',
  build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 3000 },
  optimizeDeps: { include: ['buffer'] },
}));