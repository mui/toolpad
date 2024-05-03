import dynamic from 'next/dynamic';
import * as React from 'react';

const ToolpadAppClient = dynamic(() => import('@toolpad/studio/next-client'), { ssr: false });

export async function getServerSideProps() {
  const { getProject } = await import('../../toolpad-server');
  const project = await getProject();
  const { getServerSideProps: getToolpadServerSideProps } = await import('@toolpad/studio/next');
  return getToolpadServerSideProps(project);
}

export default function Toolpad(props) {
  return (
    <ToolpadAppClient
      {...props}
      apiUrl="/my-next-app/api/toolpad"
      basename="/my-next-app/toolpad-pages"
    />
  );
}
