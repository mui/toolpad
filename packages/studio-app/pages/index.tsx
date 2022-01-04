import type { NextPage } from 'next';
import * as React from 'react';
import { Button, Container } from '@mui/material';
import StudioAppBar from '../src/components/StudioAppBar';
import { NextLinkComposed } from '../src/components/Link';

const Home: NextPage = () => {
  return (
    <React.Fragment>
      <StudioAppBar actions={null} />
      <Container>
        <Button component={NextLinkComposed} to="/_studio/editor">
          Editor
        </Button>
      </Container>
    </React.Fragment>
  );
};

export default Home;
