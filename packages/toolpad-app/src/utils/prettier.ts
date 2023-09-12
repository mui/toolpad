import * as prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';

const DEFAULT_OPTIONS = {
  parser: 'babel-ts',
  plugins: [parserBabel],
};

/**
 * Formats a javascript source with `prettier`.
 */
export async function format(code: string, filePath: string): Promise<string> {
  const readConfig = await prettier.resolveConfig(filePath);
  return prettier.format(code, {
    ...readConfig,
    ...DEFAULT_OPTIONS,
  });
}

/**
 * Formats a javascript expression with `prettier`.
 */
export function formatExpression(code: string): string {
  const formatted = prettier.format(code, {
    ...DEFAULT_OPTIONS,
    semi: false,
  });

  // There's no mode to format expressions in prettier. It will insert a semicolon in front
  // in certain occasions. See https://github.com/prettier/prettier/issues/2841
  return formatted.replace(/^;/, '');
}

/**
 * Formats a javascript source with `prettier`, if it's valid.
 */
export async function tryFormat(code: string, filePath: string): string {
  try {
    return await format(code, filePath);
  } catch (err) {
    return code;
  }
}

/**
 * Formats a javascript expression with `prettier`, if it's valid.
 */
export function tryFormatExpression(code: string): string {
  try {
    return formatExpression(code);
  } catch (err) {
    return code;
  }
}
