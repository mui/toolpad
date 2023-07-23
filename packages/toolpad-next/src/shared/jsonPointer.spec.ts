import * as jsonPointer from './jsonPointer';

test.each([
  ['', []],
  ['/', ['']],
  ['//', ['', '']],
  ['/hello/world', ['hello', 'world']],
  ['/hello/4', ['hello', 4]],
])('decode %s', (input, expected) => {
  expect(jsonPointer.decode(input)).toEqual(expected);
});

test.each([
  [{ a: 'foo' }, '', { a: 'foo' }],
  [{ a: 'foo' }, '/', undefined],
  [{ '': 'foo' }, '/', 'foo'],
  [{ hello: { world: 1 } }, '/hello/world', 1],
  [{ hello: [1, 2, 3, 4, 5] }, '/hello/2', 3],
])('resolve ', (input, pointer, expected) => {
  expect(jsonPointer.resolve(input, pointer)).toEqual(expected);

  // eslint-disable-next-line no-eval
  expect(eval(jsonPointer.toExpression('input', pointer))).toEqual(expected);
});
