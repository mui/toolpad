import evalExpression from './evalExpression';

describe('evalExpression', () => {
  test('Basic expression', async () => {
    const result = await evalExpression('1 + 3 + 7');
    expect(result).toBe(11);
  });

  test('With globals', async () => {
    const result = await evalExpression('3 + x + foo.bar.baz', {
      x: 5,
      foo: { bar: { baz: 7 } },
    });
    expect(result).toBe(15);
  });
});
