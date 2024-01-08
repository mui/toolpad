import prettier from 'prettier';
import parserBabel from 'prettier/parser-babel.js';

const DEFAULT_OPTIONS = {
  parser: 'babel-ts',
  plugins: [parserBabel],
};

/**
 * get prettier config file
 */
export async function resolvePrettierConfig(filePath: string) {
  const config = await prettier.resolveConfig(filePath);
  return config;
}

/**
 * Formats a javascript source with `prettier`.
 */
export async function format(code: string, filePath: string): Promise<string> {
  const readConfig = await resolvePrettierConfig(filePath);
  return prettier.format(code, {
    ...readConfig,
    ...DEFAULT_OPTIONS,
  });
}

/**
 * Formats a javascript expression with `prettier`.
 */
export async function formatExpression(
  code: string,
  config?: prettier.Options | null,
): Promise<string> {
  const formatted = prettier.format(code, {
    ...config,
    ...DEFAULT_OPTIONS,
    semi: false,
  });

  // There's no mode to format expressions in prettier. It will insert a semicolon in front
  // in certain occasions. See https://github.com/prettier/prettier/issues/2841
  return formatted.replace(/^;/, '');
}

/**
 * Formats a javascript expression with `prettier`, if it's valid.
 */
export async function tryFormatExpression(
  code: string,
  config?: prettier.Options,
): Promise<string> {
  try {
    return formatExpression(code, config);
  } catch (err) {
    return code;
  }
}
