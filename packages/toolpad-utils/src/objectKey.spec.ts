import { describe, test, expect } from 'vitest';
import { getObjectKey } from './objectKey';

const OBJECT1 = {};
const OBJECT2 = {};

describe('getObjectKey', () => {
  test('compare the same object', () => {
    expect(getObjectKey(OBJECT1)).toBe(getObjectKey(OBJECT1));
  });

  test('compare different object', () => {
    expect(getObjectKey(OBJECT1)).not.toBe(getObjectKey(OBJECT2));
  });
});
