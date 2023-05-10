import { errorFrom } from '@mui/toolpad-utils/errors';
import { TOOLPAD_LOADING_MARKER } from './jsRuntime.js';
import { BindingEvaluationResult, JsRuntime } from './types.js';

function createBrowserRuntime(): JsRuntime {
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
    (iframe.contentWindow as any).console = window.console;

    return (iframe.contentWindow as any).eval(`
      (() => {
        // See https://tc39.es/ecma262/multipage/global-object.html#sec-global-object
        const ecmaGlobals = new Set([ 'globalThis', 'Infinity', 'NaN', 'undefined', 'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'AggregateError', 'Array', 'ArrayBuffer', 'BigInt', 'BigInt64Array', 'BigUint64Array', 'Boolean', 'DataView', 'Date', 'Error', 'EvalError', 'FinalizationRegistry', 'Float32Array', 'Float64Array', 'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Map', 'Number', 'Object', 'Promise', 'Proxy', 'RangeError', 'ReferenceError', 'RegExp', 'Set', 'SharedArrayBuffer', 'String', 'Symbol', 'SyntaxError', 'TypeError', 'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'URIError', 'WeakMap', 'WeakRef', 'WeakSet', 'Atomics', 'JSON', 'Math', 'Reflect' ]);

        // NOTE: This is by no means intended to be a secure way to hide DOM globals 
        const globalThis = new Proxy(window.__SCOPE, {
          has(target, name) {
            return name === 'globalThis' || Object.hasOwnProperty(target, name) || ecmaGlobals.has(name);
          },
          get(target, prop, receiver) {
            if (prop === 'globalThis') {
              return globalThis;
            }
            if (Object.hasOwnProperty(target, prop)) {
              return Reflect.get(...arguments);
            }
            if (ecmaGlobals.has(prop)) {
              return Reflect.get(window, prop, receiver);
            }
            return undefined
          },
        });

        const globalScope = new Proxy(globalThis, {
          has(target, name) {
            // catch all global access
            return true;
          },
          get(target, prop, receiver) {
            if (prop in target) {
              return Reflect.get(...arguments);
            }
            if (prop === Symbol.unscopables) {
              return undefined;
            }
            throw new ReferenceError(\`\${String(prop)} is not defined\`)
          },
        });

        with (globalScope) { 
          return (${code})
        }
      })()
    `);
  }

  function evaluateExpression(
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

  return {
    evaluateExpression,
  };
}

const browserRuntime = typeof window === 'undefined' ? null : createBrowserRuntime();
export function getBrowserRuntime(): JsRuntime {
  if (!browserRuntime) {
    throw new Error(`Can't use browser JS runtime outside of a browser`);
  }
  return browserRuntime;
}

export function useBrowserJsRuntime(): JsRuntime {
  return getBrowserRuntime();
}
