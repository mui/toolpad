import * as React from 'react';
import { createRoot } from 'react-dom/client';
import * as appDom from '../../src/appDom';
import { HTML_ID_APP_ROOT, HTML_ID_TOOLPAD_APP_RENDER_PARAMS } from '../../src/constants';
import { ToolpadComponentDefinitions } from '../../src/toolpadComponents';
import { VersionOrPreview } from '../../src/types';
import EditorCanvas from './EditorSandbox';
import ToolpadApp from './ToolpadApp';

export interface RenderParams {
  dom: appDom.AppDom;
  editor: boolean;
  version: VersionOrPreview;
  appId: string;
  basename: string;
  components: ToolpadComponentDefinitions;
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

  root.render(
    <RootElement
      dom={renderParams.dom}
      basename={renderParams.basename}
      appId={renderParams.appId}
      version={renderParams.version}
      components={renderParams.components}
    />,
  );
}
