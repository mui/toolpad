/// <reference types="jest" />

import { getQuickJS } from 'quickjs-emscripten';
import evalExpression from './evalExpression';
import { Serializable } from './types';

async function evalExpressionInRuntime(
  expression: string,
  globalScope: Record<string, Serializable> = {},
) {
  const QuickJS = await getQuickJS();
  const runtime = QuickJS.newRuntime();
  try {
    return evalExpression(runtime, expression, globalScope);
  } finally {
    runtime.dispose();
  }
}

describe('evalExpression', () => {
  test('Basic expression', async () => {
    const result = await evalExpressionInRuntime('1 + 3 + 7');
    expect(result).toBe(11);
  });

  test('With globals', async () => {
    const result = await evalExpressionInRuntime('3 + x + foo.bar.baz', {
      x: 5,
      foo: { bar: { baz: 7 } },
    });
    expect(result).toBe(15);
  });

  test('With functions', async () => {
    const result = await evalExpressionInRuntime(`x('Jack', 'Joe') + y()`, {
      x: (a, b) => `hello ${a} and ${b}`,
      y: () => `!`,
    });
    expect(result).toBe('hello Jack and Joe!');
  });

  test('With undefined', async () => {
    const result = await evalExpressionInRuntime(`typeof x`, {
      x: undefined,
    });
    expect(result).toBe('undefined');
  });
});
