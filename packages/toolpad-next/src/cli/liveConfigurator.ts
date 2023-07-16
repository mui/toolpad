import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as yaml from 'yaml';
import { GridColDef } from '@mui/x-data-grid-pro';
import * as esbuild from 'esbuild';
import * as chokidar from 'chokidar';
import serializeJavascript from 'serialize-javascript';
import { format } from './prettier';
import { DataGridFile, ToolpadFile, toolpadFileSchema } from '../shared/schemas';

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

function serializeObject(properties: Record<string, string>): string {
  return `{${Object.entries(properties)
    .map((entry) => entry.join(': '))
    .join(', ')}}`;
}
function serializeArray(items: string[]): string {
  return `[${items.join(', ')}]`;
}

type SerializedProperties<O> = {
  [K in keyof O]: string | (undefined extends O[K] ? undefined : never);
};

interface GenerateComponentConfig {
  name: string;
  dev: boolean;
}

async function generateDataGridComponent(
  dataGridFile: DataGridFile,
  { name, dev }: GenerateComponentConfig,
) {
  const hasRowsProperty = (dataGridFile.spec?.rows?.kind ?? 'property') === 'property';

  const columnDefs: string[] =
    dataGridFile.spec?.columns?.map((column) => {
      const properties: SerializedProperties<GridColDef> = {
        field: JSON.stringify(column.field),
      };

      if (column.type) {
        properties.type = JSON.stringify(column.type);
      }

      return serializeObject(properties);
    }) || [];

  const code = `
    import * as React from 'react';
    import { DataGridPro } from '@mui/x-data-grid-pro';
    import { Box } from '@mui/material';
    ${dev ? `import { withDevtool, EditButton } from '@mui/toolpad-next/runtime';` : ''}

    const columns = ${serializeArray(columnDefs)};

    export interface ToolpadDataGridProps {
      rows: ${hasRowsProperty ? '{ id: string | number }[]' : 'undefined'};
    }

    function ToolpadDataGrid({ rows = [] }: ToolpadDataGridProps) {
      return (
        <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
          <DataGridPro rows={rows} columns={columns} />
          ${
            dev
              ? `<EditButton sx={{ position: 'absolute', bottom: 0, right: 0, mb: 2, mr: 2, zIndex: 1 }} />`
              : ''
          }
        </Box>
      )
    }

    ToolpadDataGrid.displayName = ${JSON.stringify(name)};

    export default ${
      dev
        ? `withDevtool(ToolpadDataGrid, ${serializeObject({
            name: JSON.stringify(name),
            file: serializeJavascript(dataGridFile),
          })})`
        : 'ToolpadDataGrid'
    };
  `;

  return format(code);
}

async function generateComponent(file: ToolpadFile, config: GenerateComponentConfig) {
  switch (file.kind) {
    case 'DataGrid':
      return generateDataGridComponent(file, config);
    default:
      throw new Error(`No implementation yet for ${JSON.stringify(file.kind)}`);
  }
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

async function generateIndex(entries: string[]): Promise<string> {
  return entries
    .map((entryPath) => {
      const name = getNameFromPath(entryPath);
      return `export { default as ${name} } from './${name}';`;
    })
    .join('\n');
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

interface GenerateConfig {
  dev?: boolean;
}

async function generateLib(root: string, { dev = false }: GenerateConfig = {}) {
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

      const generatedComponentPromise = generateComponent(file, { name, dev });

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
  const config: GenerateConfig = {
    dev: true,
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
