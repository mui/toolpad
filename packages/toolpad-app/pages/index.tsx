import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import Home from '../src/toolpad/Apps';

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  return {
    redirect: { destination: '/_toolpad', permanent: true },
  };
};

const Index: NextPage = () => <Home />;
export default Index;
