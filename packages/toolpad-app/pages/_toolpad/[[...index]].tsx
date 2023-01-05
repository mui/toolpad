import type { NextPage } from 'next';
import * as React from 'react';
import config from '../../src/config';
import Toolpad from '../../src/toolpad';
import ToolpadLocal from '../../src/toolpad/ToolpadLocal';

const Home: NextPage = () => {
  return config.localMode ? (
    <ToolpadLocal basename="/_toolpad" />
  ) : (
    <Toolpad basename="/_toolpad" />
  );
};

export default Home;
