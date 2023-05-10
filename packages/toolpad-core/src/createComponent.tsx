import * as ReactIs from 'react-is';
import { hasOwnProperty } from '@mui/toolpad-utils/collections';
import { satisfies } from 'semver';
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

export default function createComponent<P extends object>(
  Component: React.ComponentType<P>,
  config?: ComponentConfig<P>,
): ToolpadComponent<P> {
  if (config?.argTypes) {
    for (const [name, argType] of Object.entries(config.argTypes)) {
      const maybeLegacyargtype = argType as MaybeLegacyArgTypeDefinition;
      if (maybeLegacyargtype.typeDef) {
        console.warn(`Detected legacy argType definition for "${name}".`);
        Object.assign(maybeLegacyargtype, maybeLegacyargtype.typeDef);
        delete maybeLegacyargtype.typeDef;
      }
    }
  }
  return Object.assign(Component, {
    [TOOLPAD_COMPONENT]: config || { argTypes: {} },
  });
}

export function getArgTypeDefaultValue<V>(argType: ArgTypeDefinition<{}, V>): V | undefined {
  return argType.default ?? argType.defaultValue ?? undefined;
}

export function createToolpadComponentThatThrows(error: Error) {
  return createComponent(() => {
    throw error;
  });
}
