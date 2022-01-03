import type { NextPage } from 'next';
import * as React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import client from '../../../src/api';
import Editor from '../../../src/components/StudioEditor';

const Home: NextPage = () => {
  const router = useRouter();

  const appQuery = useQuery(['app'], () => client.query.loadApp(), {
    enabled: router.isReady,
  });

  return (
    <div>
      {(appQuery.error as any) || (appQuery.data ? <Editor dom={appQuery.data} /> : 'loading')}
    </div>
  );
};

export default Home;
