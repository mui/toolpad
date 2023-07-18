import * as prettier from 'prettier/standalone';
// @ts-expect-error Waiting for https://github.com/prettier/prettier/pull/15018 to be released (expected in >=3.0.1)
import parserEstree from 'prettier/plugins/estree';
import parserBabel from 'prettier/plugins/babel';

const DEFAULT_OPTIONS = {
  parser: 'babel-ts',
  plugins: [parserBabel, parserEstree],
};

export async function format(code: string): Promise<string> {
  return prettier.format(code, DEFAULT_OPTIONS);
}
