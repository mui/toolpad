import type { NextPage } from 'next';
import * as React from 'react';
import { useRouter } from 'next/router';
import { StudioPage } from '../../../lib/types';
import Editor from '../../../lib/components/StudioEditor';

const Home: NextPage = () => {
  const router = useRouter();
  const [pagedata, setPageData] = React.useState<StudioPage | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (router.query.pageId) {
      fetch(`/api/pages/${router.query.pageId}`)
        .then((res) => {
          if (res.ok) {
            return res.json().then((page) => setPageData(page));
          } 
            setError(`HTTP Error ${res.status}`);
          
        })
        .catch((err) => setError(err.message));
    }
  }, [router.query.pageId]);

  return <div>{error || (pagedata ? <Editor page={pagedata} /> : 'loading')}</div>;
};

export default Home;
