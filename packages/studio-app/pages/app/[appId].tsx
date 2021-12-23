import type { NextPage } from 'next';
import * as React from 'react';
import { Container } from '@mui/material';
import StudioAppBar from '../../src/components/StudioAppBar';

const Home: NextPage = () => {
  return (
    <React.Fragment>
      <StudioAppBar actions={null} />
      <Container>Application</Container>
    </React.Fragment>
  );
};

export default Home;
