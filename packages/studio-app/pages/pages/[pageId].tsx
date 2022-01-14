import type { NextPage } from 'next';
import * as React from 'react';
import { useRouter } from 'next/router';
import StudioViewer from '../../src/components/StudioViewer';
import { NodeId } from '../../src/types';

const Home: NextPage = () => {
  const router = useRouter();
  return router.isReady ? <StudioViewer pageNodeId={router.query.pageId as NodeId} /> : null;
};

export default Home;
