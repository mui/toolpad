import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import config from '../../src/config';
import Toolpad from '../../src/toolpad';

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  if (config.cmd !== 'dev') {
    return { notFound: true };
  }

  return {
    props: {},
  };
};

const Home: NextPage = () => {
  return <Toolpad basename="/_toolpad" />;
};

export default Home;
