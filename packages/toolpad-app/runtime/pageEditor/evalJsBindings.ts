let iframe: HTMLIFrameElement;
function evaluateCode(code: string, globalScope: Record<string, unknown>) {
  // TODO: investigate https://www.npmjs.com/package/ses
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

export type BindingEvaluationResult<T = any> = {
  value?: T;
  error?: Error;
  loading?: boolean;
};

const TOOLPAD_LOADING_MARKER = '__TOOLPAD_LOADING_MARKER__';

function evaluateExpression(
  code: string,
  globalScope: Record<string, unknown>,
): BindingEvaluationResult {
  try {
    const value = evaluateCode(code, globalScope);
    return { value };
  } catch (error: any) {
    if (error?.message === TOOLPAD_LOADING_MARKER) {
      return { loading: true };
    }
    return { error: error as Error };
  }
}

export default function evalJsBindings(
  scope: Record<string, unknown>,
  boundExpressions: Record<string, string>,
  scopePathToBindingId: Record<string, string>,
) {
  console.log(scopePathToBindingId);
  const bindingIdMap = new Map(Object.entries(scopePathToBindingId));
  const bindingsMap = new Map(Object.entries(boundExpressions));

  const computationStatuses = new Map<
    string,
    | { status: 'computing' }
    | { status: 'loading' }
    | { status: 'resolved'; value: any }
    | { status: 'error'; error: Error }
  >();

  let proxiedScope: Record<string, unknown>;

  const proxify = (obj: Record<string, unknown>, label?: string): Record<string, unknown> =>
    new Proxy(obj, {
      get(target, prop, receiver) {
        if (typeof prop === 'symbol') {
          return Reflect.get(target, prop, receiver);
        }

        const scopePath = label ? `${label}.${prop}` : prop;
        const bindingId = bindingIdMap.get(scopePath);

        if (!bindingId) {
          return Reflect.get(target, prop, receiver);
        }

        const expression = bindingsMap.get(bindingId);

        if (expression) {
          const computed = computationStatuses.get(expression);
          if (computed) {
            if (computed.status === 'computing') {
              throw new Error(`Cycle detected "${scopePath}"`);
            } else if (computed.status === 'loading') {
              throw new Error(TOOLPAD_LOADING_MARKER);
            } else if (computed.status === 'error') {
              throw computed.error;
            } else {
              return computed.value;
            }
          }

          computationStatuses.set(expression, { status: 'computing' });
          const result = evaluateExpression(expression, proxiedScope);
          if (result.loading) {
            computationStatuses.set(expression, { status: 'loading' });
            throw new Error(TOOLPAD_LOADING_MARKER);
          } else if (result.error) {
            computationStatuses.set(expression, { status: 'error', error: result.error });
            throw result.error;
          } else {
            computationStatuses.set(expression, { status: 'resolved', value: result.value });
            return result.value;
          }
        }

        const result = target[prop];

        if (result && typeof result === 'object') {
          return proxify(result as Record<string, unknown>, scopePath);
        }

        return Reflect.get(target, prop, receiver);
      },
    });

  proxiedScope = proxify(scope);

  return Object.fromEntries(
    Object.entries(boundExpressions).map(([key, expression]) => [
      key,
      evaluateExpression(expression, proxiedScope),
    ]),
  );
}
