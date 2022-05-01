import {
  getQuickJS,
  RuntimeOptions,
  QuickJSRuntime,
  QuickJSContext,
  QuickJSHandle,
} from 'quickjs-emscripten';
import * as React from 'react';
import { EvalScope, Serializable } from './types';

export type JsRuntime = QuickJSRuntime;

const JsRuntimeContext = React.createContext<JsRuntime | null>(null);

export interface JsRuntimeProviderProps {
  options?: RuntimeOptions;
  children?: React.ReactNode;
}

export const JsRuntimeProvider = React.lazy(async () => {
  const quickJs = await getQuickJS();
  const Context = (props: JsRuntimeProviderProps) => {
    const [runtime, setRuntime] = React.useState(() => quickJs.newRuntime(props.options));

    // Make sure to dispose of runtime when it changes or unmounts
    React.useEffect(() => {
      return () => {
        if (runtime.alive) {
          runtime.dispose();
        }
      };
    }, [runtime]);

    React.useEffect(() => setRuntime(quickJs.newRuntime(props.options)), [props.options]);

    return <JsRuntimeContext.Provider value={runtime} {...props} />;
  };
  Context.displayName = 'JsRuntimeProvider';
  return { default: Context };
});

export function useJsRuntime(): JsRuntime {
  const runtime = React.useContext(JsRuntimeContext);

  if (!runtime) {
    throw new Error(`No JsRuntime context found`);
  }

  return runtime;
}

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

export function evalExpression(
  runtime: JsRuntime,
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
