import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as yaml from 'yaml';
import * as esbuild from 'esbuild';
import * as chokidar from 'chokidar';
import { WebSocketServer } from 'ws';
import getPort from 'get-port';
import { toolpadFileSchema } from '../shared/schemas';
import RpcServer from '../shared/RpcServer';
import { generateComponent, generateIndex } from './codeGeneration';
import { DevRpcServer } from '../shared/types';

function isValidJsIdentifier(base: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(base);
}

function getNameFromPath(filePath: string): string {
  const name = path.basename(filePath, '.yml');

  if (!isValidJsIdentifier(name)) {
    throw new Error(`Invalid file name ${JSON.stringify(name)}`);
  }

  return name;
}

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

export interface Config {
  dir: string;
}

function resolveRoot(input: string) {
  return path.resolve(process.cwd(), input);
}

function getToolpadDir(root: string) {
  return path.join(root, 'toolpad');
}

function getYmlPattern(root: string) {
  const toolpadDir = getToolpadDir(root);
  return path.join(toolpadDir, '*.yml');
}

interface GenerateLibConfig {
  dev?: boolean;
  wsUrl?: string;
}

async function generateLib(root: string, { dev = false, wsUrl }: GenerateLibConfig = {}) {
  // eslint-disable-next-line no-console
  console.log(`Generating lib at ${JSON.stringify(root)} ${dev ? 'in dev mode' : ''}`);

  const toolpadDir = getToolpadDir(root);
  const outputDir = path.join(toolpadDir, '.generated/components');
  const ymlPattern = getYmlPattern(root);
  const entries = await glob(ymlPattern);

  const indexContentPromise = generateIndex(entries);

  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all([
    ...entries.map(async (entryPath) => {
      const yamlContent = await fs.readFile(entryPath, 'utf-8');
      const data = yaml.parse(yamlContent);
      const file = toolpadFileSchema.parse(data);
      const name = getNameFromPath(entryPath);

      const generatedComponentPromise = generateComponent(file, { name, dev, wsUrl });

      await Promise.all([
        generatedComponentPromise.then(async (generatedComponent) => {
          await fs.writeFile(path.join(outputDir, `${name}.tsx`), generatedComponent, {
            encoding: 'utf-8',
          });
        }),

        generatedComponentPromise.then(async (generatedComponent) => {
          const compiledComponent = await compileTs(generatedComponent);
          await fs.writeFile(path.join(outputDir, `${name}.mjs`), compiledComponent, {
            encoding: 'utf-8',
          });
        }),
      ]);
    }),

    indexContentPromise.then(async (indexContent) => {
      await fs.writeFile(path.join(outputDir, `index.ts`), indexContent, { encoding: 'utf-8' });
    }),

    indexContentPromise.then(async (indexContent) => {
      const compiledIndexContent = await compileTs(indexContent);

      await fs.writeFile(path.join(outputDir, `index.mjs`), compiledIndexContent, {
        encoding: 'utf-8',
      });
    }),
  ]);

  console.error(`Generation completed!`);
}

export async function generateCommand({ dir }: Config) {
  const root = resolveRoot(dir);

  await generateLib(root);
}

export async function liveCommand({ dir }: Config) {
  const root = resolveRoot(dir);

  const port = await getPort();

  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    ws.on('error', console.error);
  });

  const rpcServer = new RpcServer<DevRpcServer>(wss);

  rpcServer.register('saveFile', async (name, file) => {
    console.log(`Saving file ${name}`);
  });

  const wsUrl = `ws://localhost:${port}`;

  const config: GenerateLibConfig = {
    dev: true,
    wsUrl,
  };

  await generateLib(root, config);

  const ymlPattern = getYmlPattern(root);

  chokidar
    .watch(ymlPattern, {
      ignoreInitial: true,
    })
    .on('all', async () => {
      try {
        await generateLib(root, config);
      } catch (error) {
        console.error(`Generation failed`);
        console.error(error);
      }
    });
}
