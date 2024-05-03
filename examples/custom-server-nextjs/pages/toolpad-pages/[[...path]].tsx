import dynamic from 'next/dynamic';
import * as React from 'react';

const ToolpadAppClient = dynamic(() => import('@toolpad/studio/next-client'), { ssr: false });

export async function getServerSideProps() {
  // const { default: project } = await import('../../toolpad-server');
  const { getServerSideProps: getToolpadServerSideProps } = await import('@toolpad/studio/next');
  return getToolpadServerSideProps({ dir: './toolpad', base: '/my-next-app/toolpad-pages' });
}

export default function Toolpad(props) {
  return <ToolpadAppClient {...props} apiUrl="/my-next-app/api/toolpad" />;
}
