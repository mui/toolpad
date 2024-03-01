import { describe, test, expect } from 'vitest';
import {
  Comparator,
  alphabeticComparator,
  createPropComparator,
  defaultComparator,
} from './comparators';

describe('createPropComparator', () => {
  test.each([
    [
      [
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'bureaucracy', b: 1, c: 8 },
        { a: 'charcoal', b: 4, c: 2 },
      ],
      'b',
      defaultComparator,
      [
        { a: 'bureaucracy', b: 1, c: 8 },
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'charcoal', b: 4, c: 2 },
      ],
    ],
    [
      [
        { a: 'charcoal', b: 4, c: 2 },
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'bureaucracy', b: 1, c: 8 },
      ],
      'c',
      defaultComparator,
      [
        { a: 'charcoal', b: 4, c: 2 },
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'bureaucracy', b: 1, c: 8 },
      ],
    ],
    [
      [
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'charcoal', b: 4, c: 2 },
        { a: 'Bureaucracy', b: 1, c: 8 },
      ],
      'a',
      alphabeticComparator,
      [
        { a: 'asbestos', b: 2, c: 7 },
        { a: 'Bureaucracy', b: 1, c: 8 },
        { a: 'charcoal', b: 4, c: 2 },
      ],
    ],
  ])('should sort %p to %p', (objs, prop, comparator, expected) => {
    expect(
      [...objs].sort(
        createPropComparator(prop as 'a' | 'b' | 'c', comparator as Comparator<string | number>),
      ),
    ).toEqual(expected);
  });
});
