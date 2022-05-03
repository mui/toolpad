import { createComponent, ToolpadComponent, TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import * as React from 'react';
import * as appDom from '../../src/appDom';
import {
  InstantiatedComponents,
  ToolpadComponentDefinition,
  ToolpadComponentDefinitions,
} from '../../src/toolpadComponents';
import { VersionOrPreview } from '../../src/types';

export interface RenderParams {
  dom: appDom.AppDom;
  editor: boolean;
  version: VersionOrPreview;
  appId: string;
  basename: string;
  components: ToolpadComponentDefinitions;
}

function instantiateComponent(def: ToolpadComponentDefinition): ToolpadComponent {
  let InstantiatedComponent: ToolpadComponent;

  const LazyComponent = React.lazy(async () => {
    const mod = await import(def.importedModule);
    const ImportedComponent = mod[def.importedName];

    // TODO: remove this warning and the '|| mod.config' further down
    if (mod.config) {
      console.error(
        `You're using a code component with config export. This is deprecated. Use "createComponent" instead`,
      );
    }

    InstantiatedComponent.defaultProps = ImportedComponent.defaultProps;

    const importedConfig = ImportedComponent[TOOLPAD_COMPONENT] || mod.config;

    // We update the componentConfig after the component is loaded
    if (importedConfig) {
      InstantiatedComponent[TOOLPAD_COMPONENT] = importedConfig;
    }

    return { default: ImportedComponent };
  });

  const LazyWrapper = React.forwardRef((props, ref) => <LazyComponent ref={ref} {...props} />);

  // We start with a lazy component with default argTypes
  InstantiatedComponent = createComponent(LazyWrapper);

  InstantiatedComponent.displayName = def.importedName;

  return InstantiatedComponent;
}

export default function instantiateComponents(
  defs: ToolpadComponentDefinitions,
): InstantiatedComponents {
  const result: InstantiatedComponents = {};

  for (const [id, def] of Object.entries(defs)) {
    if (def) {
      result[id] = {
        ...def,
        Component: instantiateComponent(def),
      };
    }
  }

  return result;
}
