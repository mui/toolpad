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

    // There's no mode to format expressions in prettier. It will insert a semicolon in front
    // in certain occasions. See https://github.com/prettier/prettier/issues/2841
    return formatted.replace(/^;/, '');
  } catch (err) {
    return code;
  }
}
