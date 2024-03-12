import getComponentDisplayName from '@toolpad/utils/react';
import { TOOLPAD_COMPONENT } from './constants';
import { ArgTypeDefinition, ComponentConfig, PropValueType, ToolpadComponent } from './types';

type MaybeLegacyArgTypeDefinition = ArgTypeDefinition & { typeDef?: PropValueType };

/**
 * Marks the wrapped React component as a Toolpad Studio compatible component.
 * This makes it available in the Toolpad Studio editor.
 * Optionally, you can pass a configuration object to specify the component's argument types.
 * Argument types define the properties that can be set in the Toolpad Studio editor for this component.
 * Additionally, you'll be able to bind page state to these properties.
 * @param Component The React component to wrap.
 * @param config The configuration for the component.
 */
export function createComponent<P extends object>(
  Component: React.ComponentType<P>,
  config?: ComponentConfig<P>,
): ToolpadComponent<P> {
  // TODO: Remove post beta
  if (config?.argTypes) {
    for (const [name, argType] of Object.entries(config.argTypes)) {
      const maybeLegacyArgtype = argType as MaybeLegacyArgTypeDefinition;
      if (maybeLegacyArgtype.typeDef) {
        const componentName = getComponentDisplayName(Component);
        console.warn(
          `Detected deprecated argType definition for "${name}" in the "${componentName}" component.`,
        );
        Object.assign(maybeLegacyArgtype, maybeLegacyArgtype.typeDef);
        delete maybeLegacyArgtype.typeDef;
      }
    }
  }
  return Object.assign(Component, {
    [TOOLPAD_COMPONENT]: config || { argTypes: {} },
  });
}
