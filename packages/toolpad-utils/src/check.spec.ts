import { describe, test, expect } from '@jest/globals';
import { isArray, isMap, isObject, isSet } from './check';

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
