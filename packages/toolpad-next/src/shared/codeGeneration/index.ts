import path from 'path-browserify';
import { format } from '../prettier';
import { ToolpadFile } from '../schemas';
import generateDataGridComponent from './generateDataGridComponent';
import { getComponentNameFromInputFile } from '../paths';

export type CodeFiles = [string, { code: string }][];

export interface CodeGenerationResult {
  files: CodeFiles;
}

export type BaseGenerateComponentOptions =
  | {
      target: 'prod';
    }
  | {
      target: 'preview';
    }
  | {
      target: 'dev';
      wsUrl: string;
    };

export type GenerateComponentOptions = BaseGenerateComponentOptions & {
  outDir: string;
};

export async function generateComponent(
  filePath: string,
  file: ToolpadFile,
  config: GenerateComponentOptions,
): Promise<CodeGenerationResult> {
  switch (file.kind) {
    case 'DataGrid':
      return generateDataGridComponent(filePath, file, config);
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
      const name = getComponentNameFromInputFile(entryPath);
      return `export { default as ${name} } from './${name}';`;
    })
    .join('\n');

  const fileName = path.join(outDir, 'index.ts');

  const files: CodeFiles = [[fileName, { code: await format(code) }]];

  return { files };
}
