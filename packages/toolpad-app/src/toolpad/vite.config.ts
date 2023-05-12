import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import * as fs from 'fs';

const pkgJsonContent = fs.readFileSync(path.resolve(__dirname, '../../package.json'), {
  encoding: 'utf-8',
});
const pkgJson = JSON.parse(pkgJsonContent);
const TOOLPAD_BUILD = process.env.GIT_SHA1?.slice(0, 7) || 'dev';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/_toolpad2/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../../dist/editor'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      vm: 'vm-browserify',
    },
  },
  define: {
    'process.env.TOOLPAD_VERSION': JSON.stringify(pkgJson.version),
    'process.env.TOOLPAD_BUILD': JSON.stringify(TOOLPAD_BUILD),
  },
});
