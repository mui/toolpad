import type { NextPage } from 'next';
import * as React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import client from '../../../src/api';
import Editor from '../../../src/components/StudioEditor';

const Home: NextPage = () => {
  const router = useRouter();

  const pageQuery = useQuery(
    ['page', router.query.pageId],
    () => client.query.getPage(router.query.pageId as string),
    {
      enabled: router.isReady,
    },
  );

  return (
    <div>
      {(pageQuery.error as any) || (pageQuery.data ? <Editor page={pageQuery.data} /> : 'loading')}
    </div>
  );
};

export default Home;
