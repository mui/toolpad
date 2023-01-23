import { BindableAttrValue, BindingEvaluationResult, JsRuntime } from './types';

export const TOOLPAD_LOADING_MARKER = '__TOOLPAD_LOADING_MARKER__';

export function evaluateBindable<V>(
  ctx: JsRuntime,
  bindable: BindableAttrValue<V> | null,
  globalScope: Record<string, unknown>,
): BindingEvaluationResult {
  if (bindable?.type === 'jsExpression') {
    return ctx.evaluateExpression(bindable?.value, globalScope);
  }

  if (bindable?.type === 'const') {
    return { value: bindable?.value };
  }

  return { value: undefined };
}
