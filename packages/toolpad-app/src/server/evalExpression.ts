import invariant from 'invariant';
import { getQuickJS, QuickJSHandle, QuickJSContext } from 'quickjs-emscripten';

export type Serializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Serializable[]
  | { [key: string]: Serializable }
  | ((...args: Serializable[]) => Serializable);

export function newSerializable(ctx: QuickJSContext, json: Serializable): QuickJSHandle {
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
          const valueHandle = newSerializable(ctx, value);
          ctx.setProp(result, i, valueHandle);
          valueHandle.dispose();
        });
        return result;
      }
      const result = ctx.newObject();
      Object.entries(json).forEach(([key, value]) => {
        const valueHandle = newSerializable(ctx, value);
        ctx.setProp(result, key, valueHandle);
        valueHandle.dispose();
      });
      return result;
    }
    case 'function': {
      const result = ctx.newFunction('anonymous', (...args) => {
        const dumpedArgs: Serializable[] = args.map((arg) => ctx.dump(arg));
        const fnResult = json(...dumpedArgs);
        return newSerializable(ctx, fnResult);
      });
      return result;
    }
    case 'undefined':
      return ctx.undefined;
    default:
      return invariant(false, `invalid value: ${json}`);
  }
}

export function evalExpressionInContext(
  ctx: QuickJSContext,
  expression: string,
  globalScope: Record<string, Serializable> = {},
) {
  Object.entries(globalScope).forEach(([key, value]) => {
    const valueHandle = newSerializable(ctx, value);
    ctx.setProp(ctx.global, key, valueHandle);
    valueHandle.dispose();
  });

  const result = ctx.unwrapResult(ctx.evalCode(expression));
  const resultValue = ctx.dump(result);
  result.dispose();
  return resultValue;
}

export default async function evalExpression(
  expression: string,
  globalScope: Record<string, Serializable> = {},
) {
  const QuickJS = await getQuickJS();
  const ctx = QuickJS.newContext();
  try {
    return evalExpressionInContext(ctx, expression, globalScope);
  } finally {
    ctx.dispose();
  }
}
