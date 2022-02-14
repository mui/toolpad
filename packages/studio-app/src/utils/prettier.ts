import * as prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';

const DEFAULT_OPTIONS = {
  parser: 'babel-ts',
  plugins: [parserBabel],
};

export function tryFormat(code: string): string {
  try {
    const formatted = prettier.format(code, DEFAULT_OPTIONS);

    return formatted;
  } catch (err) {
    return code;
  }
}

export function tryFormatExpression(code: string): string {
  try {
    const formatted = prettier.format(code, {
      ...DEFAULT_OPTIONS,
      semi: false,
    });

    return formatted;
  } catch (err) {
    return code;
  }
}
