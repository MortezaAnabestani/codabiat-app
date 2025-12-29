import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  server: {
    port: 4000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@codabiat/types': path.resolve(__dirname, '../../packages/types/src'),
      '@codabiat/database': path.resolve(__dirname, '../../packages/database/src'),
      '@codabiat/auth': path.resolve(__dirname, '../../packages/auth/src'),
      '@codabiat/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
  build: {
    outDir: './dist',
  },
});
