import * as React from 'react';
import * as runtime from '@mui/toolpad-core/runtime';
import { styled } from '@mui/material';
import { VersionOrPreview } from '../types';
import ToolpadApp, {
  ComponentsContextProvider,
  RenderToolpadComponentParams,
  RenderToolpadComponentProvider,
} from './ToolpadApp';
import * as appDom from '../appDom';
import { useToolpadComponents } from '../toolpadComponents';

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

export default function EditorCanvas(props: EditorCanvasProps) {
  const components = useToolpadComponents(props.dom);

  return (
    <ComponentsContextProvider value={components}>
      <RenderToolpadComponentProvider value={renderToolpadComponent}>
        <EditorRoot id="root">
          <ToolpadApp {...props} />
        </EditorRoot>
      </RenderToolpadComponentProvider>
    </ComponentsContextProvider>
  );
}
