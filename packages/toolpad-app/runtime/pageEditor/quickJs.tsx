import { getQuickJS, QuickJSWASMModule } from 'quickjs-emscripten';
import * as React from 'react';
import { createProvidedContext } from '../../src/utils/react';

const [useQuickJs, QuickJsContextProvider] = createProvidedContext<QuickJSWASMModule>('QuickJs');

export interface QuickJsProviderProps {
  children?: React.ReactNode;
}

export const QuickJsProvider = React.lazy(async () => {
  const quickJs = await getQuickJS();
  const Context = (props: QuickJsProviderProps) => (
    <QuickJsContextProvider value={quickJs} {...props} />
  );
  Context.displayName = 'QuickJsProvider';
  return { default: Context };
});

export { useQuickJs };
