let iframe: HTMLIFrameElement;

/**
 * Evaluates a javascript expression with global scope in an iframe.
 */
export default function evalExpression(code: string, globalScope: Record<string, unknown>) {
  // TODO: investigate https://www.npmjs.com/package/ses
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    iframe.style.display = 'none';
    document.documentElement.appendChild(iframe);
  }

  // eslint-disable-next-line no-underscore-dangle
  (iframe.contentWindow as any).__SCOPE = globalScope;
  (iframe.contentWindow as any).console = window.console;
  return (iframe.contentWindow as any).eval(`with (window.__SCOPE) { ${code} }`);
}
