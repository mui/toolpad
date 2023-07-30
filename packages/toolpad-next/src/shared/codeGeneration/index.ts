import path from 'path-browserify';
import { format } from '../prettier';
import { ToolpadFile } from '../schemas';
import generateDataGridComponent from './generateDataGridComponent';

export type CodeFiles = [string, { code: string }][];

export interface CodeGenerationResult {
  files: CodeFiles;
}

function isValidFileNAme(base: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(base);
}

export function getNameFromPath(filePath: string): string {
  const name = path.basename(filePath, '.yml');

  if (!isValidFileNAme(name)) {
    throw new Error(`Invalid file name ${JSON.stringify(name)}`);
  }

  return name;
}

export type GenerateComponentConfig = {
  outDir?: string;
} & (
  | {
      target: 'prod';
    }
  | {
      target: 'preview';
    }
  | {
      target: 'dev';
      wsUrl: string;
    }
);

export async function generateComponent(
  name: string,
  file: ToolpadFile,
  config: GenerateComponentConfig,
): Promise<CodeGenerationResult> {
  switch (file.kind) {
    case 'DataGrid':
      return generateDataGridComponent(name, file, config);
    default:
      throw new Error(`No implementation yet for ${JSON.stringify(file.kind)}`);
  }
}

export interface GenerateIndexConfig {
  outDir?: string;
}

export async function generateIndex(
  entries: string[],
  config: GenerateIndexConfig,
): Promise<CodeGenerationResult> {
  const { outDir = '/' } = config;

  const code = entries
    .map((entryPath) => {
      const name = getNameFromPath(entryPath);
      return `export { default as ${name} } from './${name}';`;
    })
    .join('\n');

  const fileName = path.join(outDir, 'index.ts');

  const files: CodeFiles = [[fileName, { code: await format(code) }]];

  return { files };
}
