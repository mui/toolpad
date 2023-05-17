import * as ReactIs from 'react-is';
import { hasOwnProperty } from '@mui/toolpad-utils/collections';
import { TOOLPAD_COMPONENT } from './constants.js';
import { ArgTypeDefinition, ComponentConfig, PropValueType, ToolpadComponent } from './types.js';

export function isToolpadComponent(
  maybeComponent: unknown,
): maybeComponent is ToolpadComponent<any> {
  if (
    !ReactIs.isValidElementType(maybeComponent) ||
    typeof maybeComponent === 'string' ||
    !hasOwnProperty(maybeComponent, TOOLPAD_COMPONENT)
  ) {
    return false;
  }

  return true;
}

type MaybeLegacyArgTypeDefinition = ArgTypeDefinition & { typeDef?: PropValueType };

/**
 * Marks the wrapped React component as a Toolpad compatible component.
 * This makes it available in the Toolpad editor.
 * Optionally, you can pass a configuration object to specify the component's argument types.
 * Argument types define the properties that can be set in the Toolpad editor for this component.
 * Additionally, you'll be able to bind page state to these properties.
 * @param Component The React component to wrap.
 * @param config The configuration for the component.
 */
export default function createComponent<P extends object>(
  Component: React.ComponentType<P>,
  config?: ComponentConfig<P>,
): ToolpadComponent<P> {
  // TODO: Remove post beta
  if (config?.argTypes) {
    for (const [name, argType] of Object.entries(config.argTypes)) {
      const maybeLegacyArgtype = argType as MaybeLegacyArgTypeDefinition;
      if (maybeLegacyArgtype.typeDef) {
        console.warn(`Detected deprecated argType definition for "${name}".`);
        Object.assign(maybeLegacyArgtype, maybeLegacyArgtype.typeDef);
        delete maybeLegacyArgtype.typeDef;
      }
    }
  }
  return Object.assign(Component, {
    [TOOLPAD_COMPONENT]: config || { argTypes: {} },
  });
}

export function getArgTypeDefaultValue<P extends object, K extends keyof P>(
  argType: ArgTypeDefinition<P, K>,
): P[K] | undefined {
  return argType.default ?? argType.defaultValue ?? undefined;
}

export function createToolpadComponentThatThrows(error: Error) {
  return createComponent(() => {
    throw error;
  });
}
