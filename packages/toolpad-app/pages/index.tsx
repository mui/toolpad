import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  return {
    redirect: { destination: '/_toolpad', permanent: false },
  };
};

export default function Index() {
  return null;
}
