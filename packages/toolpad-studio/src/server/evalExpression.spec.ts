import { createServerJsRuntime } from '@toolpad/studio-runtime/jsServerRuntime';
import { describe, test, expect } from 'vitest';

async function evalExpression(expression: string, globalScope: Record<string, unknown> = {}) {
  const jsServerRuntime = await createServerJsRuntime();
  const { value, error } = jsServerRuntime.evaluateExpression(expression, globalScope);

  if (error) {
    throw error;
  }

  return value;
}

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

  test('With functions', async () => {
    const result = await evalExpression(`x('Jack', 'Joe') + y()`, {
      x: (a: string, b: string) => `hello ${a} and ${b}`,
      y: () => `!`,
    });
    expect(result).toBe('hello Jack and Joe!');
  });

  test('With undefined', async () => {
    const result = await evalExpression(`String(x)`, {
      x: undefined,
    });
    expect(result).toBe('undefined');
  });
});
