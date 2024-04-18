import * as fs from 'fs/promises';
import * as path from 'path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as z from 'zod';
import { META } from '../../packages/toolpad-studio/src/server/schema';
import { writePrettifiedFile } from './utils';

const currentDirectory = __dirname;
const SCHEMA_DIR = path.resolve(currentDirectory, '../../docs/schemas/v1/');

async function main() {
  await fs.rm(SCHEMA_DIR, { recursive: true });
  await fs.mkdir(SCHEMA_DIR, { recursive: true });
  const schemaFile = path.resolve(SCHEMA_DIR, `./definitions.json`);
  const jsonSchema = zodToJsonSchema(z.object(META.schemas), {
    definitions: META.definitions,
  });
  const jsonContent = JSON.stringify(jsonSchema);
  await writePrettifiedFile(schemaFile, jsonContent);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
