import { ArgTypeDefinition, BindableAttrValue, LiveBinding, Serializable } from '@mui/toolpad-core';
import { evaluateBindable } from '@mui/toolpad-core/runtime';
import { getQuickJS } from 'quickjs-emscripten';

export default async function evalBindableInRuntime<V>(
  bindable: BindableAttrValue<V> | null,
  globalScope: Record<string, Serializable>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  argType?: ArgTypeDefinition,
): Promise<LiveBinding> {
  const QuickJS = await getQuickJS();
  const runtime = QuickJS.newRuntime();
  try {
    return evaluateBindable(runtime, bindable, globalScope);
  } finally {
    runtime.dispose();
  }
}
