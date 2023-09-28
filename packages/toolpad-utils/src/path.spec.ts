import { describe, test, expect } from 'vitest';
import path from 'path';
import os from 'os';
import { getExtension, bashResolvePath } from './path';

describe('resolveValues', () => {
  test.each([
    ['/a/b/c.foo', '.foo'],
    ['/a/b/c', ''],
    ['a', ''],
    ['a.foo', '.foo'],
    ['/a/b.foo.bar', '.bar'],
    ['b.foo.bar', '.bar'],
  ])('extension of %s should be %s', async (got, expected) => {
    expect(getExtension(got)).toEqual(expected);
  });

  test('test absolute url', async () => {
    const homeAbsoluteUrl = bashResolvePath('~/test');
    const cwdAbsoluteUrl = bashResolvePath('./test');
    expect(homeAbsoluteUrl).toEqual(path.resolve(os.homedir(), 'test'));
    expect(cwdAbsoluteUrl).toEqual(path.resolve(process.cwd(), './test'));
  });
});
