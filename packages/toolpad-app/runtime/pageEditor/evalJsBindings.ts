import { set } from 'lodash-es';

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

export interface ParsedBinding {
  controlled?: boolean;
  /**
   * How this binding presents itself to expressions in the global scope.
   * Path in the form that is accepted by lodash.set
   */
  scopePath?: string;
  /**
   * javascript expression that evaluates to the value of this binding
   */
  expression?: string;
  /**
   * actual evaluated result of the binding
   */
  result?: BindingEvaluationResult;
}

export function buildGlobalScope(bindings: Record<string, ParsedBinding>): Record<string, unknown> {
  const globalScope = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const binding of Object.values(bindings)) {
    if (binding.scopePath) {
      const value = binding.result?.value;
      set(globalScope, binding.scopePath, value);
    }
  }
  return globalScope;
}

export default function evalJsBindings(
  bindings: Record<string, ParsedBinding>,
): Record<string, ParsedBinding> {
  const boundValues: Record<string, BindingEvaluationResult> = {};
  const boundExpressions: Record<string, string> = {};
  const scopePathToBindingId: Record<string, string> = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, binding] of Object.entries(bindings)) {
    boundValues[key] = binding.result || { value: undefined };
    if (binding.expression) {
      boundExpressions[key] = binding.expression;
    }
    if (binding.scopePath) {
      scopePathToBindingId[binding.scopePath] = key;
    }
  }

  const scope = buildGlobalScope(bindings);

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
    Object.entries(bindings).map(([bindingId, binding]) => {
      const { expression, result, ...rest } = binding;
      return [
        bindingId,
        {
          ...rest,
          result: expression
            ? evaluateExpression(expression, proxiedScope)
            : result || { value: undefined },
        },
      ];
    }),
  );
}
