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

type BindingEvaluationResult =
  | {
      value: any;
      error?: undefined;
    }
  | {
      value?: undefined;
      error: Error;
    };

function evaluateExpression(
  code: string,
  globalScope: Record<string, unknown>,
): BindingEvaluationResult {
  try {
    const value = evaluateCode(code, globalScope);
    return { value };
  } catch (error: unknown) {
    return { error: error as Error };
  }
}

export default function evalExpressions(
  expressions: string[],
  scope: Record<string, unknown>,
  bindings: Record<string, string>,
) {
  const bindingsMap = new Map(Object.entries(bindings));

  const bindingStatuses = new Map<
    string,
    { status: 'computing' } | { status: 'resolved'; value: any } | { status: 'error'; error: Error }
  >();

  let proxiedScope: Record<string, unknown>;

  const proxify = (obj: Record<string, unknown>, label?: string): Record<string, unknown> =>
    new Proxy(obj, {
      get(target, prop, receiver) {
        if (typeof prop === 'symbol') {
          return Reflect.get(target, prop, receiver);
        }

        const thisLabel = label ? `${label}.${prop}` : prop;

        const computed = bindingStatuses.get(thisLabel);
        if (computed) {
          if (computed.status === 'computing') {
            throw new Error(`Cycle detected "${thisLabel}"`);
          } else if (computed.status === 'error') {
            throw computed.error;
          } else {
            return computed.value;
          }
        }

        const binding = bindingsMap.get(thisLabel);

        if (binding) {
          bindingStatuses.set(thisLabel, { status: 'computing' });
          const result = evaluateExpression(binding, proxiedScope);
          if (result.error) {
            bindingStatuses.set(thisLabel, { status: 'error', error: result.error });
            throw result.error;
          } else {
            bindingStatuses.set(thisLabel, { status: 'resolved', value: result.value });
            return result.value;
          }
        }

        const result = target[prop];

        if (result && typeof result === 'object') {
          return proxify(result as Record<string, unknown>, thisLabel);
        }

        return Reflect.get(target, prop, receiver);
      },
    });

  proxiedScope = proxify(scope);

  return expressions.map((expression) => evaluateExpression(expression, proxiedScope));
}
