import { defineConfig } from 'vite';

export default defineConfig({
  root: 'client',
  publicDir: false,
  base: './',
  server: { host: true, port: 5173 },
  build: { outDir: '../dist', emptyOutDir: true, target: 'es2022', chunkSizeWarningLimit: 2000 },
});
