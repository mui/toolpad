import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/_toolpad/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../../dist/editor'),
    emptyOutDir: true,
  },
  define: {
    process: '{}',
  },
});
