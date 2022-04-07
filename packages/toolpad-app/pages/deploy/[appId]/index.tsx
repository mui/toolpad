import type { NextPage } from 'next';
import * as React from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { asArray } from '../../../src/utils/collections';
import client from '../../../src/api';
import AppOverview from '../../../src/components/AppOverview';
import ToolpadShell from '../../../src/components/ToolpadShell';

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

  if (!appId || isLoading) {
    return (
      <ToolpadShell>
        <Box flex={1} display="flex" alignItems="center" justifyContent="center" height="100%">
          <CircularProgress />
        </Box>
      </ToolpadShell>
    );
  }

  return activeDeployment ? (
    <ToolpadShell>
      <Deployment appId={appId} version={activeDeployment.release.version} />
    </ToolpadShell>
  ) : (
    <ToolpadShell>
      <Box flex={1} display="flex" alignItems="center" justifyContent="center" height="100%">
        <Typography>Not deployed yet (TODO: show instructions here)</Typography>
      </Box>
    </ToolpadShell>
  );
};

export default Deploy;
