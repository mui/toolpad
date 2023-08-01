import {
  BindableAttrValue,
  EnvAttrValue,
  JsExpressionAction,
  JsExpressionAttrValue,
} from '@mui/toolpad-core';
import { NavigationAction } from './server/schema';

type BindingType =
  | 'const'
  | 'jsExpression'
  | 'env'
  | 'jsExpressionAction'
  | 'navigationAction'
  | 'secret';

export function getBindingType<V>(binding: BindableAttrValue<V>): BindingType {
  if ((binding as JsExpressionAttrValue).$$jsExpression) {
    return 'jsExpression';
  }
  if ((binding as EnvAttrValue).$$env) {
    return 'env';
  }
  if ((binding as JsExpressionAction).$$jsExpressionAction) {
    return 'jsExpressionAction';
  }
  if ((binding as NavigationAction).$$navigationAction) {
    return 'navigationAction';
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
  if ((binding as JsExpressionAttrValue).$$jsExpression) {
    return (binding as JsExpressionAttrValue).$$jsExpression;
  }
  if ((binding as EnvAttrValue).$$env) {
    return (binding as EnvAttrValue).$$env;
  }
  if ((binding as JsExpressionAction).$$jsExpressionAction) {
    return (binding as JsExpressionAction).$$jsExpressionAction;
  }
  if ((binding as NavigationAction).$$navigationAction) {
    return (binding as NavigationAction).$$navigationAction;
  }
  return binding as V;
}
