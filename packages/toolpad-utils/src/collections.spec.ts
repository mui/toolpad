import { describe, test, expect } from '@jest/globals';
import { asArray, isReferEqual } from './collections';

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
describe('isReferEqual', () => {
  test('isReferEqual array', () => {
    const m = [1, 2, 3];
    const d = [1, 2, 4];
    expect(isReferEqual(m, m)).toBe(true);
    expect(isReferEqual(m, d)).toBe(false);
    expect(isReferEqual(m, new Set(m))).toBe(false);
  });
  test('isReferEqual object', () => {
    const m = {
      a: 1,
      b: 2,
      c: 3,
    };
    const d = {
      a: 1,
      b: 2,
      c: 4,
    };
    expect(isReferEqual(m, m)).toBe(true);
    expect(isReferEqual(m, d)).toBe(false);
  });
  test('isReferEqual Set', () => {
    const m = new Set([1, 2, 3]);
    const d = new Set([1, 2, 4]);
    expect(isReferEqual(m, m)).toBe(true);
    expect(isReferEqual(m, d)).toBe(false);
  });

  test('isReferEqual Map', () => {
    const m = new Map([
      ['foo', 1],
      ['bar', 2],
    ]);
    const d = new Map([
      ['foo', 1],
      ['bar', 4],
    ]);
    expect(isReferEqual(m, m)).toBe(true);
    expect(isReferEqual(m, d)).toBe(false);
  });
});
