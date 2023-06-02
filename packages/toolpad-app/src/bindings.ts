import { BindableAttrValue } from '@mui/toolpad-core';

export function toBindable<V>(
  value: V | { $$jsExpression: string } | { $$env: string },
): BindableAttrValue<V> {
  if (value && typeof value === 'object' && typeof (value as any).$$jsExpression === 'string') {
    return { type: 'jsExpression', value: (value as any).$$jsExpression };
  }
  if (value && typeof value === 'object' && typeof (value as any).$$env === 'string') {
    return { type: 'env', value: (value as any).$$env };
  }
  return { type: 'const', value: value as V };
}

export function fromBindable<V>(bindable: BindableAttrValue<V>) {
  switch (bindable.type) {
    case 'const':
      return bindable.value;
    case 'jsExpression':
      return { $$jsExpression: bindable.value };
    case 'env':
      return { $$env: bindable.value };
    default:
      throw new Error(`Unsupported bindable "${bindable.type}"`);
  }
}
