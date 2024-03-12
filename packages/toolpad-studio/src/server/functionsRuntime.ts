import * as path from 'path';
import * as fs from 'fs/promises';
import { TOOLPAD_DATA_PROVIDER_MARKER, ToolpadDataProvider } from '@toolpad/studio-runtime/server';
import * as z from 'zod';
import { fromZodError } from 'zod-validation-error';
import * as crypto from 'crypto';

async function loadExports(filePath: string): Promise<Map<string, unknown>> {
  const fullPath = path.resolve(filePath);
  const content = await fs.readFile(fullPath, 'utf-8');
  const hash = crypto.createHash('md5').update(content).digest('hex');
  const exports = await import(`${fullPath}?${hash}`);
  return new Map(Object.entries(exports));
}

const dataProviderSchema: z.ZodType<ToolpadDataProvider<any, any>> = z.object({
  paginationMode: z.enum(['index', 'cursor']).optional().default('index'),
  getRecords: z.function(z.tuple([z.any()]), z.any()),
  deleteRecord: z.function(z.tuple([z.any()]), z.any()).optional(),
  updateRecord: z.function(z.tuple([z.any(), z.any()]), z.any()).optional(),
  createRecord: z.function(z.tuple([z.any()]), z.any()).optional(),
  [TOOLPAD_DATA_PROVIDER_MARKER]: z.literal(true),
});

export async function loadDataProvider(
  filePath: string,
  name: string,
): Promise<ToolpadDataProvider<any, any>> {
  const exports = await loadExports(filePath);
  const dataProviderExport = exports.get(name);

  if (!dataProviderExport || typeof dataProviderExport !== 'object') {
    throw new Error(`DataProvider "${name}" not found`);
  }

  const parsed = dataProviderSchema.safeParse(dataProviderExport);

  if (parsed.success) {
    return parsed.data;
  }

  throw fromZodError(parsed.error);
}

export async function execute(filePath: string, name: string, parameters: unknown[]): Promise<any> {
  const exports = await loadExports(filePath);

  const fn = exports.get(name);
  if (typeof fn !== 'function') {
    throw new Error(`Function "${name}" not found`);
  }

  const result = await fn(...parameters);

  return result;
}
