import * as prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';

const DEFAULT_OPTIONS = {
  parser: 'babel-ts',
  plugins: [parserBabel],
};

export function format(code: string): string {
  return prettier.format(code, DEFAULT_OPTIONS);
}
