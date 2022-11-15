import { createComponent, ToolpadComponent, TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import * as ReactIs from 'react-is';
import { compileModule } from '../createRuntimeState';
import loadModule from './loadModule';

export function ensureToolpadComponent<P>(Component: unknown): ToolpadComponent<P> {
  if (!ReactIs.isValidElementType(Component) || typeof Component === 'string') {
    return createComponent(() => {
      throw new Error(`No React Component.`);
    });
  }

  if ((Component as any)[TOOLPAD_COMPONENT]) {
    return Component as ToolpadComponent<P>;
  }

  return createComponent(Component);
}

export default async function loadCodeComponent(
  src: string,
  filename: string,
): Promise<ToolpadComponent> {
  const compiledModule = compileModule(src, filename);
  const { default: Component } = await loadModule(compiledModule);

  if (!ReactIs.isValidElementType(Component) || typeof Component === 'string') {
    throw new Error(`No React Component exported.`);
  }

  return ensureToolpadComponent(Component);
}
