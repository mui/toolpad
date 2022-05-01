import {
  getQuickJS,
  RuntimeOptions,
  QuickJSRuntime,
  QuickJSContext,
  QuickJSHandle,
} from 'quickjs-emscripten';
import { QuickJSUnwrapError } from 'quickjs-emscripten/dist/errors';
import * as React from 'react';
import { EvalScope, DeferredValue, DeferredError, Serializable } from './types';

export type JsRuntime = QuickJSRuntime;

const LOADING_MARKER = '__TOOLPAD_DEFERRED_LOADING__';

export interface DeferredValueInput {
  error?: DeferredError;
  loading?: boolean;
}

export interface DeferredValueInputs {
  [parentPath: string]: {
    [property: string]: DeferredValueInput;
  };
}

export interface GlobalScope {
  values: Record<string, Serializable>;
}

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

function newJsValue(ctx: QuickJSContext, json: Serializable): QuickJSHandle {
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
          const valueHandle = newJsValue(ctx, value);
          ctx.setProp(result, i, valueHandle);
          valueHandle.dispose();
        });
        return result;
      }
      const result = ctx.newObject();
      Object.entries(json).forEach(([key, value]) => {
        const valueHandle = newJsValue(ctx, value);
        ctx.setProp(result, key, valueHandle);
        valueHandle.dispose();
      });
      return result;
    }
    case 'function': {
      const result = ctx.newFunction('anonymous', (...args) => {
        const dumpedArgs: Serializable[] = args.map((arg) => ctx.dump(arg));
        const fnResult = json(...dumpedArgs);
        return newJsValue(ctx, fnResult);
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
  deferreds: DeferredValueInputs = {},
): DeferredValue {
  Object.entries(globalScope).forEach(([globalVar, value]) => {
    const valueHandle = newJsValue(ctx, value);
    ctx.setProp(ctx.global, globalVar, valueHandle);
    valueHandle.dispose();
  });

  Object.entries(deferreds).forEach(([parentPath, properties]) => {
    ctx
      .unwrapResult(
        ctx.evalCode(`
          ${parentPath} = new Proxy(${parentPath}, {
            get(target, prop, receiver) {
              const properties = new Map(${JSON.stringify(Object.entries(properties))});

              const deferred = properties.get(prop);
              if (deferred) {
                if (typeof deferred.error !== 'undefined') {
                  throw deferred.error;
                }

                if (deferred.loading) {
                  throw ${JSON.stringify(LOADING_MARKER)};
                }
              }
              
              return Reflect.get(...arguments);
            }
          })
        `),
      )
      .dispose();
  });

  const evalResult = ctx.evalCode(expression);
  try {
    const unwrapped = ctx.unwrapResult(evalResult);
    const jsValue = ctx.dump(unwrapped);
    unwrapped.dispose();
    return { value: jsValue };
  } catch (error: any) {
    const cause = (error as QuickJSUnwrapError).cause;
    if (cause === LOADING_MARKER) {
      return { loading: true };
    }
    return { error: cause as DeferredError };
  }
}

export function evalExpression(
  runtime: JsRuntime,
  expression: string,
  globalScope: EvalScope = {},
  deferreds: DeferredValueInputs = {},
): DeferredValue {
  const ctx = runtime.newContext();
  try {
    return evalExpressionInContext(ctx, expression, globalScope, deferreds);
  } finally {
    ctx.dispose();
  }
}
