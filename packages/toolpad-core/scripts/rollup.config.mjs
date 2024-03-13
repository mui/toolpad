import { promises as fs } from 'fs';
import * as url from 'url';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import nodeGlobals from 'rollup-plugin-node-globals';
import terser from '@rollup/plugin-terser';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const gzip = promisify(zlib.gzip);

/**
 * @param {{snapshotPath: string}} options
 * @returns {import('rollup').Plugin}
 */
function sizeSnapshot(options) {
  const snapshotPath = path.resolve(options.snapshotPath);

  /**
   * @param {number} size
   */
  function formatSize(size) {
    return size.toLocaleString(undefined, { style: 'unit', unit: 'byte', unitDisplay: 'short' });
  }
  async function computeGzipSize(string) {
    const gzipped = await gzip(string);
    return gzipped.length;
  }

  return {
    name: 'size-snapshot',
    async renderChunk(rawCode, chunk, outputOptions) {
      const code = rawCode.replace(/\r/g, '');
      const gzippedSize = await computeGzipSize(code);

      const sizes = {
        minified: code.length,
        gzipped: gzippedSize,
      };

      const prettyMinified = formatSize(sizes.minified);
      const prettyGzipped = formatSize(sizes.gzipped);
      const infoString =
        '\n' +
        `Computed sizes of "${chunk.fileName}" with "${outputOptions.format}" format\n` +
        `  browser parsing size: ${prettyMinified}\n` +
        `  download size (gzipped): ${prettyGzipped}\n`;

      // eslint-disable-next-line no-console -- purpose of this plugin
      console.info(infoString);
      // TODO: Should lock `snapshotPath` since something else might write to `snapshotPath` between read and write
      const snapshotContent = await fs.readFile(snapshotPath, { encoding: 'utf8' }).then(
        (json) => {
          return JSON.parse(json);
        },
        () => {
          return {};
        },
      );
      await fs.writeFile(
        snapshotPath,
        JSON.stringify(
          {
            ...snapshotContent,
            [chunk.fileName]: sizes,
          },
          null,
          2,
        ),
      );
    },
  };
}

const input = './src/index.js';
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
};
const babelOptions = {
  exclude: /node_modules/,
  // We are using @babel/plugin-transform-runtime
  babelHelpers: 'runtime',
  extensions: ['.js', '.ts', '.tsx'],
  configFile: path.resolve(currentDirectory, '../babel.config.js'),
};
const commonjsOptions = {
  ignoreGlobal: true,
  include: /node_modules/,
};
const nodeOptions = {
  extensions: ['.js', '.tsx', '.ts'],
};

function onwarn(warning) {
  if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
    return;
  }
  if (
    warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
    warning.source === 'react' &&
    warning.names.filter((identifier) => identifier !== 'useDebugValue').length === 0
  ) {
    // only warn for
    // import * as React from 'react'
    // if (__DEV__) React.useDebugValue()
    // React.useDebug not fully dce'd from prod bundle
    // in the sense that it's still imported but unused. Downgrading
    // it to a warning as a reminder to fix at some point
    console.warn(warning.message);
  } else {
    throw Error(warning.message);
  }
}

export default [
  {
    input,
    onwarn,
    output: {
      file: 'build/umd/toolpad-core.development.js',
      format: 'umd',
      name: 'Toolpad',
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      nodeResolve(nodeOptions),
      babel(babelOptions),
      commonjs(commonjsOptions),
      nodeGlobals(), // Wait for https://github.com/cssinjs/jss/pull/893
      replace({ preventAssignment: true, 'process.env.NODE_ENV': JSON.stringify('development') }),
    ],
  },
  {
    input,
    onwarn,
    output: {
      file: 'build/umd/toolpad-core.production.min.js',
      format: 'umd',
      name: 'Toolpad',
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      nodeResolve(nodeOptions),
      babel(babelOptions),
      commonjs(commonjsOptions),
      nodeGlobals(), // Wait for https://github.com/cssinjs/jss/pull/893
      replace({ preventAssignment: true, 'process.env.NODE_ENV': JSON.stringify('production') }),
      terser(),
      sizeSnapshot({ snapshotPath: 'size-snapshot.json' }),
    ],
  },
];
