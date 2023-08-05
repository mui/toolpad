import * as path from 'path';
import * as z from 'zod';
import { fileExists } from '@mui/toolpad-utils/fs';
import { Config } from '../shared/types';

export async function resolveConfig(projectDir: string): Promise<string | undefined> {
  const configPath = path.resolve(projectDir, './toolpad.config.mjs');
  const exists = await fileExists(configPath);
  return exists ? configPath : undefined;
}

function createConfigSchema(projectDir: string) {
  const resolveConfigFilePath = (input: string) => path.resolve(projectDir, input);
  return z.object({
    rootDir: z.string().optional().default('./toolpad').transform(resolveConfigFilePath),
    outDir: z.string().optional().default('./toolpad/.generated').transform(resolveConfigFilePath),
  });
}

export async function loadConfigFromFile(configFilePath: string): Promise<Config> {
  const { default: configInput } = await import(configFilePath);
  const configSchema = createConfigSchema(path.dirname(configFilePath));
  const config = configSchema.parse(configInput);
  return config;
}

export async function loadConfig(projectDir: string): Promise<Config> {
  const configFilePath = await resolveConfig(projectDir);
  if (configFilePath) {
    return loadConfigFromFile(configFilePath);
  }
  return createConfigSchema(projectDir).parse({});
}
