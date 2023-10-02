import { describe, test, expect } from 'vitest';
import { asArray, equalProperties, sortBy } from './collections';

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

describe('sortBy', () => {
  test.each([
    [
      [
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'bureaucracy', b: 1, c: 8 },
        { a: 'charcoal', b: 4, c: 2 },
      ],
      'b',
      true,
      [
        { a: 'bureaucracy', b: 1, c: 8 },
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'charcoal', b: 4, c: 2 },
      ],
    ],
    [
      [
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'bureaucracy', b: 1, c: 8 },
        { a: 'charcoal', b: 4, c: 2 },
      ],
      'c',
      false,
      [
        { a: 'bureaucracy', b: 1, c: 8 },
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'charcoal', b: 4, c: 2 },
      ],
    ],
    [
      [
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'bureaucracy', b: 1, c: 8 },
        { a: 'charcoal', b: 4, c: 2 },
      ],
      'a',
      true,
      [
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'bureaucracy', b: 1, c: 8 },
        { a: 'charcoal', b: 4, c: 2 },
      ],
    ],
    [
      [
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'bureaucracy', b: 1, c: 8 },
        { a: 'charcoal', b: 4, c: 2 },
      ],
      'a',
      false,
      [
        { a: 'charcoal', b: 4, c: 2 },
        { a: 'bureaucracy', b: 1, c: 8 },
        { a: 'asbestos', b: 2, c: 7 },
      ],
    ],
  ])('should sort %p to %p', (objs, prop, direction, expected) => {
    expect(sortBy(objs, prop as 'a' | 'b' | 'c', direction)).toEqual(expected);
  });
});
