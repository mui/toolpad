import { ArgTypeDefinition, BindableAttrValue, PageState, LiveBinding } from '@mui/toolpad-core';
import { evaluateBindable } from '@mui/toolpad-core/runtime';
import { getQuickJS } from 'quickjs-emscripten';

export default async function evalBindableInRuntime<V>(
  bindable: BindableAttrValue<V> | null,
  globalScope: PageState,
  argType?: ArgTypeDefinition,
): Promise<LiveBinding> {
  const QuickJS = await getQuickJS();
  const runtime = QuickJS.newRuntime();
  try {
    return evaluateBindable(runtime, bindable, globalScope, argType);
  } finally {
    runtime.dispose();
  }
}
