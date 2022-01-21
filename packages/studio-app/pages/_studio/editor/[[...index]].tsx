import { NoSsr } from '@mui/material';
import type { NextPage } from 'next';
import * as React from 'react';
import StudioEditor from '../../../src/components/StudioEditor';

const Home: NextPage = () => {
  return (
    <NoSsr>
      <StudioEditor />
    </NoSsr>
  );
};

export default Home;
