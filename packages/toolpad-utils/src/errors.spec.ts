import { test, expect } from '@jest/globals';
import { errorFrom } from './errors';

test('leaves errors untouched', () => {
  const error = new Error('BOOM!');
  expect(errorFrom(error)).toBe(error);
});

test('converts objects', () => {
  const error = { message: 'BOOM!' };
  const result = errorFrom(error);
  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty('message', 'BOOM!');
  expect(result).toHaveProperty('cause', error);
});

test('converts strings', () => {
  const result = errorFrom('BOOM!');
  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty('message', 'BOOM!');
  expect(result).toHaveProperty('cause', 'BOOM!');
});
