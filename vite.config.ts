import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              // Friendlier message when API is not running
              if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
              }
              res.end(
                JSON.stringify({
                  error:
                    'API server is not running on http://localhost:3001. Run `npm run dev` (starts web + api) or `npm run dev:api` in a second terminal.',
                  code: (err as NodeJS.ErrnoException).code,
                }),
              );
            });
          },
        },
        '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
      },
    },
  };
});
