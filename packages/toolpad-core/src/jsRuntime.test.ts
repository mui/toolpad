/// <reference types="jest" />

import { getQuickJS } from 'quickjs-emscripten';
import { evalExpression, DeferredValues } from './jsRuntime';
import { EvalScope } from './types';

async function evalExpressionInRuntime(
  expression: string,
  globalScope: EvalScope = {},
  deferreds: DeferredValues = {},
) {
  const QuickJS = await getQuickJS();
  const runtime = QuickJS.newRuntime();
  try {
    return evalExpression(runtime, expression, globalScope, deferreds);
  } finally {
    runtime.dispose();
  }
}

describe('evalExpression', () => {
  test('Basic expression', async () => {
    const { value } = await evalExpressionInRuntime('1 + 3 + 7');
    expect(value).toBe(11);
  });

  test('With globals', async () => {
    const { value } = await evalExpressionInRuntime('3 + x + foo.bar.baz', {
      x: 5,
      foo: { bar: { baz: 7 } },
    });
    expect(value).toBe(15);
  });

  test('With functions', async () => {
    const { value } = await evalExpressionInRuntime(`x('Jack', 'Joe') + y()`, {
      x: (a, b) => `hello ${a} and ${b}`,
      y: () => `!`,
    });
    expect(value).toBe('hello Jack and Joe!');
  });

  test('With undefined', async () => {
    const { value } = await evalExpressionInRuntime(`typeof x`, {
      x: undefined,
    });
    expect(value).toBe('undefined');
  });

  test('With deferred error', async () => {
    const { value, error } = await evalExpressionInRuntime(
      `x.y.z`,
      {
        x: {
          y: {
            z: 'foo',
          },
        },
      },
      {
        x: {
          y: { error: 'kaboom' },
        },
      },
    );
    expect(value).toBe(undefined);
    expect(error).toHaveProperty('message', 'kaboom');
  });

  test('With deferred loading', async () => {
    const { value, error, loading } = await evalExpressionInRuntime(
      `x.y.z`,
      {
        x: {
          y: {
            z: 'foo',
          },
        },
      },
      {
        x: {
          y: { loading: true },
        },
      },
    );
    expect(value).toBe(undefined);
    expect(error).toBe(undefined);
    expect(loading).toBe(true);
  });
});
