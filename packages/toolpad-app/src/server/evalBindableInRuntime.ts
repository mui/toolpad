import { ArgTypeDefinition, BindableAttrValue, PageState, DeferredValue } from '@mui/toolpad-core';
import { evaluateBindable } from '@mui/toolpad-core/runtime';
import { getQuickJS } from 'quickjs-emscripten';

export default async function evalBindableInRuntime<V>(
  bindable: BindableAttrValue<V> | null,
  globalScope: PageState,
  argType?: ArgTypeDefinition,
): Promise<DeferredValue> {
  const QuickJS = await getQuickJS();
  const runtime = QuickJS.newRuntime();
  try {
    return evaluateBindable(runtime, bindable, globalScope, argType);
  } finally {
    runtime.dispose();
  }
}
