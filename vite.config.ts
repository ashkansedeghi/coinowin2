import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'web',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@api': path.resolve(__dirname, 'web/src/lib/api.mock.ts'),
      '@lib': path.resolve(__dirname, 'web/src/lib'),
      '@components': path.resolve(__dirname, 'web/src/components'),
      '@pages': path.resolve(__dirname, 'web/src/pages'),
      '@context': path.resolve(__dirname, 'web/src/context'),
      '@assets': path.resolve(__dirname, 'web/src/assets')
    }
  }
});
