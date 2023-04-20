import type { GetServerSideProps } from 'next';
import config from '../src/config';

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  if (config.cmd === 'start') {
    return {
      redirect: { destination: '/prod', permanent: false },
    };
  }
  return {
    redirect: { destination: '/_toolpad', permanent: false },
  };
};

export default function Index() {
  return null;
}
