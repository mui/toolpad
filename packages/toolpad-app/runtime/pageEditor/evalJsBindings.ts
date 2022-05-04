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

function unwrapEvaluationResult(result: BindingEvaluationResult) {
  if (result.loading) {
    throw new Error(TOOLPAD_LOADING_MARKER);
  } else if (result.error) {
    throw result.error;
  } else {
    return result.value;
  }
}

export default function evalJsBindings(
  scope: Record<string, unknown>,
  boundValues: Record<string, BindingEvaluationResult>,
  boundExpressions: Record<string, string>,
  scopePathToBindingId: Record<string, string>,
) {
  const bindingIdMap = new Map(Object.entries(scopePathToBindingId));
  const bindingsMap = new Map(Object.entries(boundExpressions));

  const computationStatuses = new Map<
    string,
    { status: 'computing' } | { status: 'computed'; result: BindingEvaluationResult }
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

        if (bindingId) {
          const expression = bindingsMap.get(bindingId);

          if (expression) {
            const computed = computationStatuses.get(expression);
            if (computed) {
              if (computed.status === 'computing') {
                throw new Error(`Cycle detected "${scopePath}"`);
              } else {
                // From cache
                return unwrapEvaluationResult(computed.result);
              }
            }

            computationStatuses.set(expression, { status: 'computing' });
            const result = evaluateExpression(expression, proxiedScope);
            computationStatuses.set(expression, { status: 'computed', result });
            // From freshly computed
            return unwrapEvaluationResult(result);
          }

          const boundValue = boundValues[bindingId];

          if (boundValue) {
            // From input value on the page
            return unwrapEvaluationResult(boundValue);
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
