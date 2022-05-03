import { createComponent, ToolpadComponent, TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import * as appDom from '../../src/appDom';
import { HTML_ID_APP_ROOT, HTML_ID_TOOLPAD_APP_RENDER_PARAMS } from '../../src/constants';
import {
  InstantiatedComponents,
  ToolpadComponentDefinition,
  ToolpadComponentDefinitions,
} from '../../src/toolpadComponents';
import { VersionOrPreview } from '../../src/types';
import EditorCanvas from './EditorSandbox';
import ToolpadApp from './ToolpadApp';

export interface ComponentSpec {
  importedModule: string;
  importedName: string;
}

export interface ComponentSpecs {
  [id: string]: ComponentSpec;
}

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

function instantiateComponents(defs: ToolpadComponentDefinitions): InstantiatedComponents {
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

export default function renderToolpadApp() {
  const container = document.getElementById(HTML_ID_APP_ROOT);
  if (!container) {
    throw new Error(`Can't locate app container #${HTML_ID_APP_ROOT}`);
  }
  const root = createRoot(container);

  const renderParamsContainer = document.getElementById(HTML_ID_TOOLPAD_APP_RENDER_PARAMS);
  if (!renderParamsContainer) {
    throw new Error(`Can't locate dom container #${HTML_ID_TOOLPAD_APP_RENDER_PARAMS}`);
  }
  const renderParams: RenderParams = JSON.parse(renderParamsContainer.innerHTML);

  const RootElement = renderParams.editor ? EditorCanvas : ToolpadApp;

  const components = instantiateComponents(renderParams.components);

  root.render(
    <RootElement
      dom={renderParams.dom}
      basename={renderParams.basename}
      appId={renderParams.appId}
      version={renderParams.version}
      components={components}
    />,
  );
}
