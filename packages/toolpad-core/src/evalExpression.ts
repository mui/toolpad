import { QuickJSHandle, QuickJSContext, QuickJSRuntime } from 'quickjs-emscripten';
import { EvalScope, Serializable } from './types';

function newJson(ctx: QuickJSContext, json: Serializable): QuickJSHandle {
  switch (typeof json) {
    case 'string':
      return ctx.newString(json);
    case 'number':
      return ctx.newNumber(json);
    case 'boolean':
      return json ? ctx.true : ctx.false;
    case 'object': {
      if (!json) {
        return ctx.null;
      }
      if (Array.isArray(json)) {
        const result = ctx.newArray();
        Object.values(json).forEach((value, i) => {
          const valueHandle = newJson(ctx, value);
          ctx.setProp(result, i, valueHandle);
          valueHandle.dispose();
        });
        return result;
      }
      const result = ctx.newObject();
      Object.entries(json).forEach(([key, value]) => {
        const valueHandle = newJson(ctx, value);
        ctx.setProp(result, key, valueHandle);
        valueHandle.dispose();
      });
      return result;
    }
    case 'function': {
      const result = ctx.newFunction('anonymous', (...args) => {
        const dumpedArgs: Serializable[] = args.map((arg) => ctx.dump(arg));
        const fnResult = json(...dumpedArgs);
        return newJson(ctx, fnResult);
      });
      return result;
    }
    case 'undefined': {
      return ctx.undefined;
    }
    default:
      throw new Error(`Invariant: invalid value: ${json}`);
  }
}

function evalExpressionInContext(
  ctx: QuickJSContext,
  expression: string,
  globalScope: EvalScope = {},
) {
  Object.entries(globalScope).forEach(([key, value]) => {
    const valueHandle = newJson(ctx, value);
    ctx.setProp(ctx.global, key, valueHandle);
    valueHandle.dispose();
  });

  const result = ctx.unwrapResult(ctx.evalCode(expression));
  const resultValue = ctx.dump(result);
  result.dispose();
  return resultValue;
}

export default function evalExpression(
  runtime: QuickJSRuntime,
  expression: string,
  globalScope: EvalScope = {},
) {
  const ctx = runtime.newContext();
  try {
    return evalExpressionInContext(ctx, expression, globalScope);
  } finally {
    ctx.dispose();
  }
}
