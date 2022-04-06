import { getQuickJS, QuickJSHandle, QuickJSContext } from 'quickjs-emscripten';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function newJson(ctx: QuickJSContext, json: Json): QuickJSHandle {
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
    default:
      throw new Error(`Invariant: invalid value: ${json}`);
  }
}

export default async function evalExpression(
  expression: string,
  globalScope: Record<string, Json> = {},
) {
  const QuickJS = await getQuickJS();
  const ctx = QuickJS.newContext();

  try {
    Object.entries(globalScope).forEach(([key, value]) => {
      const valueHandle = newJson(ctx, value);
      ctx.setProp(ctx.global, key, valueHandle);
      valueHandle.dispose();
    });

    const result = ctx.unwrapResult(ctx.evalCode(expression));
    const resultValue = ctx.dump(result);
    result.dispose();
    return resultValue;
  } finally {
    ctx.dispose();
  }
}
