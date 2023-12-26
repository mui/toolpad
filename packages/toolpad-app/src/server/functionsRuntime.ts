import * as path from 'path';
import { createRequire } from 'node:module';
import * as fs from 'fs/promises';
import * as vm from 'vm';
import * as url from 'node:url';
import { initialContextStore } from '@mui/toolpad-core/serverRuntime';
import { TOOLPAD_DATA_PROVIDER_MARKER, ToolpadDataProvider } from '@mui/toolpad-core/server';
import * as z from 'zod';
import { fromZodError } from 'zod-validation-error';

import.meta.url ??= url.pathToFileURL(__filename).toString();

interface ModuleObject {
  exports: Record<string, unknown>;
}

const fileContents = new Map<string, string>();
const moduleCache = new Map<string, ModuleObject>();

function loadModule(fullPath: string, content: string) {
  const moduleRequire = createRequire(url.pathToFileURL(fullPath));
  const moduleObject: ModuleObject = { exports: {} };

  const serverRuntime = moduleRequire('@mui/toolpad/server');
  // eslint-disable-next-line no-underscore-dangle
  serverRuntime.__initContextStore(initialContextStore);

  vm.runInThisContext(`((require, exports, module) => {\n${content}\n})`)(
    moduleRequire,
    moduleObject.exports,
    moduleObject,
  );

  return moduleObject;
}

async function loadExports(filePath: string): Promise<Map<string, unknown>> {
  const fullPath = path.resolve(filePath);
  const content = await fs.readFile(fullPath, 'utf-8');

  if (content !== fileContents.get(fullPath)) {
    moduleCache.delete(fullPath);
    fileContents.set(fullPath, content);
  }

  let cachedModule = moduleCache.get(fullPath);

  if (!cachedModule) {
    cachedModule = loadModule(fullPath, content);
    moduleCache.set(fullPath, cachedModule);
  }

  return new Map(Object.entries(cachedModule.exports));
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
