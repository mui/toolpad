import { describe, test, expect } from '@jest/globals';
import { asArray } from './collections';

describe('asArray', () => {
  test.each([
    ['hello', ['hello']],
    [['hello'], ['hello']],
    [undefined, [undefined]],
    ['', ['']],
  ])('should convert %p to %p', (got, expected) => {
    expect(asArray(got)).toEqual(expected);
  });
});
