import invariant from 'invariant';
import { ElementType, Page } from '../schema';

function updateBindingKey(key: string): string {
  switch (key) {
    case '$$jsExpression':
      return '$jsExpression';
    case '$$env':
      return '$env';
    case '$$jsExpressionAction':
      return '$jsExpressionAction';
    case '$$navigationAction':
      return '$navigationAction';
    case '$$secret':
      return '$secret';
    default:
      return key;
  }
}

function updateBindings<V>(value: V): unknown {
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map((valueItem) => updateBindings(valueItem));
    }

    const valueEntries = Object.entries(value);
    return Object.fromEntries(
      valueEntries.map(([entryKey, entryValue]) => [
        updateBindingKey(entryKey),
        updateBindings(entryValue),
      ]),
    );
  }

  return value;
}

export default {
  up(page: Page): Page {
    invariant(page.apiVersion === 'v1', 'Can only migrate page of version 1');
    return {
      ...page,
      apiVersion: 'v2',
      spec: {
        ...page.spec,
        content: updateBindings(page.spec.content) as ElementType[],
      },
    };
  },
};
