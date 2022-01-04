import type { NextPage } from 'next';
import * as React from 'react';
import { useRouter } from 'next/router';
import client from '../src/api';
import Viewer from '../src/components/StudioViewer';
import { NodeId } from '../src/types';

const Home: NextPage = () => {
  const router = useRouter();

  const appQuery = client.useQuery('loadApp', [], {
    enabled: router.isReady,
  });

  return (
    <div>
      {(appQuery.error as any) ||
        (appQuery.data ? (
          <Viewer dom={appQuery.data} pageNodeId={router.query.pageId as NodeId} />
        ) : (
          'loading'
        ))}
    </div>
  );
};

export default Home;
