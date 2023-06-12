import invariant from 'invariant';
import { mapValues } from '@mui/toolpad-utils/collections';
import * as appDom from '..';
import * as v7LegacyAppDom from './types/v7Down';

function updateBindingSyntax<V>(value: V): unknown {
  if ((value as v7LegacyAppDom.JsExpressionAttrValue)?.type === 'jsExpression') {
    return { $jsExpression: (value as v7LegacyAppDom.JsExpressionAttrValue).value };
  }
  if ((value as v7LegacyAppDom.EnvAttrValue)?.type === 'env') {
    return { $env: (value as v7LegacyAppDom.EnvAttrValue).value };
  }
  if ((value as v7LegacyAppDom.JsExpressionAction)?.type === 'jsExpressionAction') {
    return { $jsExpressionAction: (value as v7LegacyAppDom.JsExpressionAction).value };
  }
  if ((value as v7LegacyAppDom.NavigationAction)?.type === 'navigationAction') {
    return { $navigationAction: (value as v7LegacyAppDom.NavigationAction).value };
  }
  if ((value as v7LegacyAppDom.SecretAttrValue<V>)?.type === 'secret') {
    return { $secret: (value as v7LegacyAppDom.SecretAttrValue<V>).value };
  }
  if ((value as v7LegacyAppDom.ConstantAttrValue<V>)?.type === 'const') {
    return updateBindingSyntax((value as v7LegacyAppDom.ConstantAttrValue<V>).value);
  }
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map((valueItem) => updateBindingSyntax(valueItem));
    }
    return mapValues(value, (valuePropValue) => updateBindingSyntax(valuePropValue));
  }
  return value;
}

export default {
  up(dom: v7LegacyAppDom.AppDom): appDom.AppDom {
    invariant(dom.version === 6, 'Can only migrate dom of version 6');
    return {
      ...dom,
      nodes: updateBindingSyntax<v7LegacyAppDom.AppDomNodes>(dom.nodes) as appDom.AppDomNodes,
      version: 7,
    };
  },
};
