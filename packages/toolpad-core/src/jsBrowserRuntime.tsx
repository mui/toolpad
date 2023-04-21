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
        with (window.__SCOPE) { 
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
