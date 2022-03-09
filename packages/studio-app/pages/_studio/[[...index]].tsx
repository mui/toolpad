import { NoSsr } from '@mui/material';
import type { NextPage } from 'next';
import * as React from 'react';
import Studio from '../../src/components/Studio';

const Home: NextPage = () => {
  return (
    <NoSsr>
      <Studio basename="/_studio" />
    </NoSsr>
  );
};

export default Home;
