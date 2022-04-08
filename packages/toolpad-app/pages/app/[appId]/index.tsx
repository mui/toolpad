import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import * as appDom from '../../../src/appDom';
import ToolpadApp from '../../../src/components/ToolpadApp';
import { loadDom } from '../../../src/server/data';

interface PageProps {
  dom: appDom.AppDom;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const dom = await loadDom(context.query.appId as string);
  const root = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, root);
  return {
    props: {
      pageNodeId: pages,
      dom,
    },
  };
};

const Index: NextPage<PageProps> = (props) => {
  return <ToolpadApp dom={props.dom} />;
};

export default Index;
