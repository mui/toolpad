import { TOOLPAD_COMPONENT } from './constants';
import { ComponentConfig, ToolpadComponent } from './types';

export default function createComponent<P>(
  Component: React.ComponentType<P>,
  config?: ComponentConfig<P>,
): ToolpadComponent<P> {
  return Object.assign(Component, {
    [TOOLPAD_COMPONENT]: config || { argTypes: {} },
  });
}
