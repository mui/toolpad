import { test, expect } from 'vitest';
import { getExtension } from './path';

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
