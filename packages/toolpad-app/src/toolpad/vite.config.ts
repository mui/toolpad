import * as path from 'path';
import * as fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

const pkgJsonContent = fs.readFileSync(path.resolve(__dirname, '../../package.json'), {
  encoding: 'utf-8',
});
const pkgJson = JSON.parse(pkgJsonContent);
const TOOLPAD_BUILD = process.env.GIT_SHA1?.slice(0, 7) || 'dev';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/_toolpad/',
  // @TODO: remove viteCommonjs plugin once https://github.com/mui/mui-x/pull/9826 is fixed
  plugins: [react(), viteCommonjs()],
  build: {
    outDir: path.resolve(__dirname, '../../dist/editor'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      vm: 'vm-browserify',
      '@monaco-get-worker': path.resolve(__dirname, '../components/monaco/getWorkerVite.ts'),
    },
  },
  define: {
    'process.env.TOOLPAD_VERSION': JSON.stringify(pkgJson.version),
    'process.env.TOOLPAD_BUILD': JSON.stringify(TOOLPAD_BUILD),
  },
  publicDir: path.resolve(__dirname, '../../public'),
});
