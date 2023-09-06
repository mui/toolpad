import * as prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';

const PRETTIERNAME = 'prettier.config.js';

const DEFAULT_OPTIONS = {
  parser: 'babel-ts',
  plugins: [parserBabel],
};

function readConfig() {
  return prettier.resolveConfig.sync(PRETTIERNAME);
}

/**
 * Formats a javascript source with `prettier`.
 */
export function format(code: string): string {
  return prettier.format(code, DEFAULT_OPTIONS);
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
export function tryFormat(code: string): string {
  try {
    return format(code);
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

/**
 * Formats a yaml source with `prettier`.
 */
export function formatYaml(code: string): string {
  return prettier.format(code, {
    parser: 'yaml',
    ...readConfig(),
  });
}
