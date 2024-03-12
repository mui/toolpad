import { BindableAttrValue } from '@toolpad/studio-runtime';
import { hasOwnProperty } from '@toolpad/utils/collections';

type BindingType =
  | 'const'
  | 'jsExpression'
  | 'env'
  | 'jsExpressionAction'
  | 'navigationAction'
  | 'secret';

export function getBindingType<V>(binding: BindableAttrValue<V>): BindingType {
  if (binding && typeof binding === 'object') {
    if (hasOwnProperty(binding, '$$jsExpression')) {
      return 'jsExpression';
    }
    if (hasOwnProperty(binding, '$$env')) {
      return 'env';
    }
    if (hasOwnProperty(binding, '$$jsExpressionAction')) {
      return 'jsExpressionAction';
    }
    if (hasOwnProperty(binding, '$$navigationAction')) {
      return 'navigationAction';
    }
  }
  return 'const';
}

export function getBindingValue<V>(binding: BindableAttrValue<V>):
  | V
  | string
  | {
      page: string;
      parameters?: Record<string, unknown>;
    } {
  if (binding && typeof binding === 'object') {
    if (hasOwnProperty(binding, '$$jsExpression')) {
      return binding.$$jsExpression as string;
    }
    if (hasOwnProperty(binding, '$$env')) {
      return binding.$$env as string;
    }
    if (hasOwnProperty(binding, '$$jsExpressionAction')) {
      return binding.$$jsExpressionAction as string;
    }
    if (hasOwnProperty(binding, '$$navigationAction')) {
      return binding.$$navigationAction as {
        page: string;
        parameters?: Record<string, unknown>;
      };
    }
  }
  return binding as V;
}
