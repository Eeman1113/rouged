import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [{
    // dev server: /test → /test/ (GitHub Pages does this redirect itself)
    name: 'test-slash',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/test' || req.url?.startsWith('/test?')) { res.statusCode = 301; res.setHeader('Location', '/test/' + req.url.slice(5)); res.end(); return; }
        next();
      });
    },
  }],
  root: 'client',
  publicDir: false,
  base: './',
  server: { host: true, port: 5173 },
  build: {
    outDir: '../dist', emptyOutDir: true, target: 'es2022', chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        main: resolve(here, 'client/index.html'),
        // /test — the AI autopilot (attract mode): plays run after run on its own save slot
        test: resolve(here, 'client/test/index.html'),
      },
    },
  },
});
