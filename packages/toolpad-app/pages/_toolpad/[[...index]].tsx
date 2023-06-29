import type { NextPage } from 'next';
import * as React from 'react';
import Toolpad from '../../src/toolpad';

const Home: NextPage = () => {
  return <Toolpad basename="/_toolpad" />;
};

export default Home;
