import * as React from 'react';
import * as runtime from '@mui/toolpad-core/runtime';
import { styled } from '@mui/material';
import { LiveBindings, RuntimeEvent } from '@mui/toolpad-core';
import { VersionOrPreview } from '../types';
import ToolpadApp, {
  ComponentsContextProvider,
  RenderToolpadComponentParams,
  RenderToolpadComponentProvider,
} from './ToolpadApp';
import * as appDom from '../appDom';
import { useToolpadComponents } from '../toolpadComponents';

export interface ToolpadBridge {
  updateDom(newDom: appDom.AppDom): void;
}

declare global {
  interface Window {
    __TOOLPAD_BRIDGE__?: ToolpadBridge;
    __TOOLPAD_RUNTIME_PAGE_STATE__?: Record<string, unknown>;
    __TOOLPAD_RUNTIME_BINDINGS_STATE__?: LiveBindings;
    __TOOLPAD_RUNTIME_EVENT__?: RuntimeEvent[] | ((event: RuntimeEvent) => void);
  }
}

const EditorRoot = styled('div')({
  overflow: 'hidden',
});

function renderToolpadComponent({
  Component,
  props,
  node,
}: RenderToolpadComponentParams): React.ReactElement {
  return (
    <runtime.NodeRuntimeWrapper nodeId={node.id}>
      <Component {...props} />
    </runtime.NodeRuntimeWrapper>
  );
}

export interface EditorCanvasProps {
  basename: string;
  appId: string;
  version: VersionOrPreview;
  dom: appDom.AppDom;
}

export default function EditorCanvas({ dom: domProp, ...props }: EditorCanvasProps) {
  const [dom, setDom] = React.useState(domProp);
  React.useEffect(() => setDom(domProp), [domProp]);

  const components = useToolpadComponents(dom);

  React.useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    window.__TOOLPAD_BRIDGE__ = {
      updateDom: (newDom) => setDom(newDom),
    };
    return () => {
      // eslint-disable-next-line no-underscore-dangle
      delete window.__TOOLPAD_BRIDGE__;
    };
  }, []);

  return (
    <ComponentsContextProvider value={components}>
      <RenderToolpadComponentProvider value={renderToolpadComponent}>
        <EditorRoot id="root">
          <ToolpadApp dom={dom} {...props} />
        </EditorRoot>
      </RenderToolpadComponentProvider>
    </ComponentsContextProvider>
  );
}
