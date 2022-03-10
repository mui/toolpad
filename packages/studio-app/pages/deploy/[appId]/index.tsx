import type { NextPage } from 'next';
import * as React from 'react';
import { useRouter } from 'next/router';
import { Container, Typography } from '@mui/material';
import { asArray } from '../../../src/utils/collections';
import client from '../../../src/api';
import AppOverview from '../../../src/components/AppOverview';

interface PreviewProps {
  appId: string;
}

export function Preview({ appId }: PreviewProps) {
  const { data: dom } = client.useQuery('loadDom', appId ? [appId] : null);
  return dom ? <AppOverview appId={appId} dom={dom} /> : null;
}

interface DeploymentProps {
  appId: string;
  version: number;
}

function Deployment({ appId, version }: DeploymentProps) {
  const { data: dom } = client.useQuery(
    'loadReleaseDom',
    appId && version ? [appId, version] : null,
  );
  return dom ? <AppOverview appId={appId} dom={dom} /> : null;
}

const Deploy: NextPage = () => {
  const router = useRouter();
  const [appId] = asArray(router.query.appId);
  const { data: activeDeployment, isLoading } = client.useQuery(
    'findActiveDeployment',
    appId ? [appId] : null,
  );

  return appId && activeDeployment ? (
    <Deployment appId={appId} version={activeDeployment.release.version} />
  ) : (
    <Container sx={{ my: 5 }}>
      <Typography>
        {isLoading ? 'Loading...' : 'Not deployed yet (TODO: show preview app here)'}
      </Typography>
    </Container>
  );
};

export default Deploy;
