import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import config from '../../src/config';
import Toolpad from '../../src/toolpad';
import { loadEnvFile } from '../../src/toolpadDataSources/local/server';

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  if (config.cmd !== 'dev') {
    return { notFound: true };
  }

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
