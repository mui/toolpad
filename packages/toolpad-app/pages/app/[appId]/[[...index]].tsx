import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import * as appDom from '../../../src/appDom';
import ToolpadApp, { ComponentsContextProvider } from '../../../runtime/canvas/ToolpadApp';
import { useToolpadComponents } from '../../../src/toolpadComponents';

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

const Index: NextPage<PageProps> = (props) => {
  const components = useToolpadComponents(props.dom);
  return (
    <ComponentsContextProvider value={components}>
      <ToolpadApp
        basename={`/app/${props.appId}`}
        dom={props.dom}
        appId={props.appId}
        version="preview"
      />
    </ComponentsContextProvider>
  );
};

export default Index;
