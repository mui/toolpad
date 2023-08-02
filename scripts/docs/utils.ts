import * as fs from 'fs/promises';
import prettier from 'prettier';

export function escapeCell(value: string): string {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br />');
}

export async function writePrettifiedFile(
  filename: string,
  data: string,
  prettierConfigPath: string,
) {
  const prettierConfig = await prettier.resolveConfig(filename, {
    config: prettierConfigPath,
  });

  if (prettierConfig === null) {
    throw new Error(
      `Could not resolve config for '${filename}' using prettier config path '${prettierConfigPath}'.`,
    );
  }

  await fs.writeFile(filename, prettier.format(data, { ...prettierConfig, filepath: filename }), {
    encoding: 'utf8',
  });
}
