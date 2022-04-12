let iframe: HTMLIFrameElement;
export function evalCode(code: string, globalScope: Record<string, unknown>) {
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

export { Placeholder, Slots, useNode } from '../appRuntime';

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export * from './useDataQuery';

export { default as useUrlQueryState } from './useUrlQueryState';

export * from './constants';
