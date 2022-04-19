import { Button, Container, Toolbar, Typography, Box } from '@mui/material';
import { DataGridPro, GridActionsCellItem, GridColumns, GridRowParams } from '@mui/x-data-grid-pro';
import * as React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useParams } from 'react-router-dom';
import client from '../api';
import * as appDom from '../appDom';
import { NodeId } from '../types';
import ToolpadAppShell from './ToolpadAppShell';

interface NavigateToReleaseActionProps {
  appId: string;
  version?: number;
  pageNodeId: NodeId;
}

function NavigateToReleaseAction({ appId, version, pageNodeId }: NavigateToReleaseActionProps) {
  return (
    <GridActionsCellItem
      icon={<OpenInNewIcon />}
      component="a"
      href={`/app/${appId}/${version}/pages/${pageNodeId}`}
      target="_blank"
      label="Open"
      disabled={!version}
    />
  );
}

export default function Release() {
  const { version: rawVersion, appId } = useParams();
  const version = Number(rawVersion);

  if (!appId) {
    throw new Error(`Missing queryParam "appId"`);
  }

  const releaseQuery = client.useQuery('getRelease', [appId, version]);

  const {
    data: dom,
    isLoading,
    error,
  } = client.useQuery('loadReleaseDom', version ? [appId, version] : null);
  const app = dom ? appDom.getApp(dom) : null;
  const { pages = [] } = dom && app ? appDom.getChildNodes(dom, app) : {};

  const deployReleaseMutation = client.useMutation('createDeployment');
  const activeDeploymentQuery = client.useQuery('findActiveDeployment', [appId]);

  const columns: GridColumns = React.useMemo(
    () => [
      { field: 'name' },
      { field: 'title', flex: 1 },
      {
        field: 'actions',
        type: 'actions',
        getActions: (params: GridRowParams) => [
          <NavigateToReleaseAction appId={appId} version={version} pageNodeId={params.row.id} />,
        ],
      },
    ],
    [appId, version],
  );

  const handleDeployClick = React.useCallback(async () => {
    if (version) {
      await deployReleaseMutation.mutateAsync([appId, version]);
      activeDeploymentQuery.refetch();
    }
  }, [appId, activeDeploymentQuery, deployReleaseMutation, version]);

  const isActiveDeployment = activeDeploymentQuery.data?.release.version === version;

  const canDeploy =
    deployReleaseMutation.isIdle && activeDeploymentQuery.isSuccess && !isActiveDeployment;

  return (
    <ToolpadAppShell appId={appId}>
      <Container>
        <Typography variant="h2">Release &quot;{version}&quot;</Typography>
        <Box>{releaseQuery?.data?.description}</Box>
        <Toolbar disableGutters>
          <Button
            disabled={!canDeploy}
            onClick={handleDeployClick}
            startIcon={<RocketLaunchIcon />}
          >
            Deploy
          </Button>
        </Toolbar>
        <Typography>
          {isActiveDeployment ? `Release "${version}" is currently deployed` : null}
        </Typography>
        <Box sx={{ my: 3, height: 350, width: '100%' }}>
          <DataGridPro
            rows={pages}
            columns={columns}
            density="compact"
            loading={isLoading}
            error={(error as any)?.message}
          />
        </Box>
      </Container>
    </ToolpadAppShell>
  );
}
