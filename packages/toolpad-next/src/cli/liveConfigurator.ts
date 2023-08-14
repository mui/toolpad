import * as path from 'path';
import * as fs from 'fs/promises';
import { glob } from 'glob';
import * as yaml from 'yaml';
import * as esbuild from 'esbuild';
import * as chokidar from 'chokidar';
import { WebSocketServer } from 'ws';
import getPort from 'get-port';
import { toolpadFileSchema } from '../shared/schemas';
import { RpcServerPort } from '../shared/RpcServer';
import { Backend } from '../shared/backend';
import {
  generateComponent,
  generateIndex,
  GenerateComponentOptions,
  CodeFiles,
} from '../shared/codeGeneration';
import { Config, DevRpcMethods } from '../shared/types';
import { loadConfig } from './config';

async function compileTs(code: string) {
  const result = await esbuild.transform(code, {
    loader: 'tsx',
    format: 'esm',
    target: 'es2020',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  });

  return result.code;
}

interface CommandArgs {
  dir: string;
}

function getComponentsYmlPattern(rootDir: string) {
  return path.join(rootDir, '*.yml');
}

async function writeAndCompile(files: CodeFiles) {
  await Promise.all(
    files.map(async ([filePath, { code }]) => {
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      await Promise.all([
        fs.writeFile(filePath, code, { encoding: 'utf-8' }),

        compileTs(code).then(async (compiledComponent) => {
          await fs.writeFile(filePath.replace(/\.[^.]+$/, '.mjs'), compiledComponent, {
            encoding: 'utf-8',
          });
        }),
      ]);
    }),
  );
}

async function generateLib(config: Config, generateOptions: GenerateComponentOptions) {
  const { outDir } = config;

  // eslint-disable-next-line no-console
  console.log(`Generating lib at ${outDir} in "${generateOptions.target}" mode`);

  const ymlPattern = getComponentsYmlPattern(config.rootDir);
  const entries = await glob(ymlPattern);

  await fs.rm(outDir, { force: true, recursive: true });

  await fs.mkdir(outDir, { recursive: true });

  await Promise.all([
    ...entries.map(async (entryPath) => {
      const yamlContent = await fs.readFile(entryPath, 'utf-8');
      const data = yaml.parse(yamlContent);
      const file = toolpadFileSchema.parse(data);
      const filePath = path.relative(config.rootDir, entryPath);

      const { files } = await generateComponent(filePath, file, {
        ...generateOptions,
        outDir,
      });

      await writeAndCompile(files);
    }),

    generateIndex(entries, { outDir }).then(async ({ files }) => writeAndCompile(files)),
  ]);

  console.error(`Generation completed!`);
}

export async function generateCommand({ dir }: CommandArgs) {
  const config = await loadConfig(dir);
  await generateLib(config, { target: 'prod', outDir: config.outDir });
}

export async function devCommand({ dir }: CommandArgs) {
  const config = await loadConfig(dir);

  const port = await getPort();

  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    ws.on('error', console.error);
  });

  const methods: DevRpcMethods = {
    async saveFile(name, content) {
      // Validate content before saving
      toolpadFileSchema.parse(content);
      const filePath = path.join(config.rootDir, `${name}.yml`);
      await fs.writeFile(filePath, yaml.stringify(content), { encoding: 'utf-8' });
    },
  };

  wss.on('connection', (ws) => {
    const rpcPort: RpcServerPort = {
      addEventListener(event, listener) {
        ws.on(event, (rawData) => listener({ data: rawData.toString() }));
      },
      postMessage: ws.send.bind(ws),
    };
    return new Backend(rpcPort, methods);
  });

  const options: GenerateComponentOptions = {
    outDir: config.outDir,
    target: 'dev',
    backend: {
      kind: 'cli',
      wsUrl: `ws://localhost:${port}`,
    },
  };

  await generateLib(config, options);

  const ymlPattern = getComponentsYmlPattern(config.rootDir);

  chokidar
    .watch(ymlPattern, {
      ignoreInitial: true,
    })
    .on('all', async () => {
      try {
        await generateLib(config, options);
      } catch (error) {
        console.error(`Generation failed`);
        console.error(error);
      }
    });
}
