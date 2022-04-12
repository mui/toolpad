// TODO: This is not used, it's experimentation towards removing esbuild.
//       investigate this method for generating ESM modules further

import { build, OnResolveArgs, OnResolveResult, Plugin } from 'esbuild';
import path from 'path';
import resolve from 'resolve';
import fs from 'fs';

function resolveAsync(id: string, options: resolve.AsyncOpts): Promise<string> {
  return new Promise((_resolve, _reject) =>
    resolve(id, options, (err, result) => (err ? _reject(err) : _resolve(result))),
  );
}

function Resolver(): Plugin {
  const namespace = 'resolver';

  return {
    name: namespace,
    setup({ onLoad, onResolve }) {
      const resolver = async (args: OnResolveArgs) => {
        let resolved;

        try {
          resolved = await resolveAsync(args.path, {
            basedir: args.resolveDir,
            packageFilter: (pkg) => {
              pkg.main = pkg.module || pkg.main;
              return pkg;
            },
          });
        } catch (err) {
          resolved = require.resolve(args.path);
        }

        return {
          path: resolved,
          namespace,
        } as OnResolveResult;
      };
      onResolve({ filter: /.*/ }, resolver);
      onResolve({ filter: /.*/, namespace }, resolver);
      onLoad({ filter: /.*/, namespace }, async (args) => {
        try {
          const contents = await (await fs.promises.readFile(args.path)).toString();
          const resolveDir = path.dirname(args.path);
          return {
            loader: 'default',
            contents,
            resolveDir,
          };
        } catch (e) {
          throw new Error(`Cannot load ${args.path}, ${e}`);
        }
      });
    },
  };
}

build({
  bundle: true,
  outdir: 'public/web_modules2',
  splitting: true,
  format: 'esm',
  target: 'es2017',
  platform: 'browser',
  mainFields: ['module', 'main'],
  metafile: true,
  entryPoints: [
    'es-module-shims',
    'react',
    'react-dom',
    'react-query',
    '@mui/toolpad-core',
    '@mui/x-data-grid-pro',
    '@mui/material',
    '@mui/material/utils',
    '@mui/material/styles',
    '@mui/material/colors',
  ],
  plugins: [Resolver()],
})
  .then((x) => console.log(JSON.stringify(x, null, 2)))
  .catch(console.error);
