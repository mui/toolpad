import { createComponent, ToolpadComponent, TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import * as React from 'react';
import ReactIs from 'react-is';
import * as appDom from '../../src/appDom';
import {
  InstantiatedComponents,
  ToolpadComponentDefinition,
  ToolpadComponentDefinitions,
} from '../../src/toolpadComponents';
import { VersionOrPreview } from '../../src/types';
import createCodeComponent from '../codeComponentEditor/createCodeComponent';
import * as builtins from '../components';

export interface RenderParams {
  dom: appDom.AppDom;
  editor: boolean;
  version: VersionOrPreview;
  appId: string;
  basename: string;
  components: ToolpadComponentDefinitions;
}

function instantiateComponent(
  dom: appDom.AppDom,
  def: ToolpadComponentDefinition,
): ToolpadComponent {
  let InstantiatedComponent: ToolpadComponent;

  const LazyComponent = React.lazy(async () => {
    let ImportedComponent: ToolpadComponent = () => null;

    if (def.builtin) {
      const builtin = (builtins as any)[def.builtin];

      if (!ReactIs.isValidElementType(builtin) || typeof builtin === 'string') {
        throw new Error(`Invalid builtin component imported "${def.builtin}"`);
      }

      ImportedComponent = builtin;
    } else if (def.codeComponentId) {
      const codeComponentNode = appDom.getNode(dom, def.codeComponentId, 'codeComponent');
      ImportedComponent = await createCodeComponent(codeComponentNode.attributes.code.value);
    } else if (def.importedModule) {
      const mod = await import(/* webpackIgnore: true */ def.importedModule);
      ImportedComponent = mod[def.importedName || 'default'];

      // TODO: remove this warning and the '|| mod.config' further down
      if (mod.config) {
        console.error(
          `You're using a code component with config export. This is deprecated. Use "createComponent" instead`,
        );
        ImportedComponent[TOOLPAD_COMPONENT] = mod.config;
      }
    }

    InstantiatedComponent.defaultProps = ImportedComponent.defaultProps;

    const importedConfig = ImportedComponent[TOOLPAD_COMPONENT];

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
  dom: appDom.AppDom,
  defs: ToolpadComponentDefinitions,
): InstantiatedComponents {
  const result: InstantiatedComponents = {};

  for (const [id, def] of Object.entries(defs)) {
    if (def) {
      result[id] = {
        ...def,
        Component: instantiateComponent(dom, def),
      };
    }
  }

  return result;
}
