import * as React from 'react';
import { createRoot } from 'react-dom/client';
import * as appDom from '../../src/appDom';
import { HTML_ID_APP_ROOT, HTML_ID_TOOLPAD_APP_RENDER_PARAMS } from '../../src/constants';
import {
  InstantiatedComponents,
  ToolpadComponentDefinition,
  ToolpadComponentDefinitions,
} from '../../src/toolpadComponents/componentDefinition';
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

function instantiateComponent<P = {}>(def: ToolpadComponentDefinition): React.ComponentType {
  const LazyComponent = React.lazy(async () => {
    const mod = await import(def.importedModule);
    return { default: mod[def.importedName] };
  });

  const Component = React.forwardRef<any, P>((props, ref) => (
    // TODO: fallback
    <React.Suspense fallback={null}>
      <LazyComponent ref={ref} {...props} />
    </React.Suspense>
  ));

  Component.displayName = def.importedName;

  // @ts-expect-error This is an error in @types/react@^17
  return Component;
}

function instantiateComponents(defs: ToolpadComponentDefinitions): InstantiatedComponents {
  const result: InstantiatedComponents = {};

  // eslint-disable-next-line no-restricted-syntax
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
