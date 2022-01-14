import type { NextPage } from 'next';
import * as React from 'react';
import { useRouter } from 'next/router';
import Viewer from '../../src/components/StudioViewer';
import { NodeId } from '../../src/types';

const Home: NextPage = () => {
  const router = useRouter();
  return <Viewer pageNodeId={router.query.pageId as NodeId} />;
};

export default Home;
