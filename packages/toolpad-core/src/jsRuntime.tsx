import { BindableAttrValue, BindingEvaluationResult, JsRuntime } from './types.js';

export const TOOLPAD_LOADING_MARKER = '__TOOLPAD_LOADING_MARKER__';

export function evaluateBindable<V>(
  ctx: JsRuntime,
  bindable: BindableAttrValue<V> | null,
  globalScope: Record<string, unknown>,
  env?: Record<string, string>,
): BindingEvaluationResult {
  if (bindable?.type === 'jsExpression') {
    return ctx.evaluateExpression(bindable.value, globalScope);
  }

  if (bindable?.type === 'env') {
    return { value: env && env[bindable.value] };
  }

  if (bindable?.type === 'const') {
    return { value: bindable.value };
  }

  return { value: undefined };
}
