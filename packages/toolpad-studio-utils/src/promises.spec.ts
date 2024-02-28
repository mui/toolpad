import { describe, test, expect } from 'vitest';
import { resolveValues } from './promises';

describe('resolveValues', () => {
  test.each([
    [
      {
        a: 1,
        b: Promise.resolve(2),
      },
      {
        a: 1,
        b: 2,
      },
    ],
    [{}, {}],
  ])('should resolve %p to %p', async (got, expected) => {
    expect(await resolveValues(got)).toEqual(expected);
  });
});
