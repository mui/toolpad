import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import config from '../../src/config';
import Toolpad from '../../src/toolpad';

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  if (config.cmd !== 'dev') {
    return { notFound: true };
  }

  const { loadEnvFile } = await import('../../src/toolpadDataSources/local/server');
  const envFile = await loadEnvFile();
  const envVarNames = Object.keys(envFile);

  return {
    props: {
      envVarNames,
    },
  };
};

interface HomeProps {
  envVarNames: string[];
}

const Home: NextPage<HomeProps> = (props) => <Toolpad basename="/_toolpad" {...props} />;

export default Home;
