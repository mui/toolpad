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
import {
  getNameFromPath,
  generateComponent,
  generateIndex,
  GenerateComponentConfig,
  CodeFiles,
} from '../shared/codeGeneration';
import { DevRpcMethods } from '../shared/types';

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

async function generateLib(root: string, config: GenerateComponentConfig = { target: 'prod' }) {
  // eslint-disable-next-line no-console
  console.log(`Generating lib at ${JSON.stringify(root)} in "${config.target}" mode`);

  const toolpadDir = getToolpadDir(root);
  const outputDir = path.join(toolpadDir, '.generated');
  const ymlPattern = getYmlPattern(root);
  const entries = await glob(ymlPattern);

  await fs.rm(outputDir, { recursive: true });

  await fs.mkdir(outputDir, { recursive: true });

  await Promise.all([
    ...entries.map(async (entryPath) => {
      const yamlContent = await fs.readFile(entryPath, 'utf-8');
      const data = yaml.parse(yamlContent);
      const file = toolpadFileSchema.parse(data);
      const name = getNameFromPath(entryPath);

      const { files } = await generateComponent(name, file, {
        ...config,
        outDir: outputDir,
      });

      await writeAndCompile(files);
    }),

    generateIndex(entries, {
      outDir: outputDir,
    }).then(async ({ files }) => writeAndCompile(files)),
  ]);

  console.error(`Generation completed!`);
}

export async function generateCommand({ dir }: Config) {
  const root = resolveRoot(dir);

  await generateLib(root);
}

export async function devCommand({ dir }: Config) {
  const root = resolveRoot(dir);

  const port = await getPort();

  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    ws.on('error', console.error);
  });

  const rpcServer = new RpcServer<DevRpcMethods>(wss);

  rpcServer.register('saveFile', async (name, file) => {
    // Validate content before saving
    toolpadFileSchema.parse(file);

    const toolpadDir = getToolpadDir(root);
    const filePath = path.join(toolpadDir, `${name}.yml`);

    const content = yaml.stringify(file);
    await fs.writeFile(filePath, content, { encoding: 'utf-8' });
  });

  const wsUrl = `ws://localhost:${port}`;

  const config: GenerateComponentConfig = {
    target: 'dev',
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
