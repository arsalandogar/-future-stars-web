import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Short alias for @arslandogar/fs-card-engine; resolves to source for dev/build
      '@fs-card-engine': path.resolve(
        __dirname,
        './packages/card-engine/src/index.ts'
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          mantine: [
            '@mantine/core',
            '@mantine/hooks',
            '@mantine/dates',
            '@mantine/notifications',
            '@mantine/modals',
          ],
          'mantine-charts': ['@mantine/charts', 'recharts'],
          tanstack: [
            '@tanstack/react-router',
            '@tanstack/react-query',
            '@tanstack/react-form',
          ],
        },
      },
    },
  },
});
