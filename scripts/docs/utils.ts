import * as fs from 'fs/promises';
import prettier from 'prettier';

export function escapeCell(value: string): string {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br />');
}

export async function writePrettifiedFile(filepath: string, data: string) {
  const prettierConfig = await prettier.resolveConfig(filepath);

  if (!prettierConfig) {
    throw new Error(`Could not resolve config for '${filepath}'.`);
  }

  const content = await prettier.format(data, { ...prettierConfig, filepath });

  await fs.writeFile(filepath, content, { encoding: 'utf8' });
}
