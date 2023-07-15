import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as z from 'zod';
import * as yaml from 'yaml';
import { GridColDef } from '@mui/x-data-grid-pro';
import * as esbuild from 'esbuild';
import * as chokidar from 'chokidar';
import { format } from './prettier';

const dataGridFileSchema = z.object({
  kind: z.literal('DataGrid'),
  spec: z
    .object({
      rows: z
        .discriminatedUnion('kind', [
          z.object({
            kind: z.literal('property'),
          }),
          z.object({
            kind: z.literal('fetch'),
            method: z.enum(['GET', 'POST']).optional(),
            url: z.string().optional(),
          }),
        ])
        .optional(),
      columns: z
        .array(
          z.object({
            field: z.string(),
            type: z.enum(['string', 'number', 'date', 'dateTime', 'boolean']).optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

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

type DataGridFile = z.infer<typeof dataGridFileSchema>;

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

function generateComponent(name: string, dataGridFile: DataGridFile) {
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

    const columns = ${serializeArray(columnDefs)};

    export interface ToolpadDataGridProps {
      rows: ${hasRowsProperty ? '{ id: string | number }[]' : 'undefined'};
    }

    export default function ToolpadDataGrid({ rows = [] }: ToolpadDataGridProps) {
      return (
        <Box sx={{ width: '100%', height: 400 }}>
          <DataGridPro rows={rows} columns={columns} /> 
        </Box>
      )
    }

    ToolpadDataGrid.displayName = ${JSON.stringify(name)};
  `;

  return format(code);
}

async function compileComponent(code: string) {
  const result = await esbuild.transform(code, {
    loader: 'tsx',
    format: 'esm',
    target: 'es2020',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  });

  return result.code;
}

function generateIndex(entries: string[]) {
  return entries.map((entryPath) => {
    const name = getNameFromPath(entryPath);
    return `export { default as ${name} } from './${name}';`;
  });
}

function generateIndexTypes(entries: string[]) {
  return entries.map((entryPath) => {
    const name = getNameFromPath(entryPath);
    return `export { default as ${name} } from './${name}';`;
  });
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

  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all([
    ...entries.map(async (entryPath) => {
      const yamlContent = await fs.readFile(entryPath, 'utf-8');
      const data = yaml.parse(yamlContent);
      const dataGridFile = dataGridFileSchema.parse(data);
      const name = getNameFromPath(entryPath);

      const generatedComponent = generateComponent(name, dataGridFile);
      const compiledComponent = await compileComponent(generatedComponent);

      await Promise.all([
        fs.writeFile(path.join(outputDir, `${name}.tsx`), generatedComponent, {
          encoding: 'utf-8',
        }),
        fs.writeFile(path.join(outputDir, `${name}.mjs`), compiledComponent, {
          encoding: 'utf-8',
        }),
      ]);
    }),
    fs.writeFile(path.join(outputDir, `index.mjs`), generateIndex(entries), { encoding: 'utf-8' }),
    fs.writeFile(path.join(outputDir, `index.d.ts`), generateIndexTypes(entries), {
      encoding: 'utf-8',
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
