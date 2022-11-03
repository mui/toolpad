import { getQuickJS, RuntimeOptions, QuickJSRuntime } from 'quickjs-emscripten';
import * as React from 'react';
import { ArgTypeDefinition, BindableAttrValue, LiveBinding } from './types';

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

export function evaluateBindable<V>(
  bindable: BindableAttrValue<V> | null,
  globalScope: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  argType?: ArgTypeDefinition,
): LiveBinding {
  const execExpression = () => {
    if (bindable?.type === 'jsExpression') {
      return evalCode(bindable?.value, globalScope);
    }

    if (bindable?.type === 'const') {
      return bindable?.value;
    }

    return undefined;
  };

  try {
    const value = execExpression();
    return { value };
  } catch (err) {
    return { error: err as Error };
  }
}
