import * as prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';

const DEFAULT_OPTIONS = {
  parser: 'babel-ts',
  plugins: [parserBabel],
};

export function format(code: string): string {
  return prettier.format(code, DEFAULT_OPTIONS);
}

export function formatExpression(code: string): string {
  const formatted = prettier.format(code, {
    ...DEFAULT_OPTIONS,
    semi: false,
  });

  // There's no mode to format expressions in prettier. It will insert a semicolon in front
  // in certain occasions. See https://github.com/prettier/prettier/issues/2841
  return formatted.replace(/^;/, '');
}

export function tryFormat(code: string): string {
  try {
    return format(code);
  } catch (err) {
    return code;
  }
}

export function tryFormatExpression(code: string): string {
  try {
    return formatExpression(code);
  } catch (err) {
    return code;
  }
}
