import { describe, test, expect } from '@jest/globals';
import { asArray, equalProperties } from './collections';

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

const OBJECT = {};

describe('equalProperties', () => {
  test.each([
    [{ a: 1, b: 2 }, { a: 1, b: 2 }, true],
    [{ a: 1 }, { b: 1 }, false],
    [{ a: {} }, { a: {} }, false],
    [{ a: OBJECT }, { a: OBJECT }, true],
  ])('should compare %p and %p', (obj1, obj2, expected) => {
    expect(equalProperties(obj1, obj2)).toBe(expected);
  });
});
