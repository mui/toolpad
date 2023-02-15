import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import config from '../../src/config';
import ToolpadLocal from '../../src/toolpad/ToolpadLocal';

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  if (config.cmd !== 'dev') {
    return { notFound: true };
  }

  return {
    props: {},
  };
};

const Home: NextPage = () => {
  return <ToolpadLocal basename="/_toolpad" />;
};

export default Home;
