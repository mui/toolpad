import { ArgTypeDefinition, BindableAttrValue, LiveBinding } from '@mui/toolpad-core';
import { QuickJSContext } from 'quickjs-emscripten';
import { evalExpressionInContext, Serializable } from './evalExpression';

export default function evaluateBindable<V>(
  ctx: QuickJSContext,
  bindable: BindableAttrValue<V> | null,
  globalScope: Record<string, Serializable>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  argType?: ArgTypeDefinition,
): LiveBinding {
  const execExpression = () => {
    if (bindable?.type === 'jsExpression') {
      return evalExpressionInContext(ctx, bindable?.value, globalScope);
    }

    if (bindable?.type === 'const') {
      return bindable?.value;
    }

    return undefined;
  };

  try {
    const value = execExpression();
    return { value };
  } catch (err) {
    return { error: err as Error };
  }
}
