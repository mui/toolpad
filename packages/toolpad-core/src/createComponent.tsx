import { TOOLPAD_COMPONENT } from './constants.js';
import { ArgTypeDefinition, ComponentConfig, ToolpadComponent } from './types.js';

export default function createComponent<P extends object>(
  Component: React.ComponentType<P>,
  config?: ComponentConfig<P>,
): ToolpadComponent<P> {
  return Object.assign(Component, {
    [TOOLPAD_COMPONENT]: config || { argTypes: {} },
  });
}

export function getArgTypeDefaultValue<V>(argType: ArgTypeDefinition<{}, V>): V | undefined {
  return argType.typeDef.default ?? argType.defaultValue ?? undefined;
}
