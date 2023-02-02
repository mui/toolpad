import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import config from '../../src/config';
import Toolpad from '../../src/toolpad';
import ToolpadLocal from '../../src/toolpad/ToolpadLocal';

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  if (config.localMode && config.cmd !== 'dev') {
    return { notFound: true };
  }

  return {
    props: {},
  };
};

const Home: NextPage = () => {
  return config.localMode ? (
    <ToolpadLocal basename="/_toolpad" />
  ) : (
    <Toolpad basename="/_toolpad" />
  );
};

export default Home;
