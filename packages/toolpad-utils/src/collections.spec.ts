import { describe, test, expect } from '@jest/globals';
import { asArray, isDeepEqual, isArray, isMap, isObject, isSet } from './collections';

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
describe('isDeepEqual', () => {
  test('isDeepEqual array', () => {
    expect(isDeepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(isDeepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(isDeepEqual([1, 2, 3], new Set([1, 2, 3]))).toBe(false);
  });
  test('isDeepEqual object', () => {
    expect(
      isDeepEqual(
        {
          a: 1,
          b: 2,
          c: 3,
        },
        {
          a: 1,
          b: 2,
          c: 3,
        },
      ),
    ).toBe(true);
    expect(
      isDeepEqual(
        {
          a: 1,
          b: 2,
          c: 3,
        },
        {
          a: 1,
          b: 2,
          c: 4,
        },
      ),
    ).toBe(false);
  });
  test('isDeepEqual Set', () => {
    expect(isDeepEqual(new Set([1, 2, 3]), new Set([1, 2, 3]))).toBe(true);
    expect(isDeepEqual(new Set([1, 2, 3]), new Set([1, 2, 4]))).toBe(false);
  });

  test('isDeepEqual Map', () => {
    expect(
      isDeepEqual(
        new Map([
          ['foo', 1],
          ['bar', 2],
        ]),
        new Map([
          ['foo', 1],
          ['bar', 2],
        ]),
      ),
    ).toBe(true);
    expect(
      isDeepEqual(
        new Map([
          ['foo', 1],
          ['bar', 2],
        ]),
        new Map([
          ['foo', 1],
          ['bar', 4],
        ]),
      ),
    ).toBe(false);
  });
});

describe('check type of data', () => {
  test('isArray', () => {
    expect(isArray([])).toBe(true);
    expect(isArray({})).toBe(false);
    expect(isArray(new Set())).toBe(false);
    expect(isArray(new Map())).toBe(false);
  });
  test('isMap', () => {
    expect(isMap([])).toBe(false);
    expect(isMap({})).toBe(false);
    expect(isMap(new Set())).toBe(false);
    expect(isMap(new Map())).toBe(true);
  });
  test('isObject', () => {
    expect(isObject([])).toBe(true);
    expect(isObject({})).toBe(true);
    expect(isObject(new Set())).toBe(true);
    expect(isObject(new Map())).toBe(true);
  });
  test('isSet', () => {
    expect(isSet([])).toBe(false);
    expect(isSet({})).toBe(false);
    expect(isSet(new Set())).toBe(true);
    expect(isSet(new Map())).toBe(false);
  });
});
