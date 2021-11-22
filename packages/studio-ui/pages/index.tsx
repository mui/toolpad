import type { NextPage } from 'next';
import * as React from 'react';
import { Button, TextField } from '@mui/material';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
  const router = useRouter();

  const [pageId, setPageId] = React.useState('');
  const [error, setError] = React.useState('');

  const handleCreateClick = React.useCallback(async () => {
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        body: JSON.stringify({ id: pageId }),
        headers: {
          'content-type': 'application/json',
        },
      });
      if (res.ok) {
        router.push(`/_studio/editor/${pageId}`);
      } else {
        setError(`failed with ${res.status}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [pageId, router]);

  return (
    <div>
      <TextField
        label="page name"
        value={pageId}
        onChange={(event) => setPageId(event.target.value)}
        error={!!error}
        helperText={error}
      />
      <Button disabled={!pageId} onClick={handleCreateClick}>
        Create
      </Button>
    </div>
  );
};

export default Home;
