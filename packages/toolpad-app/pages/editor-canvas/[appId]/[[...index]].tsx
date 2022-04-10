import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import * as runtime from '@mui/toolpad-core/runtime';
import { styled } from '@mui/material';
import * as appDom from '../../../src/appDom';
import EditorCanvas from '../../../src/components/EditorCanvas';
import {
  ComponentsContextProvider,
  RenderToolpadComponentParams,
  RenderToolpadComponentProvider,
} from '../../../src/components/ToolpadApp';
import { useToolpadComponents } from '../../../src/toolpadComponents';

const EditorRoot = styled('div')({
  overflow: 'hidden',
});

interface PageProps {
  appId: string;
  dom: appDom.AppDom;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const { loadDom } = await import('../../../src/server/data');
  const appId = context.query.appId as string;
  const dom = await loadDom(appId);
  const root = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, root);
  return {
    props: {
      pageNodeId: pages,
      appId,
      dom,
    },
  };
};

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

const Index: NextPage<PageProps> = (props) => {
  const components = useToolpadComponents(props.dom);

  return (
    <ComponentsContextProvider value={components}>
      <RenderToolpadComponentProvider value={renderToolpadComponent}>
        <EditorRoot id="root">
          <EditorCanvas
            basename={`/editor-canvas/${props.appId}`}
            dom={props.dom}
            appId={props.appId}
            version="preview"
          />
        </EditorRoot>
      </RenderToolpadComponentProvider>
    </ComponentsContextProvider>
  );
};

export default Index;
