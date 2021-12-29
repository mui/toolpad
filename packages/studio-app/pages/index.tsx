import type { NextPage } from 'next';
import * as React from 'react';
import { Button, Container, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import StudioAppBar from '../src/components/StudioAppBar';
import client from '../src/api';

const Home: NextPage = () => {
  const router = useRouter();

  const [pageId, setPageId] = React.useState('');
  const [error, setError] = React.useState('');

  const handleCreateClick = React.useCallback(async () => {
    try {
      await client.mutation.addPage(pageId);
      router.push(`/_studio/editor/${pageId}`);
    } catch (err: any) {
      setError(err.message);
    }
  }, [pageId, router]);

  return (
    <React.Fragment>
      <StudioAppBar actions={null} />
      <Container>
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
      </Container>
    </React.Fragment>
  );
};

export default Home;
