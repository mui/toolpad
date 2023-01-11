import { getQuickJS, RuntimeOptions, QuickJSRuntime } from 'quickjs-emscripten';
import * as React from 'react';
import { BindableAttrValue, BindingEvaluationResult } from './types';
import { errorFrom } from './utils/errors';

const JsRuntimeContext = React.createContext<QuickJSRuntime | null>(null);

export interface JsRuntimeProviderProps {
  options?: RuntimeOptions;
  children?: React.ReactNode;
}

export const JsRuntimeProvider = React.lazy(async () => {
  const quickJs = await getQuickJS();
  function Context(props: JsRuntimeProviderProps) {
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
  }
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

let iframe: HTMLIFrameElement;
function evalCode(code: string, globalScope: Record<string, unknown>) {
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    iframe.style.display = 'none';
    document.documentElement.appendChild(iframe);
  }

  // eslint-disable-next-line no-underscore-dangle
  (iframe.contentWindow as any).__SCOPE = globalScope;
  return (iframe.contentWindow as any).eval(`with (window.__SCOPE) { ${code} }`);
}

export const TOOLPAD_LOADING_MARKER = '__TOOLPAD_LOADING_MARKER__';

export function evaluateExpression(
  code: string,
  globalScope: Record<string, unknown>,
): BindingEvaluationResult {
  try {
    const value = evalCode(code, globalScope);
    return { value };
  } catch (rawError) {
    const error = errorFrom(rawError);
    if (error?.message === TOOLPAD_LOADING_MARKER) {
      return { loading: true };
    }
    return { error: error as Error };
  }
}

export function evaluateBindable<V>(
  bindable: BindableAttrValue<V> | null,
  globalScope: Record<string, unknown>,
): BindingEvaluationResult {
  if (bindable?.type === 'jsExpression') {
    return evaluateExpression(bindable?.value, globalScope);
  }

  if (bindable?.type === 'const') {
    return { value: bindable?.value };
  }

  return { value: undefined };
}
