import { getQuickJS, RuntimeOptions, QuickJSRuntime } from 'quickjs-emscripten';
import * as React from 'react';
import { ArgTypeDefinition, BindableAttrValue, EvalScope, LiveBinding } from './types';
import evalExpression from './evalExpression';

const JsRuntimeContext = React.createContext<QuickJSRuntime | null>(null);

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

export function useJsRuntime(): QuickJSRuntime {
  const runtime = React.useContext(JsRuntimeContext);

  if (!runtime) {
    throw new Error(`No JsRuntime contetx found`);
  }

  return runtime;
}

export function evaluateBindable<V>(
  jsRuntime: QuickJSRuntime,
  bindable: BindableAttrValue<V> | null,
  globalScope: EvalScope,
  argType?: ArgTypeDefinition,
): LiveBinding {
  const getValue = () => {
    if (bindable?.type === 'jsExpression') {
      if (argType?.typeDef.type === 'function') {
        const expression = `(${bindable?.value})()`;
        return () => evalExpression(jsRuntime, expression, globalScope);
      }
      return evalExpression(jsRuntime, bindable?.value, globalScope);
    }

    if (bindable?.type === 'const') {
      return bindable?.value;
    }

    return undefined;
  };

  try {
    const value = getValue();
    return { value };
  } catch (err) {
    return { error: err as Error };
  }
}

export type JsRuntime = QuickJSRuntime;
