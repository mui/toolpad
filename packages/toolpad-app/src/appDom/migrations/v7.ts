import invariant from 'invariant';
import { mapValues } from '@mui/toolpad-utils/collections';
import { BindableAttrValue } from './v7LegacyTypes';
import * as appDom from '..';
import * as v7LegacyAppDom from './v7LegacyTypes';

function updateBindingSyntax<V>(binding: BindableAttrValue<V>) {
  if (binding.type === 'jsExpression') {
    return { $$jsExpression: binding.value };
  }
  if (binding.type === 'env') {
    return { $$env: binding.value };
  }
  if (binding.type === 'jsExpressionAction') {
    return { $$jsExpressionAction: binding.value };
  }
  if (binding.type === 'navigationAction') {
    return { $$navigationAction: binding.value };
  }
  if (binding.type === 'secret') {
    return { $$secret: binding.value };
  }
  if (binding.type === 'const') {
    return binding.value;
  }
  return binding;
}

function updateBindingsSyntax(value: any): any {
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map((valueItem) =>
        valueItem?.type && valueItem?.value
          ? updateBindingSyntax(valueItem)
          : updateBindingsSyntax(valueItem),
      );
    }

    return mapValues(value, (valuePropValue) =>
      valuePropValue?.type && valuePropValue?.value
        ? updateBindingSyntax(valuePropValue)
        : updateBindingsSyntax(valuePropValue),
    );
  }
  return value;
}

export default {
  up(dom: v7LegacyAppDom.AppDom): appDom.AppDom {
    invariant(dom.version === 6, 'Can only migrate dom of version 6');

    return {
      ...dom,
      nodes: updateBindingsSyntax(dom.nodes),
      version: 7,
    };
  },
};
