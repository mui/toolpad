import type { NextPage } from 'next';
import * as React from 'react';
import { Button, Container, Typography } from '@mui/material';

const Home: NextPage = () => {
  return (
    <React.Fragment>
      <Container>
        <Typography variant="h4">Apps</Typography>
        <Button component="a" href="/_studio/app/default/editor">
          Editor
        </Button>
      </Container>
    </React.Fragment>
  );
};

export default Home;
