import { ArgTypeDefinition, BindableAttrValue, LiveBinding } from '@mui/toolpad-core';
import evalExpression, { Json } from './evalExpression';

export default async function evaluateBindable<V>(
  bindable: BindableAttrValue<V> | null,
  globalScope: Record<string, Json>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  argType?: ArgTypeDefinition,
): Promise<LiveBinding> {
  const execExpression = async () => {
    if (bindable?.type === 'jsExpression') {
      return evalExpression(bindable?.value, globalScope);
    }

    if (bindable?.type === 'const') {
      return bindable?.value;
    }

    return undefined;
  };

  try {
    const value = await execExpression();
    return { value };
  } catch (err) {
    return { error: err as Error };
  }
}
