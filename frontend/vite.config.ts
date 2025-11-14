import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY ?? '';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_DEV_SERVER_PORT ?? 5173),
      proxy: apiProxyTarget
        ? {
            '/action': {
              target: apiProxyTarget,
              changeOrigin: true,
              secure: false,
            },
            '/async': {
              target: apiProxyTarget,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    preview: {
      port: Number(env.VITE_PREVIEW_PORT ?? 4173),
    },
  };
});

